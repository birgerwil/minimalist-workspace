import React from 'react';
import { motion } from 'motion/react';
import { Target, Layers, Sparkles, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

// ─── Component ────────────────────────────────────────────────────────────────

export function AboutView() {
  const { t } = useTranslation();

  const CORNER_FLAGS = [
    {
      icon: BookOpen,
      title: t('about.flags.items.design.title'),
      description: t('about.flags.items.design.description'),
      example: t('about.flags.items.design.example'),
    },
    {
      icon: Layers,
      title: t('about.flags.items.arch.title'),
      description: t('about.flags.items.arch.description'),
      example: t('about.flags.items.arch.example'),
    },
    {
      icon: Target,
      title: t('about.flags.items.agents.title'),
      description: t('about.flags.items.agents.description'),
      example: t('about.flags.items.agents.example'),
    },
    {
      icon: Zap,
      title: t('about.flags.items.quality.title'),
      description: t('about.flags.items.quality.description'),
      example: t('about.flags.items.quality.example'),
    },
  ];

  const WORKFLOW_STEPS = [
    {
      step: '01',
      title: t('about.workflow.steps.0.title'),
      description: t('about.workflow.steps.0.desc'),
    },
    {
      step: '02',
      title: t('about.workflow.steps.1.title'),
      description: t('about.workflow.steps.1.desc'),
    },
    {
      step: '03',
      title: t('about.workflow.steps.2.title'),
      description: t('about.workflow.steps.2.desc'),
    },
    {
      step: '04',
      title: t('about.workflow.steps.3.title'),
      description: t('about.workflow.steps.3.desc'),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-8 py-12 space-y-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              AI Tuner Workbench
            </span>
          </div>

          <h1 className="text-4xl font-light tracking-tight text-neutral-900 leading-tight">
            Hjørneflag for dine projekter.
            <br />
            <span className="text-neutral-400">Kodificeret, versioneret, klar til AI.</span>
          </h1>

          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
            En AI-assisteret Workbench for <strong className="text-neutral-900">Iværksættere og Arkitekter</strong> der
            ønsker en struktureret metode til at definere de standarder og krav der skal gælde for et nyt projekt —
            og eksportere dem som kontekst til AI-kodningsassistenter.
          </p>

          <div className="h-px bg-neutral-100" />
        </motion.div>

        {/* Problemet */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Problemet</h2>
          <p className="text-base text-neutral-700 leading-relaxed">
            Når en ny app bygges fra bunden, er intentionerne altid gode. Men under tidspres forsvinder
            designprincipperne, arkitekturkravene ignoreres og AI-assistenten kender ikke dine standarder.
            Resultatet er inkonsistent kode, teknisk gæld og en brugeroplevelse der ikke lever op til visionen.
          </p>
          <p className="text-base text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900">Hjørneflag</strong> er de non-negotiables der markerer grænserne
            for dit projekt — ligesom hjørneflagene på en fodboldbane markerer spillets rammer. Når de er plantet,
            er der ingen tvivl om, hvad der er inden for og uden for.
          </p>
        </motion.div>

        {/* De 4 typer hjørneflag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">De 4 typer hjørneflag</h2>
          <div className="grid grid-cols-2 gap-4">
            {CORNER_FLAGS.map(({ icon: Icon, title, description, example }) => (
              <div
                key={title}
                className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3 hover:border-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-neutral-200 text-neutral-500">
                    <Icon size={14} />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-sm text-neutral-400 italic">Fx: {example}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Sådan fungerer det</h2>
          <div className="space-y-1">
            {WORKFLOW_STEPS.map(({ step, title, description }, idx) => (
              <div key={step} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-50 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step}
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-100 my-1" />
                  )}
                </div>
                <div className="pb-8 space-y-1 pt-1">
                  <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="p-8 bg-neutral-900 rounded-2xl space-y-6 text-neutral-50"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">GSD Framework: Din Projekt-DNA</h2>
          <p className="text-base leading-relaxed text-neutral-300">
            Hjørneflagene struktureres i <strong className="text-white">14 filer</strong>. For at sikre "Crap-In, Crap-Out" beskyttelse,
            deler vi dem i to distinkte koncepter: Din unikke vision, og vores faste Antigravity-fundament.
          </p>

          {/* AI-generated */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-1">
                <span>✦</span> 10 AI-Drevne Filer — Dit Unikke Projekt
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                Disse filer ændres aktivt af maskinrummet under Wizard-flowet. De skræddersyes fra bunden baseret på din vision, domæne og tech-stack. 
                Her lever din logik, dine specifikke systemregler, og dine custom-byggede Agent Skills. Intet i disse filer er generisk.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'SPEC.md',          desc: 'Vision, user stories og success criteria' },
                { name: 'architecture.md',  desc: 'Stack, datamodel og systemarkitektur' },
                { name: 'PLAN.md',          desc: 'Atomiske opgaver og milestones' },
                { name: 'AGENTS.md',        desc: 'AI-team setup og Prompt-guidelines' },
                { name: 'testing.md',       desc: 'Test-suites og TDD-workflow' },
                { name: 'STATE.md',         desc: 'Beslutningslog og åbne risici' },
                { name: 'DESIGN.md',        desc: 'UI-filosofi og komponentbibliotek' },
                { name: 'rules.md',         desc: 'Dine skræddersyede Causal Anchors' },
                { name: 'SKILL.md',         desc: 'Dine unikke Agent Skills (Custom bygget)' },
                { name: 'llms.txt',         desc: 'Master Prompt til kodeeditoren' },
              ].map((f) => (
                <div key={f.name} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg space-y-0.5">
                  <p className="text-sm font-mono text-neutral-200 font-semibold">{f.name}</p>
                  <p className="text-sm text-neutral-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Baseline */}
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-1">
                <span>🌐</span> 4 Antigravity Conventions — Det Stabile Fundament
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                Disse filer ændres IKKE af the Wizard. De er statiske operationelle opskrifter og standarder hentet direkte fra Antigravity-økosystemet. 
                De sikrer, at uanset hvor vild din vision er, har projektet altid en stringent, professionel open-source struktur i ryggen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'workflows.md',     desc: 'Kanoniske processer og /slash-kommandoer' },
                { name: 'CHANGELOG.md',     desc: 'SemVer versionslog (statiske skabelon)' },
                { name: 'CONTRIBUTING.md',  desc: 'Antigravity branch-navngivning & PR-regler' },
                { name: 'SECURITY.md',      desc: 'Ansvarlig fremlæggelse for sårbarheder' },
              ].map((f) => (
                <div key={f.name} className="px-3 py-2 bg-blue-950/30 border border-blue-900/40 rounded-lg space-y-0.5">
                  <p className="text-sm font-mono text-blue-300 font-semibold">{f.name}</p>
                  <p className="text-sm text-neutral-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-sm text-amber-400 font-medium border-t border-white/10">
            <ArrowRight size={14} />
            Kompileres i real-tid til én 'Master Prompt' — klar til injicering i din IDE
          </div>
        </motion.div>

        {/* C-Suite Advisory Board */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Advisory Board (C-Suite)</h2>
            <p className="mt-2 text-base text-neutral-700 leading-relaxed">
              Et dedikeret 'C-Suite Board' af 5 specialister ("Agenter") lever i maskinrummet og sørger for holistisk sparring.
              Du kan altid tilkalde boardet globalt via din terminal eller AI-chat med kommandoen <code className="font-mono text-sm bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">/cc reports</code>.
            </p>
            <p className="mt-2 text-sm text-neutral-500 italic">
              *Boardet har gennemført et intensivt, tværfagligt opkvalificeringsforløb (The Offsite Mandate) og arbejder i total arkitektonisk og visuel synergi. Ingen silo-tænkning.*
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
            {[
              { role: 'CPO',         name: 'Chief Product Officer',   desc: 'Ejer Målet & Værdiskabelse. Prioriterer forretningsværdi og dræber overflødig støj.', icon: '🎯' },
              { role: 'CTO',         name: 'Chief Tech Officer',      desc: 'Ejer Arkitektur & Fundament. Sikrer systemets integritet og leder Tauri v2 migrationen.', icon: '🏗️' },
              { role: 'CQA',         name: 'Head of Quality Assur.',  desc: 'Ejer Stabilitet. Håndhæver streng TDD og sikrer at features ikke er "aspirationelle".', icon: '🧪' },
              { role: 'COO',         name: 'Chief Operating Officer', desc: 'Ejer Processer & Værktøjer. Re-evaluerer interne agenter og optimerer udviklingsflowet.', icon: '⚙️' },
              { role: 'CDO',         name: 'Chief Design Officer',    desc: 'Ejer Æstetikken. Vogter Minimal Chrome, 8pt grid og Interaction Fluency.', icon: '✨' },
            ].map((a) => (
              <div
                key={a.role}
                className="flex items-start gap-4 px-4 py-3 bg-white hover:bg-neutral-50 transition-colors"
               >
                <div className="text-xl pt-0.5 w-8 flex-shrink-0 text-center">{a.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                    {a.role} 
                    <span className="text-sm font-normal text-neutral-400">— {a.name}</span>
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Kernefilosofi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pb-8 border-t border-neutral-100 pt-8 space-y-3"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Kernefilosofi</h2>
          <p className="text-2xl font-light tracking-tight text-neutral-900 italic">
            "Værktøjet skal forsvinde."
          </p>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Minimal Chrome. Tastatur-first. Ingen visuel støj. Alt der eksisterer i interfacet, tjener indholdet.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
