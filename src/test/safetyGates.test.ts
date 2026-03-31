import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVersions } from '../hooks/useVersions';

// Bemærk: useVersions henter en masse dependencies (Firebase m.m.), 
// men vi mocker dem allerede i setup.ts.
// Her tester vi udelukkende, at beforeunload eventlytteren kobles til window obj.

describe('Safety Gates: isDirty (TD-02)', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers beforeunload listener when component mounts', () => {
    renderHook(() => useVersions(null, null));
    
    // Tjek om 'beforeunload' blev fanget under Reacts useEffect cycle
    const beforeUnloadCalls = addEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'beforeunload'
    );
    expect(beforeUnloadCalls.length).toBeGreaterThan(0);
  });

  it('removes beforeunload listener on unmount', () => {
    const { unmount } = renderHook(() => useVersions(null, null));
    unmount();
    
    // Tjek om funktionen ryddes op i memory
    const beforeUnloadCleanupCalls = removeEventListenerSpy.mock.calls.filter(
      (call: any[]) => call[0] === 'beforeunload'
    );
    expect(beforeUnloadCleanupCalls.length).toBeGreaterThan(0);
  });
});
