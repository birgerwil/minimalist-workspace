import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, User } from 'lucide-react';
import { InstructionSet, TabType } from '../types';
import { getTabContent } from '../tabConfig';
import { cn } from '../lib/utils';
import { DiffView } from './DiffView';
import { useTranslation } from '../contexts/LanguageContext';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: InstructionSet[];
  currentVersion: InstructionSet | null;
  activeTab: TabType;
  userId: string;
  diffTarget: InstructionSet | null;
  setDiffTarget: (v: InstructionSet | null) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  onRestore: (version: InstructionSet) => void;
}

export function VersionHistoryPanel({
  isOpen, onClose,
  versions, currentVersion, activeTab,
  userId, diffTarget, setDiffTarget,
  showConfirm, onRestore,
}: VersionHistoryPanelProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/10 backdrop-blur-sm z-30"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-[500px] bg-white border-l border-neutral-200 z-40 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-medium text-neutral-900">{t('history.title')}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {versions.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-8 italic">
                  {t('history.empty')}
                </p>
              )}

              {versions.map((v, idx) => (
                <div key={v.id} className="space-y-2">
                  <button
                    onClick={() => {
                      if (diffTarget?.id === v.id) setDiffTarget(null);
                      else setDiffTarget(v);
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all',
                      v.id === currentVersion?.id
                        ? 'bg-neutral-900 text-neutral-50 border-neutral-900'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold uppercase tracking-wider opacity-60">
                        v{v.version}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-60">
                          {new Date(v.createdAt).toLocaleString(t('history.date_locale'), {
                            day: '2-digit', month: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        {v.id !== currentVersion?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showConfirm(
                                t('history.restore_confirm').replace('{n}', v.version.toString()),
                                () => onRestore(v)
                              );
                            }}
                            className="px-2 py-1 hover:bg-white/20 rounded text-sm font-bold uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity"
                          >
                            {t('history.restore')}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium mb-1">
                      {v.changeSummary || t('history.no_summary')}
                    </p>

                    <div className="flex items-center gap-2 text-sm opacity-50">
                      <User size={10} />
                      <span>{v.createdBy === userId ? t('history.you') : t('history.system')}</span>
                    </div>
                  </button>

                  {/* Inline diff between this version and the previous one */}
                  {diffTarget?.id === v.id && idx < versions.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 text-sm uppercase tracking-widest text-neutral-400 font-bold">
                        {t('history.diff_against').replace('{n}', versions[idx + 1].version.toString())}
                      </div>
                      <DiffView
                        oldText={getTabContent(versions[idx + 1], activeTab)}
                        newText={getTabContent(v, activeTab)}
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
