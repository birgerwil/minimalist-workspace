import { describe, it, expect } from 'vitest';
import {
  TAB_TO_FIELD,
  TAB_LABEL,
  TAB_TO_FILENAME,
  EDITOR_TABS,
  ALL_TABS,
  getTabContent,
  setTabContent
} from '../tabConfig';
import { InstructionSet } from '../types';

const mockVersion: InstructionSet = {
  id: 'v1',
  projectId: 'p1',
  version: 1,
  rules: 'RULES CONTENT',
  skills: 'SKILLS CONTENT',
  workflows: 'WORKFLOWS CONTENT',
  llmsTxt: 'LLMS CONTENT',
  llmsFullTxt: 'LLMS FULL',
  architecture: 'ARCH',
  spec: 'SPEC',
  plan: 'PLAN',
  state: 'STATE',
  agents: 'AGENTS',
  testing: 'TESTING',
  design: 'DESIGN',
  createdAt: '2026-03-30',
  createdBy: 'test'
};

describe('tabConfig.ts Constants', () => {
  it('maps all EDITOR_TABS to InstructionSet fields', () => {
    EDITOR_TABS.forEach(tab => {
      // Bør have en mapning i TAB_TO_FIELD medmindre det er special tabs
      expect(TAB_TO_FIELD[tab]).toBeDefined();
    });
  });

  it('has labels for all ALL_TABS', () => {
    ALL_TABS.forEach(tab => {
      expect(TAB_LABEL[tab], `Missing TAB_LABEL for '${tab}'`).toBeDefined();
    });
  });

  it('maps correct filenames for syncable tabs', () => {
    expect(TAB_TO_FILENAME['llms']).toBe('llms.txt');
    expect(TAB_TO_FILENAME['architecture']).toBe('architecture.md');
    // Ensure unknown tabs return undefined safely
    expect(TAB_TO_FILENAME['unknown_tab_xyz']).toBeUndefined();
  });
});

describe('getTabContent()', () => {
  it('returns correct content for specific tabs', () => {
    expect(getTabContent(mockVersion, 'rules')).toBe('RULES CONTENT');
    expect(getTabContent(mockVersion, 'llms')).toBe('LLMS CONTENT');
    expect(getTabContent(mockVersion, 'spec')).toBe('SPEC');
    expect(getTabContent(mockVersion, 'design')).toBe('DESIGN');
  });

  it('returns empty string for undefined fields or empty content', () => {
    const emptyVersion: InstructionSet = { ...mockVersion, spec: '' };
    expect(getTabContent(emptyVersion, 'spec')).toBe('');
  });

  it('returns empty string for unknown tab', () => {
    expect(getTabContent(mockVersion, 'unknown-tab')).toBe('');
  });

  it('returns empty string for special UI tabs without fields (e.g. master-prompt)', () => {
    expect(getTabContent(mockVersion, 'master-prompt')).toBe('');
    expect(getTabContent(mockVersion, 'info')).toBe('');
  });
});

describe('setTabContent()', () => {
  it('returns a new object instance (immutable update)', () => {
    const updated = setTabContent(mockVersion, 'spec', 'OPDATERET SPEC');
    expect(updated).not.toBe(mockVersion);          // Tjekker ny reference
    expect(updated.spec).toBe('OPDATERET SPEC');    // Tjekker ændret felt
    expect(mockVersion.spec).toBe('SPEC');           // Original må ikke være ændret
  });

  it('updates llmsTxt when tab is "llms"', () => {
    const updated = setTabContent(mockVersion, 'llms', 'NY LLM TEKST');
    expect(updated.llmsTxt).toBe('NY LLM TEKST');
  });

  it('does not modify other fields during update', () => {
    const updated = setTabContent(mockVersion, 'rules', 'NYE REGLER');
    expect(updated.spec).toBe(mockVersion.spec);
    expect(updated.plan).toBe(mockVersion.plan);
    expect(updated.id).toBe(mockVersion.id);
  });

  it('returns the exact original version object unchanged for unknown tabs', () => {
    const updated = setTabContent(mockVersion, 'unknown_tab', 'IGNORERET');
    // Bør returnere samme reference fordi intet felt blev fundet
    expect(updated).toBe(mockVersion);
  });
});
