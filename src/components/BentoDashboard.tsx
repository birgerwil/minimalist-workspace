import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  List as ListIcon, 
  Layers, 
  History as HistoryIcon, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Project, InstructionSet } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface BentoDashboardProps {
  project: Project;
  version: InstructionSet | null;
  onModuleClick: (tab: any) => void;
  isDirty: boolean;
}

export function BentoDashboard({ project, version, onModuleClick, isDirty }: BentoDashboardProps) {
  const { t } = useTranslation();
  if (!version) return null;

  const stats = [
    { label: t('dashboard.version'), value: `v${version.version}`, icon: <HistoryIcon size={16} />, color: 'text-blue-500' },
    { label: t('dashboard.status'), value: isDirty ? t('common.unsaved_changes') || 'Ugemte ændringer' : t('dashboard.synced'), icon: isDirty ? <Clock size={16} /> : <CheckCircle2 size={16} />, color: isDirty ? 'text-amber-500' : 'text-green-500' },
    { label: t('dashboard.context'), value: `${((version.llmsTxt?.length || 0) / 1024).toFixed(1)} KB`, icon: <Activity size={16} />, color: 'text-purple-500' },
  ];

  const modules = [
    { id: 'spec', title: 'SPEC.md', desc: t('dashboard.vision_desc'), icon: <Target size={20} />, content: version.spec, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { id: 'plan', title: 'PLAN.md', desc: t('editor.tabs.plan'), icon: <ListIcon size={20} />, content: version.plan, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'architecture', title: 'ARCHITECTURE.md', desc: t('editor.tabs.architecture'), icon: <Layers size={20} />, content: version.architecture, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'state', title: 'STATE.md', desc: t('editor.tabs.state'), icon: <HistoryIcon size={20} />, content: version.state, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">{project.name}</h1>
          <p className="text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t('dashboard.active_session')}
          </p>
        </div>
        <div className="flex gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className={cn("p-2 rounded-xl bg-neutral-50", stat.color)}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-sm font-bold text-neutral-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Vision Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onModuleClick('spec')}
          className="col-span-8 bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={24} className="text-neutral-300" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600"><Target size={24} /></div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">{t('dashboard.vision_strategy')}</h3>
              <p className="text-sm text-neutral-500">{t('dashboard.vision_desc')}</p>
            </div>
          </div>
          <div className="prose prose-neutral prose-sm max-w-none line-clamp-6 text-neutral-600 leading-relaxed">
            {version.spec || t('dashboard.vision_placeholder')}
          </div>
        </motion.div>

        {/* Master Prompt Quick Access */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onModuleClick('master-prompt')}
          className="col-span-4 bg-neutral-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{t('editor.tabs.master_prompt')}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {t('dashboard.master_prompt_desc')}
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-white font-bold text-sm">
            {t('dashboard.copy_now')} <ArrowUpRight size={16} />
          </div>
        </motion.div>

        {/* Roadmap & Architecture */}
        <div className="col-span-12 grid grid-cols-3 gap-6">
          {modules.filter(m => m.id !== 'spec').map((m) => (
            <motion.div 
              key={m.id}
              whileHover={{ y: -4 }}
              onClick={() => onModuleClick(m.id)}
              className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-xl", m.color)}>{m.icon}</div>
                <h4 className="font-bold text-neutral-900">{m.title}</h4>
              </div>
              <p className="text-sm text-neutral-500 mb-4">{m.desc}</p>
              <div className="text-sm text-neutral-400 line-clamp-3 font-mono">
                {m.content || t('dashboard.no_data')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Insight Card */}
        <div className="col-span-12 bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">{t('dashboard.ai_health')}</h3>
              <p className="text-sm text-indigo-600/80 max-w-md">
                {t('dashboard.ai_health_desc')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onModuleClick('info')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            {t('dashboard.see_analysis')}
          </button>
        </div>
      </div>
    </div>
  );
}
