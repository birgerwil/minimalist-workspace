import { useState, useEffect } from 'react';
import { InstructionSet, Project, TabType } from '../types';
import { TAB_LABEL, getTabContent, setTabContent } from '../tabConfig';
import {
  getImprovementSuggestions,
  getWorkbenchGuide,
  generateSpecFromVision,
  updateSpecFromVision,
  generateModuleFromSpec,
  updateModuleFromSpec,
} from '../services/gemini';
import { toast } from 'sonner';

// ─── Static Guide Fallback ────────────────────────────────────────────────────

export const STATIC_GUIDE = `
# AI Tuner Workbench: Antigravity & GSD Matrice

Brug denne matrice til at forstå, hvordan Google Antigravity og GSD Frameworket (Get-Shit-Done) erstatter traditionelle systeminstrukser.

| Modul | Formål (Hvad opnår du?) | Struktur (Hvordan?) | AI Betydning (Hvorfor?) |
| :--- | :--- | :--- | :--- |
| **Rules** | Overordnet adfærd og kodestil. | Rolle -> Regler -> Begrænsninger. | Analogen til SI. Guider agentens fundamentale adfærd. |
| **Agent Skills** | Specialiseret ekspertise og viden. | SKILL.md i dedikerede mapper. | Progressive Disclosure: Agenten læser kun det relevante. |
| **Workflows** | On-demand værktøjer og prompts. | /-kommandoer (f.eks. /generate-tests). | Giver kontrol over specifikke, gentagne opgaver. |
| **SPEC.md** | Projektets vision og mål. | Vision -> User Stories -> Success Criteria. | "Causal Anchor" for agentens ræsonnement. |
| **PLAN.md** | Atomiske opgaver og verificering. | Task List -> Verification -> Dependencies. | Giver agenten en trinvis køreplan med klare stop-krav. |
| **ARCHITECTURE.md** | Teknisk blueprint og rammer. | Tech Stack -> Data Flow -> Security. | Forhindrer arkitektonisk drift og "Frankenstein" kode. |
| **STATE.md** | Log over valg og fremskridt. | Session Log -> Decisions -> Blockers. | Bevarer kontinuitet på tværs af sessioner. |
| **llms.txt** | Projektets "Kort" og metadata. | Oversigt over vigtige filer/mapper. | Gør projektet scanbart og maskinlæsbart på få ms. |
| **testing.md** | QA & Test Protokol. | TDD Workflow + Validering. | Tvinger AI'en til at prioritere stabilitet. |
| **Master Prompt** | Din "Kompilator" og eksport-pakke. | Aggregering af alle moduler. | Giver eksterne agenter øjeblikkelig total-kontekst. |

---

### Sådan bruger du din Workbench
1. **Definer Rules & Skills** for at sætte rammerne for din agent.
2. **Udfyld GSD-dokumenterne** (SPEC, PLAN, ARCHITECTURE, STATE).
3. **Gem en version** for at opdatere din Master Prompt.
4. **Brug Workflows** til at automatisere specifikke opgaver.
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseAIReturn {
  isAiLoading: boolean;
  aiSuggestion: string | null;
  visionInput: string;
  workbenchGuide: string | null;
  isLoadingGuide: boolean;
  setAiSuggestion: (s: string | null) => void;
  setVisionInput: (v: string) => void;
  handleAiImprove: () => Promise<void>;
  handleAiSpecGenerate: () => Promise<void>;
  handleAiSpecUpdate: () => Promise<void>;
  handleAiModuleGenerate: () => Promise<void>;
  handleAiModuleUpdate: () => Promise<void>;
  fetchGuide: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAI(
  activeTab: TabType,
  currentVersion: InstructionSet | null,
  selectedProject: Project | null,
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
  setIsDirty: (dirty: boolean) => void
): UseAIReturn {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [visionInput, setVisionInput] = useState('');
  const [workbenchGuide, setWorkbenchGuide] = useState<string | null>(STATIC_GUIDE);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);

  const projectName = selectedProject?.name || 'Projekt';

  // Fetch fresh Workbench Guide on mount (static fallback is shown immediately)
  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    setIsLoadingGuide(true);
    try {
      const guide = await getWorkbenchGuide(currentVersion?.thinkingLevel);
      setWorkbenchGuide(guide ?? STATIC_GUIDE);
    } catch {
      setWorkbenchGuide(STATIC_GUIDE);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleAiImprove = async () => {
    if (!currentVersion) return;
    setIsAiLoading(true);
    try {
      const content = getTabContent(currentVersion, activeTab);
      const suggestion = await getImprovementSuggestions(
        activeTab,
        content,
        currentVersion.thinkingLevel
      );
      setAiSuggestion(suggestion);
    } catch (err) {
      console.error(err);
      toast.error('AI Improve fejlede. Tjek API-nøglen.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSpecGenerate = async () => {
    if (!currentVersion || !visionInput.trim()) return;
    setIsAiLoading(true);
    try {
      const newSpec = await generateSpecFromVision(
        visionInput,
        projectName,
        currentVersion.thinkingLevel
      );
      setCurrentVersion((prev) => prev ? { ...prev, spec: newSpec ?? '' } : null);
      setIsDirty(true);
      toast.success('SPEC.md genereret fra din vision!');
    } catch (err) {
      console.error(err);
      toast.error('Kunne ikke generere SPEC.md');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSpecUpdate = async () => {
    if (!currentVersion || !visionInput.trim()) return;
    setIsAiLoading(true);
    try {
      const updatedSpec = await updateSpecFromVision(
        visionInput,
        currentVersion.spec || '',
        projectName,
        currentVersion.thinkingLevel
      );
      setCurrentVersion((prev) => prev ? { ...prev, spec: updatedSpec ?? '' } : null);
      setIsDirty(true);
      toast.success('SPEC.md opdateret med dine nye input!');
    } catch (err) {
      console.error(err);
      toast.error('Kunne ikke opdatere SPEC.md');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiModuleGenerate = async () => {
    if (!currentVersion?.spec) {
      toast.error('Du skal have en SPEC.md som fundament først!');
      return;
    }
    setIsAiLoading(true);
    try {
      const newContent = await generateModuleFromSpec(
        activeTab,
        currentVersion.spec,
        projectName,
        currentVersion.thinkingLevel
      );
      setCurrentVersion((prev) =>
        prev ? setTabContent(prev, activeTab, newContent ?? '') : null
      );
      setIsDirty(true);
      toast.success(`${TAB_LABEL[activeTab] || activeTab} genereret fra SPEC.md fundamentet!`);
    } catch (err) {
      console.error(err);
      toast.error(`Kunne ikke generere ${TAB_LABEL[activeTab] || activeTab}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiModuleUpdate = async () => {
    if (!currentVersion?.spec) {
      toast.error('Du skal have en SPEC.md som fundament først!');
      return;
    }
    setIsAiLoading(true);
    try {
      const existingContent = getTabContent(currentVersion, activeTab);
      const updatedContent = await updateModuleFromSpec(
        activeTab,
        currentVersion.spec,
        existingContent,
        projectName,
        currentVersion.thinkingLevel
      );
      setCurrentVersion((prev) =>
        prev ? setTabContent(prev, activeTab, updatedContent ?? '') : null
      );
      setIsDirty(true);
      toast.success(`${TAB_LABEL[activeTab] || activeTab} opdateret baseret på SPEC.md!`);
    } catch (err) {
      console.error(err);
      toast.error(`Kunne ikke opdatere ${TAB_LABEL[activeTab] || activeTab}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    isAiLoading,
    aiSuggestion,
    visionInput,
    workbenchGuide,
    isLoadingGuide,
    setAiSuggestion,
    setVisionInput,
    handleAiImprove,
    handleAiSpecGenerate,
    handleAiSpecUpdate,
    handleAiModuleGenerate,
    handleAiModuleUpdate,
    fetchGuide,
  };
}
