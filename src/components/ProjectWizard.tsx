import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Check, Plus, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { InstructionSet } from '../types';
import { cn } from '../lib/utils';
import { useApiKey } from '../hooks/useApiKey';
import { useTranslation } from '../contexts/LanguageContext';
import {
  useWizard,
  PLATFORM_OPTIONS,
  SCALE_OPTIONS,
  TEMPO_OPTIONS,
  UI_PHILOSOPHY_OPTIONS,
  MUST_FLAG_SUGGESTIONS,
  NEVER_FLAG_SUGGESTIONS,
  PlatformKey,
  ScaleKey,
  TempoKey,
  UIPhilosophyKey,
} from '../hooks/useWizard';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProjectWizardProps {
  projectName: string;
  thinkingLevel: string;
  currentVersion: InstructionSet | null;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
  onComplete: () => void;
  onSkipToAdvanced: () => void;
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const { t } = useTranslation();
  const steps = [
    t('wizard.steps.vision'),
    t('wizard.steps.clarify'),
    t('wizard.steps.prefs'),
    t('wizard.steps.flags'),
    t('wizard.steps.generate')
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const n = idx + 1;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  done ? 'bg-neutral-900 text-white' : active ? 'bg-neutral-900 text-white ring-4 ring-neutral-200' : 'bg-neutral-100 text-neutral-400'
                )}
              >
                {done ? <Check size={12} /> : n}
              </div>
              <span className={cn('text-sm font-medium', active ? 'text-neutral-900' : 'text-neutral-400')}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn('flex-1 h-px mx-3 min-w-8', n < current ? 'bg-neutral-900' : 'bg-neutral-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Consequence card ──────────────────────────────────────────────────────────

function ConsequenceCard({ label, pros, cons, stack }: { label?: string; pros: string[]; cons: string[]; stack: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3"
    >
      {label && <p className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{label}</p>}
      <div className="space-y-1">
        {pros.map((p) => (
          <div key={p} className="flex items-start gap-2 text-sm text-neutral-600">
            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
            {p}
          </div>
        ))}
        {cons.map((c) => (
          <div key={c} className="flex items-start gap-2 text-sm text-neutral-500">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
            {c}
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-neutral-100 text-sm text-neutral-400 font-mono">{stack}</div>
    </motion.div>
  );
}

// ─── Flag chip ─────────────────────────────────────────────────────────────────

function FlagChip({
  label,
  selected,
  onToggle,
  removable = false,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  removable?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-left transition-all border',
        selected
          ? 'bg-neutral-900 text-white border-neutral-900'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
      )}
    >
      {selected ? <Check size={10} className="flex-shrink-0" /> : <Plus size={10} className="flex-shrink-0 opacity-50" />}
      <span>{label}</span>
      {selected && removable && <X size={10} className="flex-shrink-0 ml-1 opacity-60" />}
    </button>
  );
}

// ─── Step 1: Vision ────────────────────────────────────────────────────────────

function Step1Vision({ wizard }: { wizard: ReturnType<typeof useWizard> }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.step1.title')}</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {t('wizard.step1.desc')}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step1.needs_label')}</h3>
        <textarea
          value={wizard.vision}
          onChange={(e) => wizard.setVision(e.target.value)}
          placeholder={t('wizard.step1.needs_placeholder')}
          rows={5}
          autoFocus
          className="w-full px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 bg-neutral-50 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-neutral-400 focus:bg-white transition-all leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className={cn('text-sm', wizard.vision.length < 30 ? 'text-neutral-300' : 'text-neutral-400')}>
            {wizard.vision.length < 30 
              ? t('wizard.step1.needs_min_chars').replace('{n}', (30 - wizard.vision.length).toString())
              : t('wizard.step1.needs_good').replace('{n}', wizard.vision.length.toString())}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step1.ref_label')}</h3>
        <input
          value={wizard.functionalCompetitors}
          onChange={(e) => wizard.setFunctionalCompetitors(e.target.value)}
          placeholder={t('wizard.step1.ref_placeholder')}
          className="w-full px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white transition-all"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step1.ui_label')}</h3>
        <input
          value={wizard.uiReferences}
          onChange={(e) => wizard.setUiReferences(e.target.value)}
          placeholder={t('wizard.step1.ui_placeholder')}
          className="w-full px-4 py-3 text-sm text-neutral-900 placeholder-neutral-300 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}

// ─── Step 2: Præferencer — multi-select platform ───────────────────────────────

function Step2Preferences({
  preferences,
  setPreference,
  togglePlatform,
}: {
  preferences: ReturnType<typeof useWizard>['preferences'];
  setPreference: ReturnType<typeof useWizard>['setPreference'];
  togglePlatform: ReturnType<typeof useWizard>['togglePlatform'];
}) {
  const { t, language } = useTranslation();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.step2.title')}</h2>
        <p className="text-sm text-neutral-500">
          {t('wizard.step2.desc')}
        </p>
      </div>

      {/* Platform — MULTI-SELECT (toggle) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step2.platform')}</h3>
          {preferences.platforms.length > 1 && (
            <span className="text-sm text-amber-600 font-medium">{t('wizard.step2.platform_multi')}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(PLATFORM_OPTIONS) as [PlatformKey, (typeof PLATFORM_OPTIONS)[PlatformKey]][]).map(
            ([key, opt]) => {
              const selected = preferences.platforms.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all',
                    selected
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-sm font-medium">{t(`wizard.options.platforms.${key}.label`)}</span>
                    {selected && <Check size={14} className="ml-auto" />}
                  </div>
                </button>
              );
            }
          )}
        </div>

        {/* Consequence cards for each selected platform */}
        <AnimatePresence>
          {preferences.platforms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {preferences.platforms.map((p) => (
                <ConsequenceCard
                  key={p}
                  label={t(`wizard.options.platforms.${p}.label`)}
                  pros={t(`wizard.options.platforms.${p}.pros`) as any}
                  cons={t(`wizard.options.platforms.${p}.cons`) as any}
                  stack={PLATFORM_OPTIONS[p].stack}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scale */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step2.scale')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(SCALE_OPTIONS) as [ScaleKey, (typeof SCALE_OPTIONS)[ScaleKey]][]).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => setPreference('scale', key)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                preferences.scale === key
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              )}
            >
              <span className="text-xl">{opt.icon}</span>
              <p className={cn('text-sm font-semibold mt-2', preferences.scale === key ? 'text-white' : 'text-neutral-900')}>
                {t(`wizard.options.scale.${key}.label`)}
              </p>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {preferences.scale && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-sm text-neutral-600 leading-relaxed"
            >
              {t(`wizard.options.scale.${preferences.scale}.desc`)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tempo */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.step2.tempo')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(TEMPO_OPTIONS) as [TempoKey, (typeof TEMPO_OPTIONS)[TempoKey]][]).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => setPreference('tempo', key)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                preferences.tempo === key
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              )}
            >
              <span className="text-xl">{opt.icon}</span>
              <p className={cn('text-sm font-semibold mt-2', preferences.tempo === key ? 'text-white' : 'text-neutral-900')}>
                {t(`wizard.options.tempo.${key}.label`)}
              </p>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {preferences.tempo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-sm text-neutral-600 leading-relaxed"
            >
              {t(`wizard.options.tempo.${preferences.tempo}.desc`)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Optional stack note */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          {t('wizard.step2.custom_stack')}
        </h3>
        <input
          type="text"
          value={preferences.customStack}
          onChange={(e) => setPreference('customStack', e.target.value)}
          placeholder={t('wizard.step2.custom_stack_placeholder')}
          className="w-full px-4 py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 transition-all"
        />
      </div>

      {/* UI Design Philosophy */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          {t('wizard.step2.philosophy')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(UI_PHILOSOPHY_OPTIONS) as [UIPhilosophyKey, (typeof UI_PHILOSOPHY_OPTIONS)[UIPhilosophyKey]][]).map(([key, opt]) => {
            const isSelected = preferences.uiPhilosophy === key;
            return (
              <button
                key={key}
                onClick={() => setPreference('uiPhilosophy', isSelected ? null : key)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative',
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <Check size={10} className="text-neutral-900" />
                  </span>
                )}
                <span className="text-lg font-light">{opt.icon}</span>
                <p className={cn('text-sm font-semibold mt-2 mb-0.5', isSelected ? 'text-white' : 'text-neutral-900')}>
                  {opt.label}
                </p>
                <p className={cn('text-sm leading-snug', isSelected ? 'text-neutral-300' : 'text-neutral-400')}>
                  {opt.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Expanded detail when selected */}
        <AnimatePresence>
          {preferences.uiPhilosophy && (() => {
            const p = UI_PHILOSOPHY_OPTIONS[preferences.uiPhilosophy];
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3"
              >
                <div className="space-y-1">
                  {p.characteristics.map((c) => (
                    <div key={c} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-neutral-400 mt-0.5 flex-shrink-0">✦</span>{c}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-sm text-neutral-400">
                    <span className="font-medium text-neutral-500">{t('wizard.step2.inspiration')}</span> {p.inspiration}
                  </p>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step 3: Hjørneflag ────────────────────────────────────────────────────────

import { FlagSuggestion } from '../hooks/useWizard';

function FlagGroup({
  category,
  flags,
  activeFlags,
  onToggle,
}: {
  category: string;
  flags: FlagSuggestion[];
  activeFlags: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">{category}</p>
      <div className="space-y-1.5">
        {flags.map((f) => {
          const active = activeFlags.includes(f.label);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onToggle(f.label)}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all border',
                active
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
              )}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold leading-snug', active ? 'text-white' : 'text-neutral-800')}>
                  {f.label}
                </p>
                <p className={cn('text-sm mt-0.5 leading-snug', active ? 'text-neutral-300' : 'text-neutral-400')}>
                  {f.description}
                </p>
              </div>
              {active && <Check size={14} className="flex-shrink-0 mt-1 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AIFlagInput({
  value,
  onChange,
  onAdd,
  placeholder,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
  type: 'must' | 'never';
}) {
  const [isPolishing, setIsPolishing] = useState(false);
  const { t, language } = useTranslation();

  const handlePolish = async () => {
    if (!value.trim()) return;
    setIsPolishing(true);
    try {
      // Call the Gemini API directly inline — avoids circular import
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('No API key');
      
      const langName = language === 'da' ? 'dansk' : 'engelsk';
      const prompt = type === 'must'
        ? `Du er en senior software arkitekt. Omformulér dette SKAL-krav til ét skarpt, konkret teknisk princip på ${langName} (maks 10 ord, ingen punktum til sidst): "${value}". Returner kun den omformulerede tekst.`
        : `Du er en senior software arkitekt. Omformulér dette ALDRIG-forbud til ét skarpt, konkret teknisk forbud på ${langName} (maks 10 ord, ingen punktum til sidst): "${value}". Returner kun den omformulerede tekst.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      const polished = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (polished) onChange(polished);
    } catch {
      // Fail silently — user keeps their original text
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-sm text-neutral-400">Skriv dit eget — AI hjælper dig formulere det præcist:</p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isPolishing && onAdd()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={handlePolish}
          disabled={isPolishing || !value.trim()}
          title={t('wizard.step3.ai_polish')}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {isPolishing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {isPolishing ? t('wizard.step3.polishing') : t('wizard.step3.ai_polish')}
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={!value.trim()}
          className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors disabled:opacity-40"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function Step3Flags({
  mustFlags, toggleMustFlag, customMust, setCustomMust, addCustomMustFlag,
  neverFlags, toggleNeverFlag, customNever, setCustomNever, addCustomNeverFlag,
}: {
  mustFlags: string[]; toggleMustFlag: (f: string) => void;
  customMust: string; setCustomMust: (v: string) => void; addCustomMustFlag: () => void;
  neverFlags: string[]; toggleNeverFlag: (f: string) => void;
  customNever: string; setCustomNever: (v: string) => void; addCustomNeverFlag: () => void;
}) {
  const { t } = useTranslation();
  // Group suggestions by category
  const mustByCategory = MUST_FLAG_SUGGESTIONS.reduce<Record<string, FlagSuggestion[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});
  const neverByCategory = NEVER_FLAG_SUGGESTIONS.reduce<Record<string, FlagSuggestion[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  // Custom flags = flags not in suggestions
  const knownMustLabels = MUST_FLAG_SUGGESTIONS.map((f) => f.label);
  const knownNeverLabels = NEVER_FLAG_SUGGESTIONS.map((f) => f.label);
  const customMustFlags = mustFlags.filter((f) => !knownMustLabels.includes(f));
  const customNeverFlags = neverFlags.filter((f) => !knownNeverLabels.includes(f));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.step3.title')}</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {t('wizard.step3.desc')}
          <br />
          <span className="text-neutral-400">{t('wizard.step3.desc_note')}</span>
        </p>
      </div>

      {/* ── SKAL ────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="text-sm font-semibold text-neutral-900">{t('wizard.step3.must_title')}</h3>
          {mustFlags.length > 0 && (
            <span className="ml-auto text-sm text-neutral-400">{t('wizard.step3.selected').replace('{n}', mustFlags.length.toString())}</span>
          )}
        </div>

        {Object.entries(mustByCategory).map(([cat, flags]) => (
          <FlagGroup
            key={cat}
            category={cat}
            flags={flags}
            activeFlags={mustFlags}
            onToggle={toggleMustFlag}
          />
        ))}

        {/* Custom must flags */}
        {customMustFlags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customMustFlags.map((f) => (
              <FlagChip key={f} label={f} selected onToggle={() => toggleMustFlag(f)} removable />
            ))}
          </div>
        )}

        <AIFlagInput
          value={customMust}
          onChange={setCustomMust}
          onAdd={addCustomMustFlag}
          placeholder="Fx: Appen må aldrig sende e-mails uden brugerbekræftelse…"
          type="must"
        />
      </div>

      <div className="h-px bg-neutral-100" />

      {/* ── ALDRIG ──────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <h3 className="text-sm font-semibold text-neutral-900">{t('wizard.step3.never_title')}</h3>
          {neverFlags.length > 0 && (
            <span className="ml-auto text-sm text-neutral-400">{t('wizard.step3.selected').replace('{n}', neverFlags.length.toString())}</span>
          )}
        </div>

        {Object.entries(neverByCategory).map(([cat, flags]) => (
          <FlagGroup
            key={cat}
            category={cat}
            flags={flags}
            activeFlags={neverFlags}
            onToggle={toggleNeverFlag}
          />
        ))}

        {/* Custom never flags */}
        {customNeverFlags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customNeverFlags.map((f) => (
              <FlagChip key={f} label={f} selected onToggle={() => toggleNeverFlag(f)} removable />
            ))}
          </div>
        )}

        <AIFlagInput
          value={customNever}
          onChange={setCustomNever}
          onAdd={addCustomNeverFlag}
          placeholder="Fx: Ingen gamification-elementer eller badges…"
          type="never"
        />
      </div>
    </div>
  );
}

// ─── Step 4: Review Basket + Generation ───────────────────────────────────────

// Human-readable summary row
function OrderRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <span className="text-base w-5 flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{label}</p>
        <div className="text-sm text-neutral-800 leading-snug">{value}</div>
      </div>
    </div>
  );
}

// The file list that will be generated
// AI-generated files: tailored to your vision
const AI_FILES = [
  { name: 'SPEC.md',          key: 'spec' },
  { name: 'rules.md',         key: 'rules' },
  { name: 'architecture.md',  key: 'arch' },
  { name: 'PLAN.md',          key: 'plan' },
  { name: 'AGENTS.md',        key: 'agents' },
  { name: 'testing.md',       key: 'testing' },
  { name: 'STATE.md',         key: 'state' },
  { name: 'DESIGN.md',        key: 'design' },
  { name: 'SKILL.md',         key: 'skills' },
  { name: 'llms.txt',         key: 'llms' },
];

const BASELINE_FILES = [
  { name: 'workflows.md',     key: 'workflows' },
  { name: 'CHANGELOG.md',     key: 'changelog' },
  { name: 'CONTRIBUTING.md',  key: 'contributing' },
  { name: 'SECURITY.md',      key: 'security' },
];

// Combined for backward compat where needed
const GENERATED_FILES = [...AI_FILES, ...BASELINE_FILES];

function Step4Generate({
  wizard,
  projectName,
  thinkingLevel,
  currentVersion,
  setCurrentVersion,
  setIsDirty,
  onComplete,
}: {
  wizard: ReturnType<typeof useWizard>;
  projectName: string;
  thinkingLevel: string;
  currentVersion: InstructionSet | null;
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>;
  setIsDirty: (v: boolean) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState(false);

  const allDone = wizard.generationSteps.every((s) => s.status === 'done' || s.status === 'error');
  const hasStarted = wizard.generationSteps.some((s) => s.status !== 'pending');

  const handleConfirm = () => {
    setConfirmed(true);
    wizard.generateAll(currentVersion, projectName, thinkingLevel, setCurrentVersion, setIsDirty, onComplete);
  };

  // ── Phase B: Generation in progress ──────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">
            {allDone ? t('wizard.step4.done_title') : t('wizard.step4.generating_title')}
          </h2>
          <p className="text-sm text-neutral-500">
            {allDone
              ? t('wizard.step4.done_desc')
              : t('wizard.step4.generating_desc')}
          </p>
        </div>

        <div className="space-y-1">
          {wizard.generationSteps.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {s.status === 'done'    && <CheckCircle2 size={16} className="text-green-500" />}
                {s.status === 'loading' && <Loader2 size={16} className="text-neutral-600 animate-spin" />}
                {s.status === 'error'   && <AlertCircle size={16} className="text-red-400" />}
                {s.status === 'pending' && <div className="w-2 h-2 rounded-full bg-neutral-200" />}
              </div>
              <span className={cn(
                'text-sm',
                s.status === 'done'    ? 'text-neutral-900' :
                s.status === 'loading' ? 'text-neutral-700 font-medium' :
                s.status === 'error'   ? 'text-red-400' :
                'text-neutral-300'
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Phase A: Review Basket ────────────────────────────────────────────────────
  const philosophy = wizard.preferences.uiPhilosophy
    ? UI_PHILOSOPHY_OPTIONS[wizard.preferences.uiPhilosophy]
    : null;

  const platformNames = wizard.preferences.platforms
    .map((p) => PLATFORM_OPTIONS[p].label).join(' + ') || '—';
  const scaleName = wizard.preferences.scale ? SCALE_OPTIONS[wizard.preferences.scale].label : '—';
  const tempoName = wizard.preferences.tempo ? TEMPO_OPTIONS[wizard.preferences.tempo].label : '—';

  const clarifyCount = Object.keys(wizard.clarificationAnswers).length;
  const aiFileCount = AI_FILES.length;
  const templateFileCount = BASELINE_FILES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.step4.title')}</h2>
        <p className="text-sm text-neutral-500">
          {t('wizard.step4.desc')}
        </p>
      </div>

      {/* Order summary card */}
      <div className="rounded-2xl border border-neutral-200 overflow-hidden">

        <OrderRow
          icon="📋"
          label={t('wizard.step4.project_label')}
          value={
            <span>
              <span className="font-semibold">{projectName}</span>
              <span className="text-neutral-400"> — </span>
              {wizard.vision.slice(0, 130)}{wizard.vision.length > 130 ? '…' : ''}
              {clarifyCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded-full text-sm text-neutral-500">
                  <Sparkles size={10} /> {t('wizard.step4.ai_clarifications').replace('{n}', clarifyCount.toString())}
                </span>
              )}
            </span>
          }
        />

        <OrderRow
          icon="🖥️"
          label={t('wizard.summary.platform_scale')}
          value={`${platformNames} · ${scaleName} · ${tempoName}`}
        />

        <OrderRow
          icon="🎨"
          label={t('wizard.summary.design_system')}
          value={
            philosophy ? (
              <span>
                <span className="font-semibold">{philosophy.label}</span>
                <span className="text-neutral-400"> — </span>
                <span className="italic text-neutral-500">{philosophy.tagline}</span>
              </span>
            ) : (
              <span className="text-neutral-400 italic">{t('wizard.summary.no_philosophy')}</span>
            )
          }
        />

        <OrderRow
          icon="⚖️"
          label={t('wizard.summary.flags')}
          value={
            wizard.mustFlags.length === 0 && wizard.neverFlags.length === 0
              ? <span className="text-neutral-400 italic">{t('wizard.summary.no_flags')}</span>
              : (
                <div className="space-y-2 mt-1">
                  {wizard.mustFlags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-widest text-green-700">{t('wizard.summary.must')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {wizard.mustFlags.map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {wizard.neverFlags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-widest text-red-600">{t('wizard.summary.never')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {wizard.neverFlags.map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                            ✗ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
          }
        />

        <OrderRow
          icon="📦"
          label={t('wizard.summary.files_to_create').replace('{n}', GENERATED_FILES.length.toString())}
          value={
            <div className="space-y-4 mt-2">

              {/* AI-generated files */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={11} className="text-neutral-500" />
                  <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                    {t('wizard.generate_files.ai_title').replace('{n}', AI_FILES.length.toString())}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
                  {AI_FILES.map((f) => (
                    <div key={f.name} className="flex items-start gap-3 px-3 py-2 bg-white">
                      <span className="font-mono text-sm text-neutral-700 font-semibold w-32 flex-shrink-0 pt-0.5">{f.name}</span>
                      <div>
                        <p className="text-sm text-neutral-700 font-medium">{t(`wizard.generate_files.ai.${f.key}.label`)}</p>
                        <p className="text-sm text-neutral-400">{t(`wizard.generate_files.ai.${f.key}.desc`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Universal baseline files */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌐</span>
                  <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                    {t('wizard.generate_files.baseline_title').replace('{n}', BASELINE_FILES.length.toString())}
                  </p>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {t('wizard.generate_files.baseline_desc')}
                </p>
                <div className="rounded-xl border border-blue-100 bg-blue-50/30 divide-y divide-blue-100 overflow-hidden">
                  {BASELINE_FILES.map((f) => (
                    <div key={f.name} className="flex items-start gap-3 px-3 py-2">
                      <span className="font-mono text-sm text-blue-700 font-semibold w-32 flex-shrink-0 pt-0.5">{f.name}</span>
                      <div>
                        <p className="text-sm text-neutral-700 font-medium">{t(`wizard.generate_files.baseline.${f.key}.label`)}</p>
                        <p className="text-sm text-neutral-400">{t(`wizard.generate_files.baseline.${f.key}.desc`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



            </div>
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => wizard.setStep(3)}
          className="flex items-center gap-2 px-5 py-3 text-sm text-neutral-500 border border-neutral-200 rounded-xl hover:border-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={14} />
          {t('wizard.nav.adjust')}
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 bg-neutral-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors"
        >
          <Sparkles size={15} />
          {t('wizard.nav.confirm_generate').replace('{n}', GENERATED_FILES.length.toString())}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1.5: Grill-Me Clarification ─────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  problem:     '🎯 Problem',
  user:        '👤 Bruger',
  scope:       '📐 Scope',
  constraints: '⚠️ Begrænsninger',
  success:     '✅ Succes',
  risk:        '🔴 Risiko',
};

function Step2Afklaring({
  wizard,
  projectName,
  thinkingLevel,
}: {
  wizard: ReturnType<typeof useWizard>;
  projectName: string;
  thinkingLevel: string;
}) {
  const { clarifyingQuestions, clarificationAnswers, clarifyStep,
          isClarifying, runClarify, answerClarification,
          advanceClarifyStep, skipClarification } = wizard;
  const { t } = useTranslation();

  const totalQ = clarifyingQuestions.length;
  const isDone = clarifyStep > totalQ && totalQ > 0;
  const currentQ = clarifyingQuestions[clarifyStep - 1] ?? null;
  const currentAnswer = currentQ ? (clarificationAnswers[currentQ.id] ?? '') : '';

  // Not yet triggered
  if (clarifyStep === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.clarify.title')}</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {t('wizard.clarify.desc')}
            <br />
            {t('wizard.clarify.desc_note')}
          </p>
        </div>
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-sm text-neutral-600 leading-relaxed">
          <p className="font-medium text-neutral-800 mb-1">{t('wizard.clarify.vision_label')}</p>
          <p className="text-neutral-500 italic">"{wizard.vision.slice(0, 200)}{wizard.vision.length > 200 ? '…' : ''}"</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => runClarify(projectName, thinkingLevel)}
            disabled={isClarifying}
            className="flex-1 py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {isClarifying ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isClarifying ? t('wizard.clarify.analyzing') : t('wizard.clarify.start_button')}
          </button>
          <button
            onClick={skipClarification}
            className="px-5 py-3.5 text-sm text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded-xl transition-colors"
          >
            {t('wizard.nav.skip')}
          </button>
        </div>
      </div>
    );
  }

  // All done
  if (isDone) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-neutral-900 tracking-tight">{t('wizard.clarify.done_title')}</h2>
          <p className="text-sm text-neutral-500">
            {t('wizard.clarify.done_desc')}
          </p>
        </div>
        <div className="space-y-3">
          {clarifyingQuestions.map((q) => (
            <div key={q.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-sm text-neutral-400 mb-1">{t(`wizard.clarify.categories.${q.category}`) || q.category}</p>
              <p className="text-sm font-medium text-neutral-700 mb-1">{q.question}</p>
              <p className="text-sm text-neutral-500 italic">→ {clarificationAnswers[q.id] ?? q.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active question
  if (!currentQ) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-neutral-900 tracking-tight">AI Afklaring</h2>
        <span className="text-sm text-neutral-400 font-mono">{clarifyStep} / {totalQ}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {clarifyingQuestions.map((_, i) => (
          <div key={i} className={cn(
            'h-1 rounded-full flex-1 transition-all',
            i + 1 < clarifyStep  ? 'bg-neutral-900' :
            i + 1 === clarifyStep ? 'bg-neutral-900' :
            'bg-neutral-200'
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          {/* Category + Question */}
          <div className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              {t(`wizard.clarify.categories.${currentQ.category}`) || currentQ.category}
            </span>
            <p className="text-lg font-light text-neutral-900 leading-snug">{currentQ.question}</p>
          </div>

          {/* AI Recommendation */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">{t('wizard.clarify.gsd_rec')}</p>
            <p className="text-sm text-neutral-700">{currentQ.recommendation}</p>
            <p className="text-sm text-neutral-400 mt-1 italic">{currentQ.rationale}</p>
          </div>

          {/* User answer */}
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">{t('wizard.clarify.your_answer')}</p>
            <textarea
              value={currentAnswer}
              onChange={(e) => answerClarification(currentQ.id, e.target.value)}
              rows={3}
              className="w-full p-3 text-sm bg-white border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-neutral-400 transition-colors"
              placeholder={t('wizard.clarify.placeholder')}
            />
          </div>

          <button
            onClick={advanceClarifyStep}
            disabled={!currentAnswer.trim()}
            className={cn(
              'w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
              currentAnswer.trim()
                ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            )}
          >
            {clarifyStep === totalQ ? t('wizard.clarify.save_done') : t('wizard.clarify.save_next')}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ProjectWizard({
  projectName,
  thinkingLevel,
  currentVersion,
  setCurrentVersion,
  setIsDirty,
  onComplete,
  onSkipToAdvanced,
}: ProjectWizardProps) {
  const wizard = useWizard();
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-12 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <StepIndicator current={wizard.step} />
          <button
            onClick={onSkipToAdvanced}
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors whitespace-nowrap ml-6"
          >
            {t('wizard.nav.advanced_mode')}
          </button>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {wizard.step === 1 && (
              <Step1Vision wizard={wizard} />
            )}
            {wizard.step === 2 && (
              <Step2Afklaring wizard={wizard} projectName={projectName} thinkingLevel={thinkingLevel} />
            )}
            {wizard.step === 3 && (
              <Step2Preferences
                preferences={wizard.preferences}
                setPreference={wizard.setPreference}
                togglePlatform={wizard.togglePlatform}
              />
            )}
            {wizard.step === 4 && (
              <Step3Flags
                mustFlags={wizard.mustFlags}
                toggleMustFlag={wizard.toggleMustFlag}
                customMust={wizard.customMust}
                setCustomMust={wizard.setCustomMust}
                addCustomMustFlag={wizard.addCustomMustFlag}
                neverFlags={wizard.neverFlags}
                toggleNeverFlag={wizard.toggleNeverFlag}
                customNever={wizard.customNever}
                setCustomNever={wizard.setCustomNever}
                addCustomNeverFlag={wizard.addCustomNeverFlag}
              />
            )}
            {wizard.step === 5 && (
              <Step4Generate
                wizard={wizard}
                projectName={projectName}
                thinkingLevel={thinkingLevel}
                currentVersion={currentVersion}
                setCurrentVersion={setCurrentVersion}
                setIsDirty={setIsDirty}
                onComplete={onComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {wizard.step < 5 && (
          <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
            <button
              onClick={() => wizard.setStep(wizard.step - 1)}
              disabled={wizard.step === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-0 transition-all"
            >
              <ArrowLeft size={14} />
              {t('wizard.nav.back')}
            </button>

            {/* Step 1 CTA */}
            {wizard.step === 1 && (
              <button
                onClick={() => wizard.setStep(2)}
                disabled={wizard.vision.trim().length < 30}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all',
                  wizard.vision.trim().length >= 30
                    ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                )}
              >
                {t('wizard.nav.next')} <ArrowRight size={14} />
              </button>
            )}

            {/* Step 2 (Afklaring) CTA */}
            {wizard.step === 2 && (
              <button
                onClick={() => wizard.setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all bg-neutral-900 text-white hover:bg-neutral-700"
              >
                {t('wizard.nav.next_prefs')} <ArrowRight size={14} />
              </button>
            )}

            {/* Steps 3-4 nav */}
            {wizard.step >= 3 && wizard.step <= 4 && (
               <button
                 onClick={() => wizard.setStep(wizard.step + 1)}
                 disabled={wizard.step === 3 && (wizard.preferences.platforms.length === 0 || wizard.preferences.scale === null || wizard.preferences.tempo === null)}
                 className={cn(
                   'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all',
                   (wizard.step === 4) || (wizard.step === 3 && wizard.preferences.platforms.length > 0 && wizard.preferences.scale && wizard.preferences.tempo)
                     ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                     : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                 )}
               >
                 {wizard.step === 4 ? 'Generér →' : 'Næste'}
                 {wizard.step < 4 && <ArrowRight size={14} />}
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
