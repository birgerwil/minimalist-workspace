import { useState, useEffect } from 'react';
import {
  collection, query, onSnapshot,
  addDoc, updateDoc, doc, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { InstructionSet, Project, ThinkingLevel } from '../types';
import { TAB_TO_FIELD, TAB_TO_FILENAME, getTabContent } from '../tabConfig';
import { toast } from 'sonner';
import { OperationType, handleFirestoreError } from './useProjects';
import { User as FirebaseUser } from 'firebase/auth';

// ─── Helpers ────────────────────────────────────────────────────────────────

function updateLastModified(text: string): string {
  if (!text) return '';
  const dateStr = new Date().toISOString().split('T')[0];
  const lastModifiedLine = `Last-Modified: ${dateStr}`;
  const regex = /Last-Modified: \d{4}-\d{2}-\d{2}/;
  const cleanText = text.trim();
  if (regex.test(cleanText)) return cleanText.replace(regex, lastModifiedLine);
  if (cleanText.includes('---')) return cleanText + `\n${lastModifiedLine}`;
  return cleanText + `\n\n---\n${lastModifiedLine}`;
}

// ─── Dynamic llms.txt generator ────────────────────────────────────────────

function buildLlmsTxt(
  projectName: string,
  version: number,
  agentSkills: Array<{ name: string; content: string }>
): string {
  const today = new Date().toISOString().split('T')[0];
  const coreSkills = agentSkills.filter(s => !s.name.startsWith('audit/'));
  const auditSkills = agentSkills.filter(s => s.name.startsWith('audit/'));

  return [
    `# ${projectName}`,
    ``,
    `> AI-tunet projektdokumentation — v${version} — ${today}`,
    `> Generet af AI Tuner Workbench og klar til at indsætte i Antigravity / JetBrains / VS Code.`,
    ``,
    `## Projektdokumentation (docs/)`,
    ``,
    `### AI-Genererede filer (skræddersyet til projektet)`,
    `- /docs/SPEC.md            — Vision, user stories og success criteria`,
    `- /docs/architecture.md    — Tech stack, datamodel og systemarkitektur`,
    `- /docs/PLAN.md            — Atomiske opgaver og milestones`,
    `- /docs/AGENTS.md          — AI-team konfiguration og auditørkorps`,
    `- /docs/testing.md         — Test-suites, TDD-workflow og E2E-cases`,
    `- /docs/STATE.md           — Beslutningslog, ADR'er og åbne risici`,
    `- /docs/DESIGN.md          — UI-filosofi, design tokens og komponentbibliotek`,
    `- /llms.txt                — Dette dokument — komplet projektmap`,
    ``,
    `### Universelle Baseline-filer (pr. automatik i alle projekter)`,
    `- /docs/rules.md           — Causal Anchors og FL-regler for AI-agenter`,
    `- /docs/SKILL.md           — Kodeopskrifter og design tokens (Platform Codebook)`,
    `- /docs/workflows.md       — Index over on-demand workflows og UX-flows`,
    `- /docs/cc-log.md          — C-Suite Command Center Decision Log (/cc)`,
    `- /docs/CHANGELOG.md       — Versionsoversigt og breaking changes`,
    `- /docs/CONTRIBUTING.md    — Kodestil, branch-navngivning og PR-regler`,
    `- /docs/SECURITY.md        — Ansvarlig fremlæggelse af sikkerhedsproblemer`,
    ``,
    `## Platform Skills (.agents/skills/)`,
    ``,
    `### Core Skills`,
    ...coreSkills.map(s => `- /.agents/skills/${s.name}.md`),
    ``,
    `### Auditørkorps (.agents/skills/audit/)`,
    ...auditSkills.map(s => `- /.agents/skills/${s.name}.md`),
    ``,
    `## Aktivering`,
    ``,
    `| Kommando              | Funktion                                           |`,
    `|:----------------------|:---------------------------------------------------|`,
    `| /audit                | Chef Auditør — triage og orchestrering             |`,
    `| /audit ux             | UX Auditør — Interaction Fluency                   |`,
    `| /audit docs           | Docs Auditør — placeholder-tjek og konsistens      |`,
    `| /audit sikkerhed      | Sikkerhedsauditør — Firestore, PII, CVE            |`,
    `| /audit api            | API Auditør — npm, fetch, Firestore-queries        |`,
    `| /audit arkitektur     | Arkitektur Auditør — lag-violations, vendor lock   |`,
    `| /audit performance    | Performance Auditør — Core Web Vitals 2025         |`,
    `| /audit test           | Test Auditør — TDD-compliance, coverage, CI        |`,
    `| /audit corpus         | Corpus Auditør — CSI-loop (kører automatisk)       |`,
    `| /audit refresh [x]    | Knowledge Refresh — opdatér specifik auditørs viden|`,
  ].join('\n');
}

// Disk sync removed (The Independence Directive CA-09)
export function buildMasterPrompt(
  projectName: string,
  data: Partial<InstructionSet>,
  version: number,
  agentSkills: Array<{ name: string; content: string }> = [],
  bestPractices: Array<{ name: string; content: string }> = []
): string {
  const auditSkills = agentSkills.filter(s => s.name.startsWith('audit/'));
  const coreSkills = agentSkills.filter(s => !s.name.startsWith('audit/'));

  // Byg C-Suite og Best Practices sektionen
  const bestPracticeSection = bestPractices.length > 0
    ? bestPractices.map((bp) => {
        let path = '';
        if (bp.name === 'security') path = 'docs/SECURITY.md';
        else if (bp.name === 'grill-me') path = '.agents/skills/grill-me.md';
        else if (bp.name.startsWith('cc/')) path = `.agents/skills/${bp.name}.md`;
        else path = bp.name;
        
        return `### Opret: ${path}\n${bp.content}`;
      }).join('\n\n---\n\n')
    : '(Ingen best-practices indlæst)';

  const coreSkillsSection = coreSkills.length > 0
    ? coreSkills.map((s) => `### Skill: ${s.name}\n${s.content}`).join('\n\n---\n\n')
    : '(Ingen core skills registreret)';

  const auditSkillsSection = auditSkills.length > 0
    ? auditSkills.map((s) => `### ${s.name}\n${s.content}`).join('\n\n---\n\n')
    : '(Ingen auditør-skills registreret)';

  const or = (val: string | undefined, fallback: string) =>
    (val !== undefined && val !== '') ? val : fallback;

  return [
    // ── Første linje ER kommandoen — paste + enter = done ──────────────────
    `Bootstrap dette projekt: læs denne Master Prompt og opret alle filer i det aktuelle workspace som beskrevet herunder.`,
    ``,
    `---`,
    ``,
    `# ${projectName} · Master Prompt · v${version}`,
    ``,
    `> Genereret af AI Tuner Workbench · ${new Date().toISOString().split('T')[0]} · Thinking-Level: ${data.thinkingLevel ?? 'MEDIUM'}`,
    `> Paste denne tekst direkte i Antigravity og tryk Enter — ingen yderligere input nødvendigt.`,
    ``,
    `---`,
    ``,
    `## PROJEKTSTRUKTUR`,
    `Opret følgende filer med indholdet fra de tilsvarende sektioner nedenfor:`,
    ``,
    `\`\`\``,
    `docs/rules.md          ← §1  Adfærdsregler for AI-agenter`,
    `docs/SKILL.md          ← §2  Platform Codebook (design tokens, kodeopskrifter)`,
    `docs/workflows.md      ← §3  On-demand workflows`,
    `docs/SPEC.md           ← §4  Vision og user stories`,
    `docs/PLAN.md           ← §5  Eksekveringsplan`,
    `docs/architecture.md   ← §6  Teknisk blueprint`,
    `docs/STATE.md          ← §7  Beslutningslog og ADR'er`,
    `docs/AGENTS.md         ← §8  AI-team konfiguration`,
    `llms.txt               ← §9  Projektmap`,
    `docs/testing.md        ← §10 Test-strategi`,
    `docs/DESIGN.md         ← §11 Design system`,
    `docs/cc-log.md         ← §12 C-Suite Decision Log (/cc)`,
    `.agents/skills/        ← §13 Core platform skills`,
    `.agents/skills/cc/     ← §14 Command Center: Bestyrelse (PO, Arkitekt, QA, Compliance)`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    `## §1 · docs/rules.md — Adfærdsregler (System Behavior)`,
    `${or(data.rules, '*(Ikke defineret — udfyld rules.md)*')}`,
    ``,
    `## §2 · docs/SKILL.md — Platform Codebook (Specialized Knowledge)`,
    `${or(data.skills, '*(Ikke defineret — udfyld SKILL.md)*')}`,
    ``,
    `## §3 · docs/workflows.md — On-demand Workflows`,
    `${or(data.workflows, '*(Ikke defineret — udfyld workflows.md)*')}`,
    ``,
    `## §4 · docs/SPEC.md — Vision & Intent`,
    `${or(data.spec, '*(Ikke genereret)*')}`,
    ``,
    `## §5 · docs/PLAN.md — Execution Roadmap`,
    `${or(data.plan, '*(Ikke genereret)*')}`,
    ``,
    `## §6 · docs/architecture.md — Technical Blueprint`,
    `${or(data.architecture, '*(Ikke genereret)*')}`,
    ``,
    `## §7 · docs/STATE.md — Process Continuity`,
    `${or(data.state, '*(Ikke genereret)*')}`,
    ``,
    `## §8 · docs/AGENTS.md — Machine Context`,
    `${or(data.agents, '*(Ikke genereret)*')}`,
    ``,
    `## §9 · llms.txt — Project Map`,
    `${or(data.llmsTxt, '*(Ikke genereret)*')}`,
    ``,
    `## §10 · docs/testing.md — QA & Test Protokol`,
    `${or(data.testing, '*(Ikke genereret)*')}`,
    ``,
    `## §11 · docs/DESIGN.md — Design System & UI Philosophy`,
    `${or(data.design, '*(Ingen designfilosofi valgt)*')}`,
    ``,
    `## §12 · docs/cc-log.md — Command Center Log`,
    `| Dato | C-Level Rolle | Scope / Møde | Konklusion / Arkitekturvalg |`,
    `|:---|:---|:---|:---|`,
    `| - | - | - | *(Ingen /cc kaldt endnu)* |`,
    ``,
    `## §13 · .agents/skills/ — Platform Core Skills`,
    coreSkillsSection,
    ``,
    `## §14 · .agents/skills/audit/ — Auditørkorps`,
    auditSkillsSection,
    ``,
    `## §15 · Interne Best-Practices (C-Suite, SECURITY.md m.fl.)`,
    `Denne sektion opsætter the C-Suite Board samt kritiske systemfiler automatisk baseret på The Independence Directive.`,
    ``,
    bestPracticeSection,
    ``,
    `---`,
    `> **Forfatter:** Kopier alt ovenstående ind i din agent for at boote projektet.`
  ].join('\n');
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseVersionsReturn {
  versions: InstructionSet[];
  currentVersion: InstructionSet | null;
  isLoadingVersions: boolean;
  isSaving: boolean;
  isDirty: boolean;
  diffTarget: InstructionSet | null;
  pendingSaveCallback: ((summary: string) => void) | null;
  versionSummaryInput: string;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (dirty: boolean) => void;
  setDiffTarget: (v: InstructionSet | null) => void;
  setPendingSaveCallback: React.Dispatch<React.SetStateAction<((summary: string) => void) | null>>;
  setVersionSummaryInput: (v: string) => void;
  saveVersion: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useVersions(
  user: FirebaseUser | null,
  selectedProject: Project | null
): UseVersionsReturn {
  const [versions, setVersions] = useState<InstructionSet[]>([]);
  const [currentVersion, setCurrentVersion] = useState<InstructionSet | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [diffTarget, setDiffTarget] = useState<InstructionSet | null>(null);

  // F1.4: Inline version summary (replaces native prompt())
  const [pendingSaveCallback, setPendingSaveCallback] =
    useState<((summary: string) => void) | null>(null);
  const [versionSummaryInput, setVersionSummaryInput] = useState('');

  // TDD-02: Safety Gate on browser tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Standard behavior for browsers to show their native confirm dialog
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Versions real-time subscription
  useEffect(() => {
    if (!selectedProject) {
      setCurrentVersion(null);
      setVersions([]);
      setIsLoadingVersions(false);
      return;
    }

    setIsLoadingVersions(true);
    const q = query(
      collection(db, 'projects', selectedProject.id, 'versions'),
      orderBy('version', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const v = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InstructionSet));
        setVersions(v);

        if (v.length > 0) {
          setCurrentVersion((prev) => {
            if (!prev || prev.projectId !== selectedProject.id) return v[0];
            if (prev.id !== v[0].id && prev.version < v[0].version) return v[0];
            return prev;
          });
        }
        setIsLoadingVersions(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `projects/${selectedProject.id}/versions`);
        setIsLoadingVersions(false);
      }
    );

    return () => unsubscribe();
  }, [selectedProject?.id]);

  // ─── Save logic ────────────────────────────────────────────────────────────

  const saveVersion = () => {
    if (!user || !selectedProject || isSaving) return;
    if (versions.length === 0) {
      executeSave('Første version');
    } else {
      setVersionSummaryInput('');
      setPendingSaveCallback(() => (summary: string) => executeSave(summary));
    }
  };

  const executeSave = async (summary: string) => {
    if (!user || !selectedProject) return;
    setIsSaving(true);

    // Snapshot for rollback (react-patterns: Optimistic UI)
    const previousVersion = currentVersion;

    try {
      // Fetch agent skills from disk for Master Prompt inclusion
      let agentSkills: Array<{ name: string; content: string }> = [];
      try {
        const skillsRes = await fetch('/api/agents/skills');
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          agentSkills = data.skills ?? [];
        }
      } catch (skillErr) {
        console.warn('[useVersions] Could not fetch agent skills — continuing without:', skillErr);
      }

      // Baseline files (rules.md, SKILL.md, workflows.md) are never AI-generated.
      // They exist on disk but are not stored in Firestore. Load them now so
      // §1 RULES and §2 SKILLS are never "undefined" in the Master Prompt.
      const baselineFields: Array<{ field: keyof InstructionSet; filename: string }> = [
        { field: 'rules',     filename: 'rules.md'     },
        { field: 'skills',    filename: 'SKILL.md'     },
        { field: 'workflows', filename: 'workflows.md' },
      ];
      const baselineContent: Partial<InstructionSet> = {};
      await Promise.all(
        baselineFields.map(async ({ field, filename }) => {
          if (!currentVersion?.[field]) {
            try {
              const res = await fetch(`/api/docs/${filename}`);
              if (res.ok) (baselineContent as any)[field] = await res.text();
            } catch {
              console.warn(`[useVersions] Could not load baseline ${filename}`);
            }
          }
        })
      );

      const newVersionNumber = (versions[0]?.version || 0) + 1;
      const base = {
        ...(currentVersion ?? {
          projectId: selectedProject.id,
          llmsTxt: '', llmsFullTxt: '',
          architecture: '', spec: '', plan: '',
          state: '', agents: '', testing: '',
          version: 0,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          thinkingLevel: ThinkingLevel.MEDIUM,
        }),
        ...baselineContent,  // inject loaded rules/skills/workflows
      };

      // Update Last-Modified on all text fields via TAB_TO_FIELD map
      const updated: Partial<InstructionSet> = {};
      for (const [, field] of Object.entries(TAB_TO_FIELD)) {
        if (typeof (base as any)[field] === 'string') {
          (updated as any)[field] = updateLastModified((base as any)[field] || '');
        }
      }

      // Generate a deterministic llms.txt (replaces any stale AI-generated content)
      const freshLlmsTxt = buildLlmsTxt(selectedProject.name, newVersionNumber, agentSkills);
      updated.llmsTxt = freshLlmsTxt;

      const masterPrompt = buildMasterPrompt(selectedProject.name, updated, newVersionNumber, agentSkills);


      const docData = {
        ...base,
        ...updated,
        masterPrompt,
        version: newVersionNumber,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        changeSummary: summary || 'Ingen beskrivelse',
      };

      // Strip client-side id before writing to Firestore
      const { id: _id, ...dataToSave } = docData as any;

      const docRef = await addDoc(
        collection(db, 'projects', selectedProject.id, 'versions'),
        dataToSave
      );

      // Immediately sync Firestore-generated ID to local state
      await updateDoc(doc(db, 'projects', selectedProject.id), {
        updatedAt: new Date().toISOString(),
      });

      setCurrentVersion({ ...docData, id: docRef.id } as InstructionSet);

      // Push to disk is strictly disabled due to The Independence Directive (CA-09)
      // We no longer mutate the host 'docs' file system to prevent cannibalization.

      setIsDirty(false);
      toast.success(`Version ${newVersionNumber} gemt!`);
    } catch (err) {
      // Rollback UI to pre-save state so user doesn't see inconsistent data
      if (previousVersion !== undefined) setCurrentVersion(previousVersion);
      handleFirestoreError(err, OperationType.WRITE, `projects/${selectedProject.id}/versions`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    versions,
    currentVersion,
    isLoadingVersions,
    isSaving,
    isDirty,
    diffTarget,
    pendingSaveCallback,
    versionSummaryInput,
    setCurrentVersion,
    setIsDirty,
    setDiffTarget,
    setPendingSaveCallback,
    setVersionSummaryInput,
    saveVersion,
  };
}
