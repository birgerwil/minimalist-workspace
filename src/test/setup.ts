import { vi } from 'vitest';

// Mock Firebase — aldrig rør produktion fra tests
vi.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: null }
}));

// Mock Gemini AI API kald
vi.mock('../services/gemini', () => ({
  getImprovementSuggestions: vi.fn(),
  generateSpecFromVision: vi.fn(),
  generateModuleFromSpec: vi.fn(),
  updateModuleFromSpec: vi.fn(),
  getWorkbenchGuide: vi.fn(),
}));

// Mock UI Toasts (sonner) for at undgå at React-komponenter kaster rendering fejl
vi.mock('sonner', () => ({
  toast: { 
    success: vi.fn(), 
    error: vi.fn(), 
    loading: vi.fn(),
    dismiss: vi.fn() 
  }
}));
