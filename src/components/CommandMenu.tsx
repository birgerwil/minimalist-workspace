import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  Plus, 
  History as HistoryIcon, 
  Sparkles, 
  Save, 
  FileText, 
  Code, 
  Layers,
  LogOut,
  User,
  LayoutTemplate,
  Type as TypeIcon,
  Link as LinkIcon,
  List as ListIcon,
  Info,
  Dna,
  Settings,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface CommandMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelectTab: (tab: any) => void;
  onAction: (action: string) => void;
  projects: any[];
  onSelectProject: (project: any) => void;
}

export function CommandMenu({ 
  isOpen, 
  setIsOpen, 
  onSelectTab, 
  onAction,
  projects,
  onSelectProject
}: CommandMenuProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  // F1.3: Keyboard shortcut (Ctrl+K) is registered in App.tsx.
  // Registering it here too caused double-firing. Removed.

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <Command className="flex flex-col h-full max-h-[60vh]">
              <div className="flex items-center px-4 border-b border-neutral-100">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <Command.Input
                  autoFocus
                  placeholder={t('command_menu.placeholder')}
                  className="flex-1 h-14 bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400 text-lg"
                  value={search}
                  onValueChange={setSearch}
                />
                <div className="flex items-center gap-1 ml-2">
                  <kbd className="px-2 py-1 bg-neutral-100 text-neutral-500 rounded text-[10px] font-bold">ESC</kbd>
                </div>
              </div>

              <Command.List className="overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-12 text-center text-neutral-400 text-sm">
                  {t('command_menu.empty').replace('{n}', search)}
                </Command.Empty>

                <Command.Group heading={t('command_menu.nav_heading')} className="px-2 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  <Item onSelect={() => { onSelectTab('spec'); setIsOpen(false); }} icon={<FileText size={16} />} label={`SPEC.md (${t('editor.tabs.spec')})`} shortcut="S" />
                  <Item onSelect={() => { onSelectTab('plan'); setIsOpen(false); }} icon={<ListIcon size={16} />} label={`PLAN.md (${t('editor.tabs.plan')})`} shortcut="P" />
                  <Item onSelect={() => { onSelectTab('architecture'); setIsOpen(false); }} icon={<Layers size={16} />} label="ARCHITECTURE.md" shortcut="A" />
                  <Item onSelect={() => { onSelectTab('master-prompt'); setIsOpen(false); }} icon={<Zap size={16} />} label={t('editor.tabs.master_prompt')} shortcut="M" />
                </Command.Group>

                <Command.Group heading={t('command_menu.actions_heading')} className="px-2 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">
                  <Item onSelect={() => { onAction('new-project'); setIsOpen(false); }} icon={<Plus size={16} />} label={t('sidebar.new_project')} shortcut="N" />
                  <Item onSelect={() => { onAction('save'); setIsOpen(false); }} icon={<Save size={16} />} label={t('command_menu.save_version')} shortcut="Cmd+S" />
                </Command.Group>

                {projects.length > 0 && (
                  <Command.Group heading={t('command_menu.projects_heading')} className="px-2 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">
                    {projects.map(p => (
                      <Item 
                        key={p.id} 
                        onSelect={() => { onSelectProject(p); setIsOpen(false); }} 
                        icon={<LayoutTemplate size={16} />} 
                        label={p.name} 
                      />
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="p-3 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-neutral-200 rounded">↵</kbd> {t('command_menu.select')}</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-neutral-200 rounded">↑↓</kbd> {t('command_menu.navigate')}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-300 italic">
                  MVP Builder v2.0
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Item({ icon, label, shortcut, onSelect }: { icon: React.ReactNode, label: string, shortcut?: string, onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-neutral-900 aria-selected:text-white group transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <span className="text-neutral-400 group-aria-selected:text-neutral-300">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {shortcut && (
        <kbd className="text-[10px] font-bold text-neutral-300 group-aria-selected:text-neutral-500">{shortcut}</kbd>
      )}
    </Command.Item>
  );
}
