import { useState } from 'react';
import { InstructionSet, Project, TabType } from '../types';
import { TAB_TO_FILENAME, TAB_TO_FIELD } from '../tabConfig';
import { toast } from 'sonner';

export interface UseDiskSyncReturn {
  isSyncing: boolean;
  syncFromFilesystem: () => Promise<void>;
}

export function useDiskSync(
  selectedProject: Project | null,
  currentVersion: InstructionSet | null,
  setCurrentVersion: React.Dispatch<React.SetStateAction<InstructionSet | null>>,
  setIsDirty: (dirty: boolean) => void
): UseDiskSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFromFilesystem = async () => {
    if (!selectedProject || !currentVersion) return;

    setIsSyncing(true);
    let hasChanges = false;
    const merged: InstructionSet = { ...currentVersion };

    for (const [tab, filename] of Object.entries(TAB_TO_FILENAME)) {
      if (!filename) continue;
      try {
        const res = await fetch(`/api/docs/${filename}`);
        if (!res.ok) continue;

        const { content } = await res.json();
        const fieldKey = TAB_TO_FIELD[tab];

        if (fieldKey && (merged as any)[fieldKey] !== content) {
          (merged as any)[fieldKey] = content;
          hasChanges = true;
        }
      } catch (err) {
        console.error(`Disk sync: kunne ikke hente ${filename}:`, err);
      }
    }

    if (hasChanges) {
      setCurrentVersion(merged);
      setIsDirty(true);
      toast.success('Synkroniseret fra disk. Husk at gemme versionen.');
    } else {
      toast.info('Filerne på disk matcher allerede den nuværende version.');
    }

    setIsSyncing(false);
  };

  return { isSyncing, syncFromFilesystem };
}
