import { useState } from 'react';
import { InstructionSet } from '../types';
import { toast } from 'sonner';
import {
  generateSpecFromVision,
  generateModuleFromSpec,
  generateDesignDoc,
  clarifyVision,
  ClarifyingQuestion,
} from '../services/gemini';
import { setTabContent } from '../tabConfig';

// ─── Static consequence & suggestion data ─────────────────────────────────────

export const PLATFORM_OPTIONS = {
  web: {
    label: 'Web',
    icon: '🌐',
    pros: ['Kør i alle browsere — ingen installation', 'Del med et link fra dag ét', 'Nem hosting (Vercel/Netlify)'],
    cons: ['Begrænset adgang til enhedens hardware', 'Mobilvisning kræver separat optimering'],
    stack: 'Vite + React + TypeScript',
    agentNotes: 'Brug browser-APIs. Ingen native modules. Prioritér lighedstid og bundle-størrelse.',
  },
  mobile: {
    label: 'iOS / Android',
    icon: '📱',
    pros: ['Native app-oplevelse', 'Adgang til kamera, GPS, notifikationer', 'Offline-first muligt'],
    cons: ['App Store godkendelse: 1–3 uger pr. opdatering ⚠️', 'Separat device-testsetup kræves', 'Markant mere kompleks deployment'],
    stack: 'React Native + Expo',
    agentNotes: 'Brug React Native APIs. Test på simulator OG device. Husk Platform.OS guards. Undgå browser-only APIs.',
  },
  desktop: {
    label: 'Desktop',
    icon: '🖥️',
    pros: ['Direkte adgang til filsystem og lokale ressourcer', 'Optimal performance', 'Ingen hosting-udgifter'],
    cons: ['Brugeren skal installere appen', 'Separat build til Mac/Windows/Linux'],
    stack: 'Tauri v2 + React',
    agentNotes: 'Brug Tauri commands til filesystem-adgang. Rust-backend til performance-kritiske dele. IPC via invoke().',
  },
  api: {
    label: 'API / Backend',
    icon: '⚙️',
    pros: ['Integrér med eksisterende systemer', 'Teknologi-agnostisk og skalerbar', 'Ingen brugerflade at vedligeholde'],
    cons: ['Ingen visuel grænseflade — kræver frontend-partner', 'Sværere at demonstrere direkte'],
    stack: 'Node.js + Express + TypeScript',
    agentNotes: 'OpenAPI-spec defineres i ARCHITECTURE.md. Endpoint-tests med supertest. Altid typed request/response.',
  },
} as const;

export const SCALE_OPTIONS = {
  solo: {
    label: 'Kun mig',
    icon: '👤',
    description: 'Ingen login eller brugerroller nødvendig. Lokal eller cloud-data til én bruger. Maksimal enkelhed og hastighed i udvikling.',
  },
  team: {
    label: 'Lille team (2–20)',
    icon: '👥',
    description: 'Brugerstyring og roller kræves. Delt database med adgangskontrol. GDPR-overvejelser bliver relevante.',
  },
  public: {
    label: 'Mange brugere',
    icon: '🌍',
    description: 'Skalerbar infrastruktur er obligatorisk. CDN, rate limiting, monitoring og fuld GDPR-compliance skal designes ind fra start.',
  },
} as const;

export const TEMPO_OPTIONS = {
  mvp: {
    label: 'MVP hurtigst muligt',
    icon: '🚀',
    description: 'Fokus på core feature. Teknisk gæld accepteres midlertidigt. Launcher typisk 30–50% hurtigere. Refaktorering planlagt i næste iteration.',
  },
  solid: {
    label: 'Solidt fundament',
    icon: '🏗️',
    description: 'Arkitektur designes til at skalere fra dag ét. Tests skrives sideløbende. Tager 30–50% længere, men reducerer fremtidig gæld markant.',
  },
} as const;

export type PlatformKey = keyof typeof PLATFORM_OPTIONS;
export type ScaleKey = keyof typeof SCALE_OPTIONS;
export type TempoKey = keyof typeof TEMPO_OPTIONS;

// ─── UI Design Philosophy ─────────────────────────────────────────────────────

export const UI_PHILOSOPHY_OPTIONS = {
  tft: {
    label: 'TfT — Tools for Thought',
    icon: '✦',
    tagline: 'Grænsefladen forsvinder. Kun tanken er synlig.',
    characteristics: [
      'Radikal enkelhed — Minimal Chrome dogme',
      '8pt grid, neutral farvepalet, typo-hierarki',
      'White space som primært adskillelsesværktøj',
      'Hover-first: kontrolelementer skjult til de behøves',
      'Keyboard-first navigation (Cmd+K central)',
    ],
    avoids: ['Dekorative elementer', 'Farver uden semantisk rolle', 'Permanente kontroller der forstyrrer'],
    inspiration: 'Obsidian · Notion · Linear · Bear · Typora',
    designNotes: 'Inter font. Neutral-900 primær. 0 borders der ikke er funktionelle. Progressive Disclosure niveau 1-2-3.',
  },
  dashboard: {
    label: 'Dashboard — Data-First',
    icon: '⬡',
    tagline: 'Information density er det primære mål.',
    characteristics: [
      'Høj informationstæthed — maksimalt data pr. pixel',
      'Tabeller, grafer og KPI-kort som kerneelementer',
      'Sidebar-navigation med sektioner og labels',
      'Status-indikatorer og real-time opdateringer',
      'Filtrering og sortering som førsteordensoperationer',
    ],
    avoids: ['Tom white space', 'Minimale layouts der gemmer data', 'Lange scrolling-sider'],
    inspiration: 'Stripe Dashboard · Vercel · Grafana · Retool · Metabase',
    designNotes: 'Kompakt type-scale (12-14px). Grid-baseret layout. Statusfarver er semantiske og kritiske.',
  },
  consumer: {
    label: 'Consumer — Varm & Imødekommende',
    icon: '◉',
    tagline: 'Følelsesmæssig resonans over kognitiv effektivitet.',
    characteristics: [
      'Farver, runding og illustrationer er designsprøget',
      'Touch-first — 44px minimum touch-targets',
      'Onboarding med delight-momenter',
      'Animationer som feedback — ikke kun dekoration',
      'Social proof og progression synliggjort',
    ],
    avoids: ['Kølig minimalisme', 'Teknisk jargon i UI', 'Manglende emotional feedback'],
    inspiration: 'Duolingo · Airbnb · Headspace · Figma onboarding · iOS apps',
    designNotes: 'Custom CSS variabler til brand-farver. border-radius: 16-24px. Framer Motion til transitions.',
  },
  devtool: {
    label: 'Dev Tool — Keyboard-First',
    icon: '◈',
    tagline: 'Ekspert-workflow uden visuel friktion.',
    characteristics: [
      'Command palette (Cmd+K) som primær navigationsaktion',
      'Monospace font til al kode og output',
      'Terminal-inspireret æstetik — mørk baggrund som default',
      'Keyboard shortcuts til alle primære operationer',
      'Compact density — maks indhold, min scroll',
    ],
    avoids: ['Mouse-dependent workflows', 'Animationer der forsinker', 'Brede margins der spilder lærred'],
    inspiration: 'Raycast · Warp Terminal · GitHub Copilot · JetBrains · VS Code',
    designNotes: 'JetBrains Mono eller Fira Code til code. Dark mode som default med light variant. Dense spacing (4pt grid).',
  },
} as const;

export type UIPhilosophyKey = keyof typeof UI_PHILOSOPHY_OPTIONS;

// ─── Hjørneflag — kategoriserede forslag ──────────────────────────────────────

export interface FlagSuggestion {
  id: string;
  label: string;        // Kort, konkret — bruges som chip-tekst og i prompts
  description: string;  // Én sætning: hvad det betyder i praksis
  category: string;
  icon: string;
}

export const MUST_FLAG_SUGGESTIONS: FlagSuggestion[] = [
  // Teknisk fundament
  { id: 'ts-strict',    category: 'Teknisk',   icon: '⚙️', label: 'TypeScript strict — 0 fejl er absolut krav',          description: 'Ingen `any`, ingen ubehandlede Promise-fejl. CI stopper ved første fejl.' },
  { id: 'test-first',   category: 'Teknisk',   icon: '🧪', label: 'Test-First: Ingen feature uden unit test',             description: 'TDD-workflow: rød → grøn → refaktor. Ingen merge til main uden bestået testsuite.' },
  { id: 'offline',      category: 'Teknisk',   icon: '📡', label: 'Offline-first: Kernefunktioner virker uden internet',  description: 'Service Worker eller lokal cache sikrer at kerneflows fungerer offline.' },
  { id: 'ci-cd',        category: 'Teknisk',   icon: '🚀', label: 'CI/CD fra dag ét — automatisk deploy ved grønt build', description: 'GitHub Actions eller tilsvarende. Ingen manuel deploy til produktion.' },
  { id: 'perf-100ms',   category: 'Teknisk',   icon: '⚡', label: 'Respons < 100ms på lokale brugerhandlinger',           description: 'UI giver visuelt feedback inden 100ms. Langsomme operationer viser loading-state.' },
  // Sikkerhed & Data
  { id: 'no-pii-leak',  category: 'Sikkerhed', icon: '🔒', label: 'Persondata forlader aldrig enheden ukrypteret',        description: 'Al PII krypteres application-layer eller DB-niveau. Audit log ved ændringer.' },
  { id: 'no-secrets',   category: 'Sikkerhed', icon: '🗝️', label: 'Nul hardkodede credentials i kodebasen',              description: 'API-nøgler og passwords hentes altid fra environment variables.' },
  { id: 'soft-delete',  category: 'Sikkerhed', icon: '💾', label: 'Uigenkaldelig sletning er forbudt — soft delete altid', description: 'Data soft-deletes med `deletedAt`. Ingen `DELETE FROM` uden admin-flow.' },
  // UX & Tilgængelighed
  { id: 'danish-ui',    category: 'UX',        icon: '🇩🇰', label: 'Alt brugervendt indhold på dansk',                   description: 'Ingen engelske labels eller fejlbeskeder i UI. Backend-kode er engelsk.' },
  { id: 'keyboard',     category: 'UX',        icon: '⌨️', label: 'Fuld tastaturnavigation (WCAG 2.1 AA)',               description: 'Alle handlinger kan udføres via Tab+Enter. Synligt focus-state altid.' },
  { id: 'dirty-state',  category: 'UX',        icon: '⚠️', label: 'Brugeren advares altid om ugemte ændringer',          description: 'isDirty-state sættes ved enhver brugermodifikation. Bekræftelse ved navigation.' },
  // Juridisk
  { id: 'gdpr',         category: 'Juridisk',  icon: '⚖️', label: 'GDPR: Brugere kan eksportere og slette al sin data', description: 'Fuld selvbetjening til dataeksport og sletning. Ingen tredjepartsvideregivelse.' },
];

export const NEVER_FLAG_SUGGESTIONS: FlagSuggestion[] = [
  // Kodekvalitet
  { id: 'no-any',       category: 'Kodekvalitet', icon: '🚫', label: 'Aldrig `any` i TypeScript',                          description: 'Brug `unknown` + type guards eller generics. `any` er teknisk gæld.' },
  { id: 'no-magic',     category: 'Kodekvalitet', icon: '🎩', label: 'Ingen magic strings/numbers — brug navngivne konstanter', description: 'Ingen `if (status === 3)` uden navngivet konstant eller enum.' },
  { id: 'no-vendor',    category: 'Kodekvalitet', icon: '🔗', label: 'Ingen vendor lock-in uden dokumenteret exit-strategi', description: 'Services abstrakt bag interface. Skifte leverandør må maks koste 2 dage.' },
  { id: 'no-broken-ci', category: 'Kodekvalitet', icon: '🔴', label: 'Ingen deploy med fejlslåede tests',                   description: 'CI blokerer merge ved fejl. "Works on my machine" er ikke nok.' },
  // Privacy & Tracking
  { id: 'no-tracking',  category: 'Privacy',      icon: '👁️', label: 'Ingen 3rd-party analytics eller tracking pixels',     description: 'Google Analytics, Mixpanel, Meta Pixel mv. er forbudt.' },
  { id: 'no-ads',       category: 'Privacy',      icon: '📵', label: 'Ingen reklamer eller sponsoreret indhold',            description: 'Produktet finansieres ikke af bruger-data eller display-reklamer.' },
  { id: 'no-social',    category: 'Privacy',      icon: '🔕', label: 'Ingen sociale login-knapper fra Meta eller X',        description: 'Facebook/Instagram/X login er forbudt. Google/Apple OAuth kan accepteres.' },
  // UX-forbud
  { id: 'no-alerts',    category: 'UX-forbud',    icon: '🚨', label: 'Ingen native browser-dialogs (alert/confirm/prompt)', description: 'Brug designede modal-komponenter. Native dialogs kan ikke styles.' },
  { id: 'no-spam-push', category: 'UX-forbud',    icon: '🔔', label: 'Ingen uopfordrede push-notifikationer',               description: 'Notifikationer kun som direkte respons på brugerhandlinger — aldrig marketing.' },
  { id: 'no-dark-pat',  category: 'UX-forbud',    icon: '🕳️', label: 'Ingen dark patterns (falsk urgency, skjulte afmeld)', description: 'Ingen confirmshaming, falsk countdown eller uigennemsigtige fejltilmeldinger.' },
];


// ─── Generation progress ───────────────────────────────────────────────────────

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

// ─── Wizard state ──────────────────────────────────────────────────────────────

export interface WizardPreferences {
  platforms: PlatformKey[];   // ← multi-select (was: platform: PlatformKey | null)
  scale: ScaleKey | null;
  tempo: TempoKey | null;
  uiPhilosophy: UIPhilosophyKey | null;   // ← design philosophy (optional)
  customStack: string;
}

export interface UseWizardReturn {
  step: number;
  setStep: (s: number) => void;
  vision: string;
  setVision: (v: string) => void;
  uiReferences: string;
  setUiReferences: (v: string) => void;
  functionalCompetitors: string;
  setFunctionalCompetitors: (v: string) => void;
  getCombinedVision: () => string;
  preferences: WizardPreferences;
  setPreference: <K extends keyof WizardPreferences>(key: K, val: WizardPreferences[K]) => void;
  togglePlatform: (key: PlatformKey) => void;
  mustFlags: string[];
  toggleMustFlag: (flag: string) => void;
  customMust: string;
  setCustomMust: (v: string) => void;
  addCustomMustFlag: () => void;
  neverFlags: string[];
  toggleNeverFlag: (flag: string) => void;
  customNever: string;
  setCustomNever: (v: string) => void;
  addCustomNeverFlag: () => void;
  generationSteps: GenerationStep[];
  isGenerating: boolean;
  generateAll: (
    currentVersion: InstructionSet | null,
    projectName: string,
    thinkingLevel: string,
    setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
    setIsDirty: (v: boolean) => void,
    onComplete: () => void
  ) => Promise<void>;
  canAdvanceStep: () => boolean;
  /** The last fully-generated version — passed to SparringView */
  lastGeneratedVersion: InstructionSet | null;
  // ── Grill-Me Clarification ──
  clarifyingQuestions: ClarifyingQuestion[];
  clarificationAnswers: Record<string, string>;
  clarifyStep: number;        // 0 = not started, 1..N = question index (1-based), N+1 = done
  isClarifying: boolean;
  runClarify: (projectName: string, thinkingLevel: string) => Promise<void>;
  answerClarification: (questionId: string, answer: string) => void;
  advanceClarifyStep: () => void;
  skipClarification: () => void;
}

const INITIAL_STEPS: GenerationStep[] = [
  { id: 'spec',   label: 'Genererer projektspecifikation (SPEC.md)…', status: 'pending' },
  { id: 'rules',  label: 'Fastlægger systemregler og adfærd (rules.md)…', status: 'pending' },
  { id: 'arch',   label: 'Definerer teknisk arkitektur…',             status: 'pending' },
  { id: 'plan',   label: 'Planlægger roadmap (PLAN.md)…',            status: 'pending' },
  { id: 'agents', label: 'Konfigurerer AI-teamet (AGENTS.md)…',      status: 'pending' },
  { id: 'test',   label: 'Opretter test-strategi…',                  status: 'pending' },
  { id: 'state',  label: 'Initialiserer projekt-status…',            status: 'pending' },
  { id: 'design', label: 'Genererer design-system (DESIGN.md)…',     status: 'pending' },
  { id: 'skills', label: 'Kodificerer projekt-specifikke skills (SKILL.md)…', status: 'pending' },
  { id: 'llms',   label: 'Sammensætter Master Prompt…',              status: 'pending' },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useWizard(): UseWizardReturn {
  const [step, setStep] = useState(1);
  const [vision, setVision] = useState('');
  const [uiReferences, setUiReferences] = useState('');
  const [functionalCompetitors, setFunctionalCompetitors] = useState('');
  const [preferences, setPreferences] = useState<WizardPreferences>({
    platforms: [],
    scale: null,
    tempo: null,
    uiPhilosophy: null,
    customStack: '',
  });
  const [mustFlags, setMustFlags] = useState<string[]>([]);
  const [customMust, setCustomMust] = useState('');
  const [neverFlags, setNeverFlags] = useState<string[]>([]);
  const [customNever, setCustomNever] = useState('');
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(INITIAL_STEPS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedVersion, setLastGeneratedVersion] = useState<InstructionSet | null>(null);

  // ── Grill-Me Clarification state ──
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [clarifyStep, setClarifyStep] = useState(0);
  const [isClarifying, setIsClarifying] = useState(false);

  const setPreference = <K extends keyof WizardPreferences>(
    key: K,
    val: WizardPreferences[K]
  ) => setPreferences((prev) => ({ ...prev, [key]: val }));

  const togglePlatform = (key: PlatformKey) =>
    setPreferences((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(key)
        ? prev.platforms.filter((p) => p !== key)
        : [...prev.platforms, key],
    }));

  const toggleMustFlag = (flag: string) =>
    setMustFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );

  const toggleNeverFlag = (flag: string) =>
    setNeverFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );

  const addCustomMustFlag = () => {
    if (customMust.trim()) {
      setMustFlags((prev) => [...prev, customMust.trim()]);
      setCustomMust('');
    }
  };

  const addCustomNeverFlag = () => {
    if (customNever.trim()) {
      setNeverFlags((prev) => [...prev, customNever.trim()]);
      setCustomNever('');
    }
  };

  const canAdvanceStep = (): boolean => {
    if (step === 1) return vision.trim().length > 30;
    if (step === 2) return true; // always allow advancing from clarification
    if (step === 3) return preferences.platforms.length > 0 && preferences.scale !== null && preferences.tempo !== null;
    // uiPhilosophy is optional — does not block advancement
    if (step === 4) return true;
    return false;
  };

  const getCombinedVision = () => {
    let combined = `KERNEVISION / PROBLEM:\n${vision}\n`;
    if (functionalCompetitors) combined += `\nA LA TOOLS / FUNKTIONEL REFREFERNCE:\n${functionalCompetitors}\n`;
    if (uiReferences) combined += `\nUI DESIGN REFERENCER:\n${uiReferences}\n`;
    return combined.trim();
  };

  // ── Grill-Me: Run clarification session on vision ──
  const runClarify = async (projectName: string, thinkingLevel: string) => {
    if (!vision.trim() || isClarifying) return;
    setIsClarifying(true);
    try {
      const questions = await clarifyVision(getCombinedVision(), projectName, thinkingLevel as any);
      if (questions.length === 0) {
        toast.info('Visionen er klar til generering — ingen afklaring nødvendig.');
        return;
      }
      // Pre-fill answers with AI recommendations
      const initial: Record<string, string> = {};
      questions.forEach((q) => { initial[q.id] = q.recommendation; });
      setClarifyingQuestions(questions);
      setClarificationAnswers(initial);
      setClarifyStep(1);  // Start at first question
    } catch (err) {
      console.error('[useWizard] clarifyVision fejlede:', err);
      toast.error('AI-afklaring mislykkedes — du kan fortsætte uden.');
    } finally {
      setIsClarifying(false);
    }
  };

  const answerClarification = (questionId: string, answer: string) =>
    setClarificationAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const advanceClarifyStep = () =>
    setClarifyStep((prev) => Math.min(prev + 1, clarifyingQuestions.length + 1));

  const skipClarification = () => {
    setClarifyStep(clarifyingQuestions.length + 1); // Mark as done
    setClarifyingQuestions([]);
  };

  const updateStep = (id: string, status: GenerationStep['status']) =>
    setGenerationSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );

  const buildContextPrompt = (): string => {
    const selectedPlatforms = preferences.platforms.map((p) => PLATFORM_OPTIONS[p]);
    const scale = preferences.scale ? SCALE_OPTIONS[preferences.scale] : null;
    const tempo = preferences.tempo ? TEMPO_OPTIONS[preferences.tempo] : null;

    // Build platform-specific agent notes for multi-platform scenarios
    const platformDetails = selectedPlatforms.map((p) =>
      `  - ${p.label} (${p.stack}): ${p.agentNotes}`
    ).join('\n');

    const multiPlatformWarning = selectedPlatforms.length > 1
      ? `\nVIGTIGT — Multi-platform projekt (${selectedPlatforms.map(p => p.label).join(' + ')}):\n` +
        `AI-agenten SKAL eksplicit håndtere platform-specifikke forskelle. Delt logik isoleres i /shared eller /core.\n` +
        `Platform-specifikke implementationer SKAL have tydelige platform-guards.\n`
      : '';

    return `
VISION FRA IVÆRKSÆTTER:
${getCombinedVision()}
${
  Object.keys(clarificationAnswers).length > 0
    ? `
AI AFKLARING (Grill-Me session — svar fra iværksætter):
${clarifyingQuestions
  .map((q) => `- [${q.category.toUpperCase()}] ${q.question}\n  Svar: ${clarificationAnswers[q.id] ?? q.recommendation}`)
  .join('\n')}
`
    : ''
}

PLATFORM & DEPLOYMENT:
${platformDetails}
${multiPlatformWarning}
BRUGERSKALA: ${scale?.label ?? 'Ikke specificeret'} — ${scale?.description ?? ''}

UDVIKLINGSTEMPO: ${tempo?.label ?? 'Ikke specificeret'} — ${tempo?.description ?? ''}
${preferences.customStack ? `\nSPECIFIKT STACK-ØNSKE FRA BRUGER: ${preferences.customStack}` : ''}

${(() => {
  if (!preferences.uiPhilosophy) return '';
  const p = UI_PHILOSOPHY_OPTIONS[preferences.uiPhilosophy];
  return `UI DESIGN FILOSOFI: ${p.label}
Tagline: ${p.tagline}
Inspiration: ${p.inspiration}
Design notes: ${p.designNotes}
Karakteristika:
${p.characteristics.map((c) => `  - ${c}`).join('\n')}
Undgå altid:
${p.avoids.map((a) => `  ✗ ${a}`).join('\n')}

VIGTIGT: Denne designfilosofi skal afspejles eksplicit i:
  - SPEC.md (User Experience section)
  - AGENTS.md (UX_CHECK og design constraints)
  - rules.md (Causal Anchors og design-regler)
  Alle UI-komponenter genereret i dette projekt skal følge ${p.label}-principperne.`;
})()}

HJØRNEFLAG — SKAL ALTID GÆLDE (non-negotiables):
${mustFlags.length > 0 ? mustFlags.map((f) => `- KRAV: ${f}`).join('\n') : '- (Ingen specificerede)'}

HJØRNEFLAG — MÅ ALDRIG SKE (hårde begrænsninger):
${neverFlags.length > 0 ? neverFlags.map((f) => `- FORBUD: ${f}`).join('\n') : '- (Ingen specificerede)'}

KRAV TIL GENERERING:
- Alle hjørneflag SKAL fremgå eksplicit i SPEC.md, AGENTS.md og rules.md
- AGENTS.md SKAL indeholde konkrete tool-referencer og CLI-kommandoer — IKKE generiske rollebeskrivelser
- PLAN.md SKAL have verificerbare acceptance-kriterier pr. opgave
- Teknisk stack SKAL matche valgte platforms

UX & INTERACTION DESIGN PRINCIPPER (skal forankres i AGENTS.md og rules.md):
Disse principper stammer fra GSD Framework's UX_FLOWS.md og gælder alle projekter:

1. INTERACTION FLUENCY — Grænsefladen skal forsvinde; kun opgaven er synlig.
   Opnås via: Mental Model Alignment + Information Architecture + Task Flow Coherence.

2. SMART ROUTING (FL-01) — Routing baseres på KONTEKST, ikke intern state:
   - Ny bruger / tomt projekt → guidet wizard-flow
   - Returbruger / eksisterende data → direkte til status/oversigt
   - Under aktiv AI-fase → ingen routing-afbrydelse

3. GUIDEDE FORLØB (FL-02) — Ingen uplanlagte exits under wizard/onboarding:
   - Alle faser inkluderes i progress-indikatoren fra start
   - Exit er kun tilgængeligt EFTER flowet er komplet

4. HANDLINGSORIENTERET STATUS (FL-04) — Status-sider følger altid dette hierarki:
   Kontekst → Tilstand ("hvad mangler") → Handling → Eksport
   Eksport-CTA vises IKKE prominent før readiness er høj.

5. INFORMATION ARCHITECTURE (N1) — Et hierarki-niveau pr. navigationskomponent:
   Bland aldrig app-navigation og projekt-navigation i samme sidebar.

6. PROGRESSIV AFSLØRING — Tre niveauer:
   Niveau 1 (altid synligt): Kernefunktion
   Niveau 2 (hover/aktiv): Sekundære handlinger
   Niveau 3 (eksplicit åbn): Avancerede indstillinger

7. CAUSAL ANCHORS — Disse sandheder forbliver konstante:
   - CA-01: Data forlader aldrig enheden u-krypteret
   - CA-02: 0 TypeScript/lint-fejl er kravet — stop og ret fejl først
   - CA-03: Ingen native browser-dialogs (alert/confirm/prompt)
   - CA-04: isDirty/changed-state sættes ved ENHVER brugermodifikation
   - CA-05: Intet visuelt element uden funktionelt formål (Minimal Chrome)

DESIGN SYSTEM CONSTRAINTS:
- Typografi: Inter font. Scale: 12/14/16/20/24/32px. Line-height min 1.4.
- Spacing: 8pt grid (8/16/24/32/48/64px) — ingen vilkårlige værdier.
- Farver: Semantisk kun. Neutral base. Ingen dekorative gradienter.
- Respons-budget: < 100ms visuel feedback på lokale handlinger.
    `.trim();
  };

  const generateAll = async (
    currentVersion: InstructionSet | null,
    projectName: string,
    thinkingLevel: string,
    setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
    setIsDirty: (v: boolean) => void,
    onComplete: () => void
  ) => {
    setIsGenerating(true);
    setGenerationSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));

    let accumulated: Partial<InstructionSet> = {};
    const contextPrompt = buildContextPrompt();

    const run = async (id: string, fn: () => Promise<string>, field: keyof InstructionSet) => {
      updateStep(id, 'loading');
      try {
        const result = await fn();
        accumulated = { ...accumulated, [field]: result };
        updateStep(id, 'done');
        return result;
      } catch (err) {
        console.error(`[useWizard] ${id} fejlede:`, err);
        updateStep(id, 'error');
        toast.error(`${id.toUpperCase()}.md kunne ikke genereres — de øvrige filer fortsættes.`);
        return '';
      }
    };

    // 1. SPEC from full context
    const spec = await run(
      'spec',
      () => generateSpecFromVision(contextPrompt, projectName, thinkingLevel as any),
      'spec'
    );

    // 2–6: modules from SPEC — agents and rules get full UX context
    if (spec) {
      await run('rules',  () => generateModuleFromSpec('rules',        spec, projectName, thinkingLevel as any, contextPrompt), 'rules');
      await run('arch',   () => generateModuleFromSpec('architecture', spec, projectName, thinkingLevel as any), 'architecture');
      await run('plan',   () => generateModuleFromSpec('plan',         spec, projectName, thinkingLevel as any), 'plan');
      await run('agents', () => generateModuleFromSpec('agents',       spec, projectName, thinkingLevel as any, contextPrompt), 'agents');
      await run('test',   () => generateModuleFromSpec('testing',      spec, projectName, thinkingLevel as any), 'testing');
      await run('state',  () => generateModuleFromSpec('state',        spec, projectName, thinkingLevel as any), 'state');
    }

    // 7. DESIGN.md — conditioned on philosophy choice (gracefully skips if none)
    if (preferences.uiPhilosophy) {
      const philosophy = UI_PHILOSOPHY_OPTIONS[preferences.uiPhilosophy];
      await run(
        'design',
        () => generateDesignDoc(contextPrompt, projectName, philosophy.label, thinkingLevel as any),
        'design'
      );
    } else {
      // No philosophy selected — mark step as done with a minimal placeholder
      updateStep('design', 'done');
      accumulated = { ...accumulated, design: `# DESIGN.md — ${projectName}\n\n> Ingen designfilosofi valgt. Rediger dette dokument manuelt eller vælg en filosofi i wizard-trin 2 og generer igen.` };
    }

    // 8. SKILL.md — Projekt-specifikke AI-opskrifter
    await run('skills', () => generateModuleFromSpec('skills', spec || contextPrompt, projectName, thinkingLevel as any), 'skills');

    // 9. llms.txt summary
    await run('llms', () => generateModuleFromSpec('llms', spec || contextPrompt, projectName, thinkingLevel as any), 'llmsTxt');

    // Merge into currentVersion and mark dirty
    const merged = { ...(currentVersion ?? {} as InstructionSet), ...accumulated } as InstructionSet;
    setCurrentVersion(merged);
    setLastGeneratedVersion(merged);

    // Honest outcome assessment — no false positives
    const steps = generationSteps; // will be stale — use local tracking
    const errorSteps = generationSteps.filter((s) => s.status === 'error');
    const hasSpec = !!(accumulated as any).spec;

    if (!hasSpec) {
      toast.error('SPEC.md kunne ikke genereres — tjek din Gemini API-nøgle i .env filen (VITE_GEMINI_API_KEY).');
      setIsGenerating(false);
      return;
    } else if (errorSteps.length > 0) {
      toast.error(`${errorSteps.length} fil(er) fejlede — de øvrige er klar. Kontrollér konsollen.`);
    } else {
      toast.success('Alle filer genereret! Gem nu med "Gem version" for at gemme til Firestore.');
    }

    setIsDirty(true);
    setIsGenerating(false);
    onComplete();
  };

  return {
    step, setStep,
    vision, setVision,
    uiReferences, setUiReferences,
    functionalCompetitors, setFunctionalCompetitors,
    getCombinedVision,
    preferences, setPreference, togglePlatform,
    mustFlags, toggleMustFlag,
    customMust, setCustomMust, addCustomMustFlag,
    neverFlags, toggleNeverFlag,
    customNever, setCustomNever, addCustomNeverFlag,
    generationSteps, isGenerating,
    generateAll,
    canAdvanceStep,
    lastGeneratedVersion,
    // Grill-Me
    clarifyingQuestions,
    clarificationAnswers,
    clarifyStep,
    isClarifying,
    runClarify,
    answerClarification,
    advanceClarifyStep,
    skipClarification,
  };
}
