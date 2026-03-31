import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, ChevronLeft, Save, Layers, History,
  ArrowLeft, Zap, Sparkles, AlertCircle, User, X
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { TabType } from './types';
import { cn } from './lib/utils';
import { TAB_LABEL } from './tabConfig';

import { useProjects } from './hooks/useProjects';
import { useVersions } from './hooks/useVersions';
import { useAI } from './hooks/useAI';
import { useDiskSync } from './hooks/useDiskSync';

import { CommandMenu } from './components/CommandMenu';
import { ProjectSidebar } from './components/ProjectSidebar';
import { WorkbenchEditor } from './components/WorkbenchEditor';
import { VersionHistoryPanel } from './components/VersionHistoryPanel';
import { AboutView } from './components/AboutView';
import { ProjectWizard } from './components/ProjectWizard';
import { ProjectStatus } from './components/ProjectStatus';
import { SparringView } from './components/SparringView';
import { ApiKeyOnboarding } from './components/ApiKeyOnboarding';
import { useApiKey } from './hooks/useApiKey';
import { useTranslation } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

export default function App() {
  const { t } = useTranslation();
  // ─── UI-only state (belongs here — not in hooks) ──────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'wizard' | 'sparring' | 'status' | 'advanced' | 'om'>('wizard');
  const [isCopied, setIsCopied] = useState(false);

  // F1.4: Version summary modal state
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showConfirm = (message: string, onConfirm: () => void) =>
    setConfirmModal({ message, onConfirm });

  // ─── Keyboard shortcut: Cmd+K ────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandMenuOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ─── Business logic hooks ─────────────────────────────────────────────────
  const projects = useProjects();
  const { user, selectedProject, setSelectedProject } = projects;

  const versions = useVersions(user, selectedProject);
  const {
    currentVersion, setCurrentVersion, setIsDirty, isDirty,
    isSaving, saveVersion, pendingSaveCallback, setPendingSaveCallback,
    versionSummaryInput, setVersionSummaryInput, isLoadingVersions,
  } = versions;

  // ─── TD-04: API Key check ──────────────────────────────────────────────────
  const { hasKey, isLoading: isLoadingKey, saveKey, removeKey } = useApiKey();

  // ─── Smart Routing (FL-01 from UX_FLOWS.md) ──────────────────────────────
  // After project loads: existing project → status, new/empty project → wizard
  React.useEffect(() => {
    if (isLoadingVersions) return;           // Still fetching — wait
    if (!selectedProject) return;            // No project selected
    if (viewMode === 'advanced') return;     // Expert actively editing — don't redirect
    if (viewMode === 'sparring') return;     // Mid-sparring — don't interrupt

    if (currentVersion) {
      // Returning user: has content → go to status
      setViewMode((prev) => prev === 'wizard' ? 'status' : prev);
    } else {
      // New project: no content → go to wizard
      setViewMode('wizard');
    }
  }, [currentVersion, isLoadingVersions, selectedProject?.id]); // eslint-disable-line

  const ai = useAI(activeTab, currentVersion, selectedProject, setCurrentVersion, setIsDirty);

  const { isSyncing, syncFromFilesystem } = useDiskSync(
    selectedProject, currentVersion, setCurrentVersion, setIsDirty
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ─── Login screen ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter text-neutral-900">{t('auth.title')}</h1>
            <p className="text-neutral-500 font-light">
              {t('auth.subtitle')}
            </p>
          </div>
          <button
            onClick={projects.handleLogin}
            className="w-full py-4 bg-neutral-900 text-neutral-50 rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <User size={20} />
            {t('auth.login_button')}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── API Key Onboarding (TD-04) ───────────────────────────────────────────
  if (!isLoadingKey && !hasKey && user) {
    return (
      <ApiKeyOnboarding 
        user={user} 
        onSave={saveKey} 
        onLogout={projects.handleLogout} 
      />
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      <Toaster position="top-right" />

      <CommandMenu
        isOpen={isCommandMenuOpen}
        setIsOpen={setIsCommandMenuOpen}
        projects={projects.projects}
        onSelectProject={(p) => {
          setIsCommandMenuOpen(false);
          if (isDirty) {
            showConfirm(t('common.switch_project_confirm'), () => {
              setSelectedProject(p);
              setCurrentVersion(null);
              ai.setAiSuggestion(null);
              setIsDirty(false);
            });
          } else {
            setSelectedProject(p);
            setCurrentVersion(null);
            ai.setAiSuggestion(null);
            setIsDirty(false);
          }
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setViewMode('advanced');
        }}
        onAction={(action) => {
          if (action === 'new-project') projects.setIsNewProjectModalOpen(true);
          if (action === 'save') saveVersion();
          if (action === 'sync') syncFromFilesystem();
        }}
      />

      {/* Sidebar */}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        user={user}
        projects={projects.projects}
        selectedProject={selectedProject}
        viewMode={viewMode}
        searchQuery={projects.searchQuery}
        onOpenNewProjectModal={() => projects.setIsNewProjectModalOpen(true)}
        isDirty={isDirty}
        onSetSearchQuery={projects.setSearchQuery}
        onSetViewMode={setViewMode}
        onSelectProject={(p) => {
          if (isDirty) {
            showConfirm(
              t('common.switch_project_confirm'),
              () => {
                setSelectedProject(p);
                setCurrentVersion(null);
                ai.setAiSuggestion(null);
                setIsDirty(false);
                // Auto-route: existing project → status, new → wizard
              }
            );
          } else {
            setSelectedProject(p);
            setCurrentVersion(null);
            ai.setAiSuggestion(null);
            setIsDirty(false);
          }
        }}
        onLogout={() => {
          if (isDirty) {
            showConfirm(
              t('common.logout_confirm'),
              projects.handleLogout
            );
          } else {
            projects.handleLogout();
          }
        }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <h2 className="text-sm font-medium text-neutral-500">
              {selectedProject ? selectedProject.name : t('header.select_project')}
              {currentVersion && <span className="ml-2 text-neutral-400">v{currentVersion.version}</span>}
              <span className="mx-2 text-neutral-200">/</span>
              <span className="text-neutral-900 capitalize">{viewMode === 'om' ? t('sidebar.about') : viewMode}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
          {/* Show Workbench button only in advanced mode */}
            {viewMode === 'advanced' && (
              <button
                onClick={() => setViewMode('status')}
                className="mr-4 p-2 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft size={18} />
                {t('header.overview')}
              </button>
            )}
            {currentVersion && viewMode === 'advanced' && (
              <div className="flex items-center gap-1 mr-4 px-2 py-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <Sparkles size={14} className="text-neutral-400" />
                <select
                  value={currentVersion.thinkingLevel || 'MEDIUM'}
                  onChange={(e) => {
                    setCurrentVersion({ ...currentVersion, thinkingLevel: e.target.value as any });
                    setIsDirty(true);
                  }}
                  className="bg-transparent text-sm font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-neutral-600 hover:text-neutral-900 transition-colors"
                  title={t('editor.thinking_level_desc')}
                >
                  <option value="MINIMAL">Minimal</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            )}
            <button
              onClick={syncFromFilesystem}
              disabled={!selectedProject || isSyncing}
              className="p-2 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm"
              title={t('header.sync_from_disk')}
            >
              <Layers size={18} className={cn(isSyncing && 'animate-spin')} />
              {t('header.sync_from_disk')}
            </button>
            <LanguageSwitcher />
            <div className="flex flex-col items-center justify-center h-full px-6 min-w-[120px] bg-neutral-50 text-neutral-400">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">{t('header.status')}</div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {isDirty ? (
                  <span className="text-amber-500">{t('header.draft_changed')}</span>
                ) : (
                  <span>{t('header.synced')}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={cn(
                'p-2 rounded-md transition-colors flex items-center gap-2 text-sm',
                isHistoryOpen ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
              )}
            >
              <History size={18} />
              {t('header.history')}
            </button>

          </div>
        </header>

        {/* Content area */}
        {selectedProject ? (
          <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'om' ? (
              <AboutView />
            ) : viewMode === 'wizard' || !currentVersion ? (
              <ProjectWizard
                projectName={selectedProject.name}
                thinkingLevel={currentVersion?.thinkingLevel ?? 'MEDIUM'}
                currentVersion={currentVersion}
                setCurrentVersion={setCurrentVersion}
                setIsDirty={setIsDirty}
                onComplete={() => setViewMode('sparring')}
                onSkipToAdvanced={() => setViewMode('advanced')}
              />
            ) : viewMode === 'sparring' && currentVersion ? (
              <SparringView
                files={currentVersion}
                projectName={selectedProject.name}
                setCurrentVersion={setCurrentVersion}
                setIsDirty={setIsDirty}
                onDone={() => setViewMode('status')}
              />
            ) : viewMode === 'status' ? (
              <ProjectStatus
                project={selectedProject}
                currentVersion={currentVersion}
                isDirty={isDirty}
                onOpenWizard={() => setViewMode('wizard')}
                onOpenAdvanced={(tab) => {
                  if (tab) setActiveTab(tab as TabType);
                  setViewMode('advanced');
                }}
                onSave={saveVersion}
              />
            ) : (
              <WorkbenchEditor
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  ai.setAiSuggestion(null);
                }}
                projectName={selectedProject.name}
                currentVersion={currentVersion}
                setCurrentVersion={setCurrentVersion}
                setIsDirty={setIsDirty}
                isLoadingVersions={versions.isLoadingVersions}
                ai={ai}
                isCopied={isCopied}
                copyToClipboard={copyToClipboard}
                applyTemplate={() => {}}
                saveVersion={saveVersion}
                showConfirm={showConfirm}
                setViewMode={setViewMode}
              />
            )}

            <VersionHistoryPanel
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              versions={versions.versions}
              currentVersion={currentVersion}
              activeTab={activeTab}
              userId={user.uid}
              diffTarget={versions.diffTarget}
              setDiffTarget={versions.setDiffTarget}
              showConfirm={showConfirm}
              onRestore={(v) => {
                setCurrentVersion(v);
                setIsHistoryOpen(false);
                setIsDirty(false);
                toast.success(t('toasts.version_restored').replace('{n}', v.version.toString()));
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-300 bg-white">
            <div className="text-center space-y-4">
              <Layers size={48} className="mx-auto opacity-10" />
              <p className="text-sm">{t('empty_state.select_project_hint')}</p>
            </div>
          </div>
        )}

        {/* Connection Error Banner */}
        <AnimatePresence>
          {projects.connectionError && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-red-600 px-6 py-3 rounded-full text-sm font-medium border border-red-100 shadow-2xl z-[100] flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {projects.connectionError}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Modals ── */}

      {/* New Project Modal */}
      <AnimatePresence>
        {projects.isNewProjectModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => projects.setIsNewProjectModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-medium mb-6 text-neutral-900">{t('modals.new_project_title')}</h3>
              <input
                autoFocus
                type="text"
                placeholder={t('modals.new_project_placeholder')}
                value={projects.newProjectName}
                onChange={(e) => projects.setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && projects.createProject()}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:border-neutral-400 transition-colors mb-6 text-neutral-900"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => projects.setIsNewProjectModalOpen(false)}
                  className="flex-1 py-3 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={projects.createProject}
                  className="flex-1 py-3 bg-neutral-900 text-neutral-50 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  {t('modals.create')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Version Summary Modal (F1.4 — replaces native prompt()) */}
      <AnimatePresence>
        {pendingSaveCallback && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPendingSaveCallback(null)}
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-medium mb-2 text-neutral-900">{t('command_menu.save_version')}</h3>
              <p className="text-sm text-neutral-500 mb-6">{t('modals.save_version_desc')}</p>
              <input
                autoFocus
                type="text"
                placeholder={t('modals.save_version_placeholder')}
                value={versionSummaryInput}
                onChange={(e) => setVersionSummaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    pendingSaveCallback(versionSummaryInput);
                    setPendingSaveCallback(null);
                  }
                }}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:border-neutral-400 transition-colors mb-6 text-neutral-900"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingSaveCallback(null)}
                  className="flex-1 py-3 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    pendingSaveCallback(versionSummaryInput);
                    setPendingSaveCallback(null);
                  }}
                  className="flex-1 py-3 bg-neutral-900 text-neutral-50 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {t('command_menu.save_version')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal (F1.5 — replaces native confirm()) */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 p-8 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed pt-1.5">{confirmModal.message}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-3 bg-neutral-900 text-neutral-50 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
