import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Sparkles, History, Info, LayoutTemplate,
  Type as TypeIcon, Link as LinkIcon, List as ListIcon,
  Copy, Check, Dna
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InstructionSet, TabType } from '../types';
import { TAB_LABEL, EDITOR_TABS, getTabContent, setTabContent } from '../tabConfig';
import { cn } from '../lib/utils';
import { UseAIReturn } from '../hooks/useAI';
import { useTranslation } from '../contexts/LanguageContext';

// ─── Tab list ─────────────────────────────────────────────────────────────────

const WORKBENCH_TABS: string[] = [
  'rules', 'skills', 'workflows', 'llms', 'llms-full',
  'architecture', 'spec', 'plan', 'state', 'agents',
  'testing', 'master-prompt', 'info',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkbenchEditorProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  projectName: string;
  currentVersion: InstructionSet | null;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (dirty: boolean) => void;
  isLoadingVersions: boolean;
  ai: UseAIReturn;
  isCopied: boolean;
  copyToClipboard: (text: string) => void;
  saveVersion: () => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  setViewMode: (mode: 'wizard' | 'status' | 'advanced' | 'om') => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ApplyTemplateButton({ activeTab, currentVersion, setCurrentVersion, setIsDirty, showConfirm }: {
  activeTab: TabType;
  currentVersion: InstructionSet;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
  showConfirm: (msg: string, fn: () => void) => void;
}) {
  const { t } = useTranslation();
  const apply = () => {
    const projectName = 'Navn på din App';
    const lastModPrefix = t('common.version') === 'Version' ? 'Last-Modified' : 'Sidst-ændret';
    const lastModified = `\n\n---\n${lastModPrefix}: ${new Date().toISOString().split('T')[0]}`;
    const existing = getTabContent(currentVersion, activeTab);
    const templates: Record<string, string> = {
      llms: `# ${projectName}\n${t('editor.llms_composer.dna_desc').replace('{file}', 'llms.txt')}\n\nKerne Dokumentation\n-(/docs/architecture.md)${lastModified}`,
      architecture: `# ARCHITECTURE.md - ${projectName}\n\n## ${t('editor.templates.architecture_stack')}\n- **${t('editor.templates.architecture_frontend')}**: React 19 + Vite\n- **${t('editor.templates.architecture_backend')}**: Express.js\n- **${t('editor.templates.architecture_database')}**: Firebase Firestore${lastModified}`,
      spec: `# SPEC.md - ${projectName}\n\n## Vision\n${t('editor.spec_composer.vision.desc')}\n\n## User Stories\n- ${t('editor.spec_composer.stories.desc')}\n\n## Success Criteria\n- [ ] ${t('editor.spec_composer.criteria.desc')}${lastModified}`,
      plan: `# PLAN.md - ${projectName}\n\n## ${t('editor.templates.plan_milestone')}\n- [ ] ${t('editor.templates.plan_task')}${lastModified}`,
      state: `# STATE.md - ${projectName}\n\n## ${t('editor.templates.state_log')}\n- **${new Date().toISOString().split('T')[0]}**: ${t('header.overview')}...${lastModified}`,
      agents: `# AGENTS.md - ${projectName}\n\n## Orchestrator\n- ${t('editor.module_composer.descriptions.agents')}${lastModified}`,
      testing: `# ${t('editor.templates.testing_title')} - ${projectName}\n\n## ${t('editor.templates.testing_workflow')}\n${t('editor.module_composer.descriptions.testing')}${lastModified}`,
    };
    const template = templates[activeTab] || '';
    if (!template) return;
    const doApply = () => {
      setCurrentVersion((prev) => prev ? setTabContent(prev, activeTab, template) : null);
      setIsDirty(true);
    };
    if (existing && existing.trim().length > 50) {
      showConfirm(t('editor.common.template_confirm'), doApply);
    } else {
      doApply();
    }
  };

  return templates_has_entry(activeTab) ? (
    <button
      onClick={apply}
      className="text-sm flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors"
    >
      <LayoutTemplate size={14} />
      {t('editor.common.apply_template')}
    </button>
  ) : null;
}

function templates_has_entry(tab: string): boolean {
  return ['llms', 'architecture', 'spec', 'plan', 'state', 'agents', 'testing'].includes(tab);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkbenchEditor({
  activeTab, setActiveTab, projectName,
  currentVersion, setCurrentVersion, setIsDirty,
  isLoadingVersions, ai,
  isCopied, copyToClipboard,
  saveVersion, showConfirm, setViewMode,
}: WorkbenchEditorProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Tab strip */}
      <div className="flex gap-8 px-8 pt-6 border-b border-neutral-200 overflow-x-auto bg-white flex-shrink-0">
        <button
          onClick={() => setViewMode('status')}
          className="pb-4 text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <ArrowLeft size={14} />
          {t('editor.tabs.overview')}
        </button>
        <div className="w-px h-4 bg-neutral-200 mt-0.5 flex-shrink-0" />

        {WORKBENCH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={cn(
              'pb-4 text-sm font-medium transition-all relative whitespace-nowrap flex-shrink-0',
              activeTab === tab ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            {t(`editor.tabs.${tab}`) || tab}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
              />
            )}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {isLoadingVersions ? (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
              <p className="text-sm text-neutral-400 font-medium uppercase tracking-widest">
                {t('editor.common.loading')}
              </p>
            </div>
          </div>
        ) : !currentVersion ? (
          <div className="flex-1 flex items-center justify-center bg-white p-8 text-center">
            <div className="max-w-sm space-y-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <History size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-900">{t('editor.common.no_versions_title')}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {t('editor.common.no_versions_desc')}
                </p>
              </div>
              </div>
          </div>
        ) : activeTab === 'info' ? (
          <InfoTab ai={ai} />
        ) : (activeTab as string) === 'master-prompt' ? (
          <MasterPromptTab
            projectName={projectName}
            currentVersion={currentVersion}
            isCopied={isCopied}
            copyToClipboard={copyToClipboard}
          />
        ) : (
          <SplitEditorTab
            activeTab={activeTab}
            currentVersion={currentVersion}
            setCurrentVersion={setCurrentVersion}
            setIsDirty={setIsDirty}
            ai={ai}
            isCopied={isCopied}
            copyToClipboard={copyToClipboard}
            showConfirm={showConfirm}
          />
        )}

        {/* AI Suggestion slide-in panel */}
        <AnimatePresence>
          {ai.aiSuggestion && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-[400px] border-l border-neutral-200 bg-neutral-50 p-6 overflow-y-auto shadow-xl flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-medium flex items-center gap-2 text-neutral-900">
                  <Sparkles size={16} className="text-neutral-400" />
                  {t('editor.common.ai_suggestion')}
                </h4>
                <button
                  onClick={() => ai.setAiSuggestion(null)}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>
              <div className="prose prose-neutral prose-sm max-w-none">
                <ReactMarkdown>{ai.aiSuggestion}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function InfoTab({ ai }: { ai: UseAIReturn }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-tight text-neutral-900">{t('editor.guide.title')}</h2>
            <p className="text-sm text-neutral-500">{t('editor.guide.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            {ai.isLoadingGuide && (
              <div className="w-4 h-4 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            )}
            <button
              onClick={ai.fetchGuide}
              disabled={ai.isLoadingGuide}
              className="text-sm uppercase tracking-widest font-bold text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-50"
            >
              {t('editor.guide.update_ai')}
            </button>
            <div className="p-3 bg-neutral-50 rounded-full text-neutral-400">
              <Info size={24} />
            </div>
          </div>
        </div>

        {ai.isLoadingGuide ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            <p className="text-sm text-neutral-400 font-medium uppercase tracking-widest">
              {t('editor.guide.generating')}
            </p>
          </div>
        ) : (
          <div className="markdown-body prose prose-neutral prose-base max-w-none prose-headings:font-light prose-headings:tracking-tight prose-a:text-blue-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {ai.workbenchGuide || t('editor.guide.no_guide')}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

import { buildMasterPrompt } from '../hooks/useVersions';

function MasterPromptTab({
  projectName, currentVersion, isCopied, copyToClipboard,
}: { projectName: string; currentVersion: InstructionSet; isCopied: boolean; copyToClipboard: (t: string) => void }) {
  const { t } = useTranslation();
  const [masterPrompt, setMasterPrompt] = React.useState<string>(t('editor.master_prompt.compiling'));

  React.useEffect(() => {
    async function compilePrompt() {
      try {
        // Fetch custom user agent skills
        let agentSkills: any[] = [];
        try {
          const res = await fetch('/api/agents/skills');
          if (res.ok) agentSkills = (await res.json()).skills || [];
        } catch { /* ignore */ }

        // Fetch Antigravity C-Suite and best practices
        let bestPractices: any[] = [];
        try {
          const res2 = await fetch('/api/best-practices');
          if (res2.ok) bestPractices = (await res2.json()).practices || [];
        } catch { /* ignore */ }

        const promptText = buildMasterPrompt(
          projectName, currentVersion, currentVersion.version || 1, agentSkills, bestPractices
        );
        setMasterPrompt(promptText);
      } catch (e) {
        setMasterPrompt(t('editor.master_prompt.error'));
      }
    }
    compilePrompt();
  }, [projectName, currentVersion]);
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-neutral-900 text-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-sm uppercase tracking-widest text-neutral-400 font-bold">
            {t('editor.master_prompt.title')}
          </h3>
          <p className="text-sm text-neutral-500 italic">
            {t('editor.master_prompt.subtitle')}
          </p>
        </div>
        <button
          onClick={() => copyToClipboard(masterPrompt || '')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors flex items-center gap-2 text-sm border border-white/10"
        >
          {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {isCopied ? t('editor.common.copied') : t('editor.master_prompt.copy_button')}
        </button>
      </div>

      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {masterPrompt}
      </div>

      <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
        <h4 className="text-sm font-bold text-amber-400 uppercase flex items-center gap-2">
          <Info size={12} /> {t('editor.master_prompt.usage_title')}
        </h4>
        <p className="text-sm text-neutral-400 leading-relaxed">
          {t('editor.master_prompt.usage_desc')}
        </p>
      </div>
    </div>
  );
}

function SplitEditorTab({
  activeTab, currentVersion, setCurrentVersion, setIsDirty,
  ai, isCopied, copyToClipboard, showConfirm,
}: {
  activeTab: TabType;
  currentVersion: InstructionSet;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
  ai: UseAIReturn;
  isCopied: boolean;
  copyToClipboard: (t: string) => void;
  showConfirm: (msg: string, fn: () => void) => void;
}) {
  const { t } = useTranslation();
  const isSpecTab = activeTab === 'spec';
  const isModuleTab = ['plan', 'architecture', 'state', 'agents', 'testing', 'rules', 'skills', 'workflows'].includes(activeTab);
  const content = getTabContent(currentVersion, activeTab);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel: Composer */}
      <div className="w-1/2 border-r border-neutral-100 bg-neutral-50/50 p-8 overflow-y-auto space-y-8">
        {isSpecTab ? (
          <SpecComposer ai={ai} currentVersion={currentVersion} />
        ) : isModuleTab ? (
          <ModuleComposer activeTab={activeTab} ai={ai} currentVersion={currentVersion} />
        ) : (
          <LlmsComposer
            activeTab={activeTab}
            currentVersion={currentVersion}
            ai={ai}
            showConfirm={showConfirm}
            setCurrentVersion={setCurrentVersion}
            setIsDirty={setIsDirty}
          />
        )}
      </div>

      {/* Right panel: Final output textarea */}
      <div className="w-1/2 p-8 overflow-y-auto bg-white relative flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-widest text-neutral-400 font-bold">
            Final {activeTab}.{activeTab === 'llms' || activeTab === 'llms-full' ? 'txt' : 'md'}
          </h3>
          <button
            onClick={() => copyToClipboard(content)}
            className="p-2 hover:bg-neutral-50 rounded-md text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm"
          >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {isCopied ? t('editor.common.copied') : t('editor.common.copy')}
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => {
              setCurrentVersion((prev) => prev ? setTabContent(prev, activeTab, e.target.value) : null);
              setIsDirty(true);
            }}
            className="flex-1 w-full bg-neutral-50/30 border border-neutral-100 rounded-xl p-6 text-neutral-700 font-mono text-sm resize-none leading-relaxed focus:outline-none focus:border-neutral-200 transition-colors"
            placeholder={t('editor.llms_composer.final_placeholder').replace('{file}', `${activeTab}.${activeTab === 'llms' || activeTab === 'llms-full' ? 'txt' : 'md'}`)}
          />
          {(activeTab === 'llms' || activeTab === 'llms-full') && (
            <div className="mt-2 flex items-center justify-end gap-2 px-2">
              <span className={cn(
                'text-sm font-medium tracking-wider uppercase',
                content.length > 2048 ? 'text-red-500' :
                content.length > 1600 ? 'text-amber-500' : 'text-neutral-400'
              )}>
                {t('editor.llms_composer.character_limit').replace('{n}', content.length.toString())}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecComposer({ ai, currentVersion }: { ai: UseAIReturn; currentVersion: InstructionSet }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-neutral-100 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" /> {t('editor.spec_composer.title')}
          </h4>
          {ai.visionInput && (
            <button
              onClick={() => ai.setVisionInput('')}
              className="text-[10px] font-bold text-neutral-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              {t('editor.spec_composer.clear')}
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {t('editor.spec_composer.desc').replace('{file}', 'SPEC.md')}
        </p>
        <textarea
          value={ai.visionInput}
          onChange={(e) => ai.setVisionInput(e.target.value)}
          placeholder={t('editor.spec_composer.placeholder')}
          className="w-full h-48 p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 transition-all resize-none leading-relaxed"
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={ai.handleAiSpecGenerate}
            disabled={ai.isAiLoading || !ai.visionInput.trim()}
            className="py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles size={14} className={cn(ai.isAiLoading && 'animate-pulse')} />
            {t('editor.spec_composer.generate_button')}
          </button>
          <button
            onClick={ai.handleAiSpecUpdate}
            disabled={ai.isAiLoading || !ai.visionInput.trim() || !currentVersion.spec}
            className="py-3 border border-neutral-200 bg-white text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <History size={14} />
            {t('editor.spec_composer.update_button')}
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-neutral-100 space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
          <Info size={12} className="text-neutral-400" /> {t('editor.spec_composer.what_is_spec')}
        </h4>
        <div className="space-y-3">
          {[
            ['vision', t('editor.spec_composer.vision.label'), t('editor.spec_composer.vision.desc')],
            ['stories', t('editor.spec_composer.stories.label'), t('editor.spec_composer.stories.desc')],
            ['criteria', t('editor.spec_composer.criteria.label'), t('editor.spec_composer.criteria.desc')],
          ].map(([key, title, desc]) => (
            <div key={key} className="text-sm text-neutral-500 leading-relaxed">
              <span className="font-semibold text-neutral-700">{title}:</span> {desc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleComposer({
  activeTab, ai, currentVersion,
}: { activeTab: TabType; ai: UseAIReturn; currentVersion: InstructionSet }) {
  const { t } = useTranslation();
  const moduleDescriptions: Record<string, string> = {
    rules: t('editor.module_composer.descriptions.rules'),
    skills: t('editor.module_composer.descriptions.skills'),
    workflows: t('editor.module_composer.descriptions.workflows'),
    plan: t('editor.module_composer.descriptions.plan'),
    architecture: t('editor.module_composer.descriptions.architecture'),
    state: t('editor.module_composer.descriptions.state'),
    agents: t('editor.module_composer.descriptions.agents'),
    testing: t('editor.module_composer.descriptions.testing'),
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-neutral-100 rounded-2xl space-y-4 shadow-sm">
        <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
          <Sparkles size={14} className="text-amber-500" />
          {t('editor.module_composer.title').replace('{type}', activeTab.toUpperCase())}
        </h4>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {t('editor.module_composer.desc').replace('{file}', 'SPEC.md')}
        </p>

        {!currentVersion.spec ? (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <Info size={14} />
              {t('editor.module_composer.no_spec')}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
            <p className="text-sm font-bold text-neutral-400 uppercase">{t('editor.module_composer.active_foundation')}</p>
            <p className="text-sm text-neutral-600 line-clamp-3 italic">
              {currentVersion.spec.substring(0, 200)}...
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={ai.handleAiModuleGenerate}
            disabled={ai.isAiLoading || !currentVersion.spec}
            className="py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles size={14} className={cn(ai.isAiLoading && 'animate-pulse')} />
            {t('editor.module_composer.generate_button').replace('{type}', activeTab.toUpperCase())}
          </button>
          <button
            onClick={ai.handleAiModuleUpdate}
            disabled={ai.isAiLoading || !currentVersion.spec || !getTabContent(currentVersion, activeTab)}
            className="py-3 border border-neutral-200 bg-white text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <History size={14} />
            {t('editor.module_composer.update_button').replace('{type}', activeTab.toUpperCase())}
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-neutral-100 space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
          <Info size={12} className="text-neutral-400" /> {t('editor.module_composer.about_title').replace('{type}', activeTab.toUpperCase())}
        </h4>
        <p className="text-sm text-neutral-500 leading-relaxed italic">
          {moduleDescriptions[activeTab] || ''}
        </p>
      </div>
    </div>
  );
}

function LlmsComposer({
  activeTab, currentVersion, ai, showConfirm, setCurrentVersion, setIsDirty,
}: {
  activeTab: TabType;
  currentVersion: InstructionSet;
  ai: UseAIReturn;
  showConfirm: (msg: string, fn: () => void) => void;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="p-5 bg-white border border-neutral-100 rounded-2xl space-y-3 shadow-sm">
        <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
          <Dna size={12} className="text-neutral-400" /> {t('editor.llms_composer.dna_title')}
        </h4>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {t('editor.llms_composer.dna_desc').replace('{file}', 'llms.txt')}
        </p>
        <div className="pt-2 border-t border-neutral-50">
          <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
            <Sparkles size={10} /> {t('editor.llms_composer.ai_update_title')}
          </p>
          <p className="text-sm text-neutral-400 italic">
            {t('editor.llms_composer.ai_update_desc')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-neutral-400 font-bold">{t('editor.llms_composer.composer_elements')}</h3>
        <ApplyTemplateButton
          activeTab={activeTab}
          currentVersion={currentVersion}
          setCurrentVersion={setCurrentVersion}
          setIsDirty={setIsDirty}
          showConfirm={showConfirm}
        />
      </div>

      <div className="space-y-6">
        {[
          [TypeIcon, 'intro', t('editor.llms_composer.elements.intro.label'), t('editor.llms_composer.elements.intro.desc')],
          [LinkIcon, 'links', t('editor.llms_composer.elements.links.label'), t('editor.llms_composer.elements.links.desc')],
          [ListIcon, 'rules', t('editor.llms_composer.elements.rules.label'), t('editor.llms_composer.elements.rules.desc')],
        ].map(([Icon, key, label, desc]) => (
          <div key={key as string} className="space-y-2">
            <label className="text-sm font-bold text-neutral-400 uppercase flex items-center gap-2">
              <Icon size={12} /> {label as string}
            </label>
            <p className="text-sm text-neutral-400 italic">{desc as string}</p>
          </div>
        ))}

        <div className="pt-4 border-t border-neutral-100">
          <button
            onClick={ai.handleAiImprove}
            disabled={ai.isAiLoading}
            className="w-full py-3 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-white hover:border-neutral-300 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className={cn(ai.isAiLoading && 'animate-pulse')} />
            {ai.isAiLoading ? t('editor.llms_composer.improving') : t('editor.llms_composer.improve_button')}
          </button>
        </div>

        <div className="pt-8 border-t border-neutral-100 space-y-4">
          <h4 className="text-sm font-bold text-neutral-900 uppercase flex items-center gap-2">
            <Info size={12} className="text-neutral-400" /> {t('editor.llms_composer.best_practices_title')}
          </h4>
          <div className="space-y-3">
            {[
              ['light', t('editor.llms_composer.best_practices.light.label'), t('editor.llms_composer.best_practices.light.desc')],
              ['transparency', t('editor.llms_composer.best_practices.transparency.label'), t('editor.llms_composer.best_practices.transparency.desc')],
              ['extra', t('editor.llms_composer.best_practices.extra.label'), t('editor.llms_composer.best_practices.extra.desc')],
              ['no_noise', t('editor.llms_composer.best_practices.no_noise.label'), t('editor.llms_composer.best_practices.no_noise.desc')],
            ].map(([key, title, desc]) => (
              <div key={title} className="text-sm text-neutral-500 leading-relaxed">
                <span className="font-semibold text-neutral-700">{title}:</span> {desc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
