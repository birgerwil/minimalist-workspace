// Central tab configuration – single source of truth for all tab/field mappings.
// Previously duplicated 7+ times across App.tsx.

import { TabType, InstructionSet } from './types';

/** Map from TabType → the field key on InstructionSet */
export const TAB_TO_FIELD: Record<string, keyof InstructionSet> = {
  rules:        'rules',
  skills:       'skills',
  workflows:    'workflows',
  llms:         'llmsTxt',
  'llms-full':  'llmsFullTxt',
  architecture: 'architecture',
  spec:         'spec',
  plan:         'plan',
  state:        'state',
  agents:       'agents',
  testing:      'testing',
  design:       'design',
};

/** Map from TabType → human-readable label shown in tab strip */
export const TAB_LABEL: Record<TabType | string, string> = {
  rules:           'rules.md',
  skills:          'SKILL.md',
  workflows:       'workflows.md',
  llms:            'llms.txt',
  'llms-full':     'llms-full.txt',
  architecture:    'ARCHITECTURE.md',
  spec:            'SPEC.md',
  plan:            'PLAN.md',
  state:           'STATE.md',
  agents:          'AGENTS.md',
  testing:         'testing.md',
  design:          'DESIGN.md',
  'master-prompt': 'Master Prompt',
  info:            'Workbench Info',
};

/** Map from TabType → the filename used for disk read/write.
 *  Undefined entries are not synced to disk. */
export const TAB_TO_FILENAME: Partial<Record<string, string>> = {
  llms:         'llms.txt',
  architecture: 'architecture.md',
  spec:         'SPEC.md',
  plan:         'PLAN.md',
  state:        'STATE.md',
  agents:       'AGENTS.md',
  testing:      'testing.md',
  design:       'DESIGN.md',
  rules:        'rules.md',
  skills:       'SKILL.md',
  workflows:    'workflows.md',
};

/** Ordered list of editor tabs (excludes special-purpose tabs). */
export const EDITOR_TABS: TabType[] = [
  'rules', 'skills', 'workflows',
  'llms', 'llms-full',
  'architecture', 'spec', 'plan', 'state', 'agents', 'testing', 'design',
];

/** All tabs including special views */
export const ALL_TABS = [...EDITOR_TABS, 'master-prompt' as TabType, 'info' as TabType];

/** Get the content for the active tab from an InstructionSet */
export function getTabContent(version: InstructionSet, tab: string): string {
  const field = TAB_TO_FIELD[tab];
  if (!field) return '';
  return (version as any)[field] ?? '';
}

/** Return a new InstructionSet with updated content for the given tab */
export function setTabContent(
  version: InstructionSet,
  tab: string,
  value: string,
): InstructionSet {
  const field = TAB_TO_FIELD[tab];
  if (!field) return version;
  return { ...version, [field]: value };
}
