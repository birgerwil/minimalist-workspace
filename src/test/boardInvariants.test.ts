import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Dette er vores "Health Check" for C-Suite Boardet (CA-07).
// Den sikrer at der er 100% konsistens mellem agent-filerne og UI'en.

const AGENT_DIR = path.resolve(__dirname, '../../.agents/skills/cc');
const ABOUT_VIEW = path.resolve(__dirname, '../components/AboutView.tsx');

const REQUIRED_AGENTS = [
  'po.md',
  'architect.md',
  'qa.md',
  'coo.md',
  'design.md',
  'board.md'
];

const FORBIDDEN_AGENTS = [
  'compliance.md'
];

describe('C-Suite Board Invariants (CA-07)', () => {

  it('verifies all required agent files exist in .agents/skills/cc/', () => {
    REQUIRED_AGENTS.forEach(file => {
      const exists = fs.existsSync(path.join(AGENT_DIR, file));
      expect(exists, `Agent-filen ${file} mangler i cc/ mappen!`).toBe(true);
    });
  });

  it('ensures legacy/forbidden agents have been purged', () => {
    FORBIDDEN_AGENTS.forEach(file => {
      const exists = fs.existsSync(path.join(AGENT_DIR, file));
      expect(exists, `Legacy-filen ${file} skulle have været slettet!`).toBe(false);
    });
  });

  it('verifies that AboutView.tsx UI reflects the correct 5-man board roles', () => {
    const content = fs.readFileSync(ABOUT_VIEW, 'utf-8');
    
    // Tjek efter de 5 kerneposter (CPO, CTO, CQA, COO, CDO)
    expect(content).toContain('role: \'CPO\'');
    expect(content).toContain('role: \'CTO\'');
    expect(content).toContain('role: \'CQA\'');
    expect(content).toContain('role: \'COO\'');
    expect(content).toContain('role: \'CDO\'');
  });

  it('checks for consistency in Chief names in AboutView.tsx', () => {
    const content = fs.readFileSync(ABOUT_VIEW, 'utf-8');
    
    expect(content).toContain('Chief Product Officer');
    expect(content).toContain('Chief Tech Officer');
    expect(content).toContain('Head of Quality Assur.');
    expect(content).toContain('Chief Operating Officer');
    expect(content).toContain('Chief Design Officer');
  });

});
