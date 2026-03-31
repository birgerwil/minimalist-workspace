export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstructionSet {
  id: string;
  projectId: string;
  rules: string; // Analogen til System Instructions
  skills: string; // Agent Skills (Specialiseret ekspertise)
  workflows: string; // Workflows (On-demand værktøjer)
  llmsTxt: string;
  llmsFullTxt: string;
  architecture: string;
  spec: string;
  plan: string;
  state: string;
  agents: string;
  testing: string;
  design: string;         // DESIGN.md — generated from UI philosophy choice
  masterPrompt?: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changeSummary?: string;
  thinkingLevel?: ThinkingLevel;
}

export enum ThinkingLevel {
  MINIMAL = "MINIMAL",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type TabType = 'rules' | 'skills' | 'workflows' | 'spec' | 'architecture' | 'plan' | 'state' | 'agents' | 'testing' | 'design' | 'llms' | 'llms-full' | 'info';
