import React from 'react';
import { diff_match_patch } from 'diff-match-patch';

interface DiffViewProps {
  oldText: string;
  newText: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ oldText, newText }) => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <div className="font-mono text-sm whitespace-pre-wrap p-4 bg-neutral-900 text-neutral-300 rounded-lg border border-neutral-800">
      {diffs.map(([type, text], i) => {
        const className = type === 1 
          ? 'bg-green-900/30 text-green-400' 
          : type === -1 
          ? 'bg-red-900/30 text-red-400 line-through' 
          : '';
        return (
          <span key={i} className={className}>
            {text}
          </span>
        );
      })}
    </div>
  );
};
