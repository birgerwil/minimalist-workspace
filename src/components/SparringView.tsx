import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Zap, SkipForward, RefreshCw } from 'lucide-react';
import { InstructionSet } from '../types';
import { useSparring, CritiqueSeverity } from '../hooks/useSparring';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SparringViewProps {
  files: InstructionSet;
  projectName: string;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
  onDone: () => void;
}


// ─── CritiqueCard ──────────────────────────────────────────────────────────────

function CritiqueCard({
  item,
  index,
  onAnswer,
}: {
  item: ReturnType<typeof useSparring>['state']['critiques'][0];
  index: number;
  onAnswer: (id: string, val: string) => void;
}) {
  const { t } = useTranslation();
  const SEVERITY_CONFIG: Record<CritiqueSeverity, { label: string; color: string; dot: string }> = {
    critical:       { label: t('sparring.severity.critical'),    color: 'border-red-200 bg-red-50',    dot: 'bg-red-500' },
    important:      { label: t('sparring.severity.important'),   color: 'border-amber-200 bg-amber-50', dot: 'bg-amber-400' },
    'nice-to-have': { label: t('sparring.severity.nice-to-have'), color: 'border-neutral-200 bg-neutral-50', dot: 'bg-neutral-300' },
  };
  const [expanded, setExpanded] = React.useState(item.severity === 'critical');
  const cfg = SEVERITY_CONFIG[item.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn('border rounded-2xl overflow-hidden transition-all', cfg.color, item.isResolved && 'opacity-70 ring-2 ring-green-300')}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{item.file}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">·</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{item.section}</span>
          </div>
          <p className="text-sm font-medium text-neutral-800 mt-0.5 truncate">{item.weakness}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.isResolved && <CheckCircle size={14} className="text-green-500" />}
          {expanded ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-neutral-200/60 pt-4">
              {/* Why it matters */}
              <div className="flex gap-2.5">
                <Zap size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600 leading-relaxed italic">{item.whyItMatters}</p>
              </div>

              {/* Question + Answer */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-800">{item.question}</p>
                <textarea
                  value={item.answer}
                  onChange={(e) => onAnswer(item.id, e.target.value)}
                  placeholder={t('sparring.answer_placeholder')}
                  rows={3}
                  className="w-full text-sm text-neutral-800 bg-white border border-neutral-200 rounded-xl p-3 resize-none focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300 leading-relaxed transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SparringView({
  files,
  projectName,
  setCurrentVersion,
  setIsDirty,
  onDone,
}: SparringViewProps) {
  const { t } = useTranslation();
  const QUALITY_CONFIG = {
    low:    { label: t('sparring.quality_labels.low'),    color: 'text-red-600',    bar: 'bg-red-400',    pct: 25 },
    medium: { label: t('sparring.quality_labels.medium'), color: 'text-amber-600',  bar: 'bg-amber-400',  pct: 60 },
    high:   { label: t('sparring.quality_labels.high'),   color: 'text-green-600',  bar: 'bg-green-400',  pct: 90 },
  };
  const sparring = useSparring();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      sparring.startAnalysis(files, projectName);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { state } = sparring;
  const quality = QUALITY_CONFIG[state.quality];
  const totalAnswerable = state.critiques.filter((c) => c.severity !== 'nice-to-have').length;

  // ── Analyzing ────────────────────────────────────────────────────────────────
  if (state.phase === 'analyzing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-white px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto relative">
            <div className="w-16 h-16 border-2 border-neutral-100 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light text-neutral-900">{t('sparring.analyzing_title')}</h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {t('sparring.analyzing_desc')}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Refining ─────────────────────────────────────────────────────────────────
  if (state.phase === 'refining') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-white px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto relative">
            <div className="w-16 h-16 border-2 border-neutral-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light text-neutral-900">{t('sparring.refining_title')}</h2>
            <p className="text-sm text-neutral-400">{t('sparring.refining_desc')}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('sparring.title')}</p>
              <h1 className="text-2xl font-light text-neutral-900">{t('sparring.subtitle')}</h1>
            </div>
            <button
              onClick={() => sparring.skipSparring(onDone)}
              className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
            >
              <SkipForward size={12} />
              {t('sparring.skip')}
            </button>
          </div>

          {/* Quality bar */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">{t('sparring.readiness_label')}</span>
              <span className={cn('text-sm font-bold', quality.color)}>{quality.label}</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quality.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', quality.bar)}
              />
            </div>
            <p className="text-sm text-neutral-400">
              {state.critiques.length === 0
                ? t('sparring.no_flaws')
                : t('sparring.flaws_found').replace('{n}', state.critiques.length.toString())}
            </p>
          </div>
        </motion.div>

        {/* Consistency issues */}
        {state.consistencyIssues.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-sm font-bold text-amber-700 uppercase tracking-widest">
                  {t('sparring.consistency_found')
                    .replace('{n}', state.consistencyIssues.length.toString())
                    .replace('{s}', state.consistencyIssues.length > 1 ? (t('common.save') === 'Gem' ? 'er' : 'ies') : '')}
                </span>
              </div>
              {state.consistencyIssues.map((issue) => (
                <div key={issue.id} className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-medium">{issue.files.join(' ↔ ')}:</span>{' '}
                  {issue.description}
                </div>
              ))}
              <p className="text-sm text-amber-600 italic">
                {t('sparring.consistency_fix_note')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Critique cards */}
        {state.critiques.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              {t('sparring.critiques_title')
                .replace('{n}', sparring.answeredCount.toString())
                .replace('{total}', totalAnswerable.toString())}
            </h2>
            <div className="space-y-3">
              {state.critiques.map((item, i) => (
                <CritiqueCard
                  key={item.id}
                  item={item}
                  index={i}
                  onAnswer={sparring.setAnswer}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-3 pb-4">
          {sparring.answeredCount > 0 ? (
            <button
              onClick={() => sparring.refine(files, projectName, setCurrentVersion, setIsDirty, onDone)}
              className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <RefreshCw size={14} />
              {t('sparring.update_files').replace('{n}', sparring.answeredCount.toString())}
            </button>
          ) : (
            <button
              onClick={() => sparring.skipSparring(onDone)}
              className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
            >
              <ArrowRight size={14} />
              {state.critiques.length === 0 ? t('sparring.see_result') : t('sparring.continue_no_changes')}
            </button>
          )}
        </motion.div>

      </div>
    </div>
  );
}
