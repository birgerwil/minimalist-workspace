import React from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Zap, Activity, Info, Trash2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface ProjectSidebarProps {
  isOpen: boolean;
  user: FirebaseUser;
  projects: Project[];
  selectedProject: Project | null;
  viewMode: 'wizard' | 'sparring' | 'status' | 'advanced' | 'om';
  searchQuery: string;
  isDirty: boolean;
  onSetSearchQuery: (q: string) => void;
  onSetViewMode: (mode: 'wizard' | 'sparring' | 'status' | 'advanced' | 'om') => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onLogout: () => void;
}

export function ProjectSidebar({
  isOpen,
  user,
  projects,
  selectedProject,
  viewMode,
  searchQuery,
  isDirty,
  onSetSearchQuery,
  onSetViewMode,
  onSelectProject,
  onDeleteProject,
  onOpenNewProjectModal,
  onLogout,
}: ProjectSidebarProps) {
  const { t } = useTranslation();
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className="border-r border-neutral-200 flex flex-col bg-neutral-50 z-20 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between flex-shrink-0">
        <span className="text-lg font-medium tracking-tight">{t('sidebar.projects')}</span>
        <button
          onClick={onOpenNewProjectModal}
          className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-900 transition-colors"
          title={t('sidebar.new_project')}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t('sidebar.search_placeholder')}
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {/* Dashboard shortcut */}
        <button
          onClick={() => onSetViewMode('status')}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 group mb-2',
            viewMode === 'status' || viewMode === 'wizard'
              ? 'bg-neutral-900 text-neutral-50'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
          )}
        >
          <Activity size={18} />
          {t('sidebar.overview')}
        </button>

        {/* Om appen */}
        <button
          onClick={() => onSetViewMode('om')}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 group mb-4',
            viewMode === 'om'
              ? 'bg-neutral-900 text-neutral-50'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
          )}
        >
          <Info size={18} />
          {t('sidebar.about_app')}
        </button>

        <div className="px-2 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            {t('sidebar.projects')}
          </span>
        </div>

        {filtered.map((p) => (
          <div key={p.id} className="relative group/item px-2">
            <button
              onClick={() => onSelectProject(p)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 pr-10',
                selectedProject?.id === p.id
                  ? 'bg-neutral-200 text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              )}
            >
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  selectedProject?.id === p.id
                    ? 'bg-neutral-900'
                    : 'bg-neutral-300 group-hover:bg-neutral-400'
                )}
              />
              <span className="truncate">{p.name}</span>
              {/* Dirty state indicator if this is the active project */}
              {selectedProject?.id === p.id && isDirty && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"
                  title={t('status.unsaved_changes')}
                />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(p.id);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition-all"
              title={t('common.delete') || 'Slet'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && searchQuery && (
          <p className="px-4 py-3 text-sm text-neutral-400 italic">
            {t('sidebar.no_matches').replace('{n}', searchQuery)}
          </p>
        )}
      </div>


      {/* User footer */}
      <div className="p-4 border-t border-neutral-200 flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || t('common.loading')}
                className="w-8 h-8 rounded-full border border-neutral-200"
              />
            )}
            <div className="text-sm">
              <p className="font-medium truncate max-w-[120px] text-neutral-900">
                {user.displayName}
              </p>
              <button
                onClick={onLogout}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
        <div className="px-1 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-medium tracking-wider text-neutral-400">v2.1.0</span>
          <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">Production Ready</span>
        </div>
      </div>
    </motion.aside>
  );
}
