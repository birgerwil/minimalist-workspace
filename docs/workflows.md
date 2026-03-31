# workflows.md — AI Tuner Workbench

> Dette dokument er et index over kanoniske processer og brugerflows.
> Detaljerede flows er defineret i `docs/UX_FLOWS.md`.

---

## Indholdsfortegnelse

### Brugerflows (UX_FLOWS.md)
Alle kanoniske brugerflows — visit `docs/UX_FLOWS.md` for den fulde specifikation:

- **FL-01** — Ny bruger: Opret konto og opret første projekt
- **FL-02** — Returner bruger: Login og fortsæt arbejde
- **FL-03** — Projektstyring: Opret, vælg og slet projekter
- **FL-04** — AI Wizard: Generer projektdokumentation (4-trins flow)
- **FL-05** — Dokumentationseditor: Rediger og gem version
- **FL-06** — Versionsstyring: Sammenlign og gendan versioner
- **FL-07** — Master Prompt: Eksportér til AI-kodeeditor
- **FL-08** — Command Center: Aktivér `/cc` og spar med Advisory Board

---

## The COO's Toolbelt (On-demand Workflows)

Disse workflows er The COO's ansvarsområde. De aktiveres ved at indkalde C-Suite specialisterne via din AI-editor:

| Værktøj (Skill) | Aktivering | C-Suite Ansvarlig | Formål / Proces |
|:---------|:-----------|:------------------|:----------------|
| `grill-me` | `/cc grill-me [idé]` | The Full Board | **Ideation-fasen:** Kritisk C-Suite analyse af en løsning. Boardet foretager et Web Trend-Scout før de griller dig på tech-debt, UI og værdiskabelse. |
| `ux-review` | `/cc ux-review` | CDO & CPO | **UI/UX-fasen:** Audit af dit komponent mod *Minimal Chrome* og *Interaction Fluency*. Udføres før UI push. |
| `pre-mortem` | `/cc pre-mortem` | QA & Arkitekt | **Før Arkitektur Lock:** Identificering af worst-case teknisk gæld og data-tab *inden* koden skrives. |
| `rubber-duck` | `/cc rubber-duck` | Arkitekten (CTO) | **Debug-fasen:** Tænk højt-fejlfinding, hvor Arkitekten stopper dine udtalte antagelser for at finde logiske fejl. |
| `react-patterns` | `/cc react-patterns` | QA & COO | **Kodnings-fasen:** Enforced TDD checkliste, der kræver Optimistic UI og Dirty State for al interaktiv kode. |

---

## Command Center (C-Suite)

| Agent | Aktivering | Formål |
|:---------|:-----------|:-------|
| `cc/board` | `/cc` eller `/cc reports`| Orchestrator: State of the Union fra alle 5 medlemmer inklusiv The Trend-Scout Mandate (frisk web-data bragt ind i mødet). |
| `cc/po` | `/cc po` | Product Owner (CPO): Vision, interaction fluency, UX_FLOWS, SPEC.md |
| `cc/arkitekt` | `/cc arkitekt` | Arkitektur (CTO): System design, data retention, safety gates, architecture.md |
| `cc/qa` | `/cc qa` | Head of QA: Playwright E2E, Unit tests, tech-debt forebyggelse, testing.md |
| `cc/coo` | `/cc coo` | Operations (COO): Værktøjskassen, proces flow, regler, sikkerhed og governance |
| `cc/cdo` | `/cc cdo` | Design Officer (CDO): Æstetik, Minimal Chrome, typographic alignment, DESIGN.md |

---

*Gennemskrevet og godkendt af The COO (2026).*
