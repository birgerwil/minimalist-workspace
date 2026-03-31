import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Sparkles, RefreshCw, ChevronRight, FileText, Info, Dna } from 'lucide-react';
import { InstructionSet, Project } from '../types';
import { getTabContent } from '../tabConfig';
import { buildMasterPrompt } from '../hooks/useVersions';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProjectStatusProps {
  project: Project;
  currentVersion: InstructionSet | null;
  isDirty: boolean;
  onOpenWizard: () => void;
  onOpenAdvanced: (tab?: string) => void;
  onSave: () => void;
}

// ─── GSD file status items ─────────────────────────────────────────────────────

const GSD_FILES = [
  { tab: 'spec' },
  { tab: 'architecture' },
  { tab: 'plan' },
  { tab: 'agents' },
  { tab: 'rules' },
  { tab: 'testing' },
  { tab: 'state' },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function ProjectStatus({
  project,
  currentVersion,
  isDirty,
  onOpenWizard,
  onOpenAdvanced,
  onSave,
}: ProjectStatusProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const [masterPrompt, setMasterPrompt] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState(false);

  React.useEffect(() => {
    async function compilePrompt() {
      if (!currentVersion) {
        setMasterPrompt('');
        return;
      }
      setIsCompiling(true);
      try {
        let agentSkills: any[] = [];
        try {
          const res = await fetch('/api/agents/skills');
          if (res.ok) agentSkills = (await res.json()).skills || [];
        } catch { /* ignore */ }

        let bestPractices: any[] = [];
        try {
          const res2 = await fetch('/api/best-practices');
          if (res2.ok) bestPractices = (await res2.json()).practices || [];
        } catch { /* ignore */ }

        const promptText = buildMasterPrompt(
          project.name, currentVersion, currentVersion.version || 1, agentSkills, bestPractices
        );
        setMasterPrompt(promptText);
      } catch (e) {
        setMasterPrompt(t('editor.master_prompt.error') || 'Error compiling prompt');
      } finally {
        setIsCompiling(false);
      }
    }
    compilePrompt();
  }, [project.name, currentVersion, t]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileScore = (tab: string): 'empty' | 'thin' | 'good' => {
    if (!currentVersion) return 'empty';
    const content = getTabContent(currentVersion, tab as any);
    if (!content || content.trim().length < 50) return 'empty';
    if (content.trim().length < 300) return 'thin';
    return 'good';
  };

  const scoreCount = GSD_FILES.reduce(
    (acc, f) => {
      acc[getFileScore(f.tab)]++;
      return acc;
    },
    { empty: 0, thin: 0, good: 0 }
  );

  const readinessPercent = Math.round(
    ((scoreCount.good + scoreCount.thin * 0.5) / GSD_FILES.length) * 100
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-12 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('status.project_label')}</p>
              <h1 className="text-3xl font-light tracking-tight text-neutral-900">{project.name}</h1>
            </div>

            {/* Readiness ring */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f5f5f5" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={readinessPercent >= 80 ? '#22c55e' : readinessPercent >= 40 ? '#f59e0b' : '#e5e7eb'}
                    strokeWidth="3"
                    strokeDasharray={`${readinessPercent * 0.942} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-900">
                  {readinessPercent}%
                </span>
              </div>
              <p className="text-sm text-neutral-400">{t('status.readiness')}</p>
            </div>
          </div>

          {/* Dirty indicator */}
          {isDirty && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm text-amber-700">{t('status.unsaved_changes')}</span>
              <button onClick={onSave} className="ml-auto text-sm text-amber-700 font-medium hover:text-amber-900 underline">
                {t('status.save_now')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Master Prompt CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 bg-neutral-900 rounded-2xl space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Master Prompt</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {t('status.master_prompt_desc')}
            </p>
          </div>

          <button
            onClick={handleCopy}
            disabled={!currentVersion || isCompiling}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
              copied
                ? 'bg-green-500 text-white'
                : (currentVersion && !isCompiling)
                ? 'bg-white text-neutral-900 hover:bg-neutral-100'
                : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
            )}
          >
            {copied ? <Check size={14} /> : isCompiling ? <RefreshCw className="animate-spin" size={14} /> : <Copy size={14} />}
            {copied ? t('editor.common.copied') : isCompiling ? t('editor.master_prompt.compiling') : t('editor.master_prompt.copy_button')}
          </button>

          {masterPrompt && (
            <p className="text-sm text-neutral-500 text-center">
              {t('status.chars').replace('{n}', Math.round(masterPrompt.length / 1000).toString())} · {t('status.lines').replace('{n}', masterPrompt.split('\n').length.toString())}
            </p>
          )}
        </motion.div>

        {/* GSD file status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('status.overview_title')}</h2>

          <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
            {GSD_FILES.map(({ tab }) => {
              const label = t(`wizard.generate_files.ai.${tab === 'architecture' ? 'arch' : tab}.label`);
              const desc = t(`wizard.generate_files.ai.${tab === 'architecture' ? 'arch' : tab}.desc`);
              const score = getFileScore(tab);
              const isExpanded = expandedFile === tab;
              const preview = currentVersion ? getTabContent(currentVersion, tab as any) : '';

              return (
                <div key={tab}>
                  <button
                    onClick={() => setExpandedFile(isExpanded ? null : tab)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      score === 'good'  ? 'bg-green-400' :
                      score === 'thin'  ? 'bg-amber-400' :
                      'bg-neutral-200'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{label}</p>
                      <p className="text-sm text-neutral-400">{desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {score === 'empty' && (
                        <span className="text-sm text-neutral-300">{t('status.not_generated')}</span>
                      )}
                      {score === 'thin' && (
                        <span className="text-sm text-amber-500">{t('status.sparse')}</span>
                      )}
                      {score === 'good' && (
                        <span className="text-sm text-green-500">{t('status.ready')}</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenAdvanced(tab); }}
                        className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-0.5"
                      >
                        <FileText size={12} />
                      </button>
                      <ChevronRight
                        size={14}
                        className={cn('text-neutral-300 transition-transform', isExpanded && 'rotate-90')}
                      />
                    </div>
                  </button>

                  {isExpanded && preview && (
                    <div className="px-5 pb-4 bg-neutral-50">
                      <pre className="text-sm text-neutral-500 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono">
                        {preview.slice(0, 600)}{preview.length > 600 ? '\n…' : ''}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3"
        >
          <button
            onClick={onOpenWizard}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-xl transition-colors"
          >
            <RefreshCw size={14} />
            {t('status.update_input')}
          </button>
          <button
            onClick={() => onOpenAdvanced()}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-neutral-200 hover:border-neutral-400 text-neutral-600 text-sm font-medium rounded-xl transition-colors"
          >
            <Sparkles size={14} />
            {t('status.advanced_edit')}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
