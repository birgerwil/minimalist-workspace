import { useState, useCallback } from 'react';
import { InstructionSet } from '../types';
import { critiqueGeneratedFiles, refineFilesFromAnswers } from '../services/gemini';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CritiqueSeverity = 'critical' | 'important' | 'nice-to-have';

export interface CritiqueItem {
  id: string;
  file: string;
  section: string;
  weakness: string;
  whyItMatters: string;
  question: string;
  severity: CritiqueSeverity;
  answer: string;
  isResolved: boolean;
}

export interface ConsistencyIssue {
  id: string;
  description: string;
  files: string[];
}

export interface SparringState {
  phase: 'analyzing' | 'ready' | 'refining' | 'done';
  quality: 'low' | 'medium' | 'high';
  critiques: CritiqueItem[];
  consistencyIssues: ConsistencyIssue[];
}

export interface UseSparringReturn {
  state: SparringState;
  startAnalysis: (files: InstructionSet, projectName: string) => Promise<void>;
  setAnswer: (id: string, answer: string) => void;
  refine: (
    files: InstructionSet,
    projectName: string,
    setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
    setIsDirty: (v: boolean) => void,
    onDone: () => void
  ) => Promise<void>;
  skipSparring: (onDone: () => void) => void;
  criticalCount: number;
  answeredCount: number;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSparring(): UseSparringReturn {
  const [state, setState] = useState<SparringState>({
    phase: 'analyzing',
    quality: 'medium',
    critiques: [],
    consistencyIssues: [],
  });

  const startAnalysis = useCallback(async (files: InstructionSet, projectName: string) => {
    setState((s) => ({ ...s, phase: 'analyzing' }));
    try {
      const result = await critiqueGeneratedFiles(files, projectName);
      setState({
        phase: 'ready',
        quality: result.quality as 'low' | 'medium' | 'high',
        critiques: result.critiques.map((c, i) => ({
          ...c,
          id: `critique-${i}`,
          severity: c.severity as CritiqueSeverity,
          answer: '',
          isResolved: false,
        })),
        consistencyIssues: result.consistencyIssues.map((ci, i) => ({
          ...ci,
          id: `consistency-${i}`,
        })),
      });
    } catch (err) {
      console.error('[useSparring] Critique fejlede:', err);
      // Graceful fallback — skip to done without critique
      setState((s) => ({ ...s, phase: 'done', critiques: [], consistencyIssues: [] }));
      toast.error('AI-analyse mislykkedes. Du kan fortsætte uden sparring.');
    }
  }, []);

  const setAnswer = useCallback((id: string, answer: string) => {
    setState((s) => ({
      ...s,
      critiques: s.critiques.map((c) =>
        c.id === id ? { ...c, answer, isResolved: answer.trim().length > 0 } : c
      ),
    }));
  }, []);

  const refine = useCallback(async (
    files: InstructionSet,
    projectName: string,
    setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
    setIsDirty: (v: boolean) => void,
    onDone: () => void
  ) => {
    const answeredCritiques = state.critiques.filter((c) => c.answer.trim().length > 0);
    if (answeredCritiques.length === 0) {
      onDone();
      return;
    }

    setState((s) => ({ ...s, phase: 'refining' }));
    try {
      const refined = await refineFilesFromAnswers(
        files,
        answeredCritiques.map((c) => ({ file: c.file, section: c.section, question: c.question, answer: c.answer })),
        state.consistencyIssues,
        projectName
      );

      setCurrentVersion((prev) => ({
        ...(prev ?? {} as InstructionSet),
        ...refined,
      }));
      setIsDirty(true);
      setState((s) => ({ ...s, phase: 'done' }));
      toast.success('Filerne er nu raffinerede baseret på din sparring!');
      onDone();
    } catch (err) {
      console.error('[useSparring] Refinement fejlede:', err);
      setState((s) => ({ ...s, phase: 'ready' }));
      toast.error('Refinement fejlede. Prøv igen eller spring over.');
    }
  }, [state.critiques, state.consistencyIssues]);

  const skipSparring = useCallback((onDone: () => void) => {
    setState((s) => ({ ...s, phase: 'done' }));
    onDone();
  }, []);

  const criticalCount = state.critiques.filter((c) => c.severity === 'critical').length;
  const answeredCount = state.critiques.filter((c) => c.isResolved).length;

  return {
    state,
    startAnalysis,
    setAnswer,
    refine,
    skipSparring,
    criticalCount,
    answeredCount,
  };
}
