# DESIGN.md — Minimalistisk TfT Design Manual
# AI Tuner Workbench

> Denne fil er den kanoniske reference for alle designbeslutninger.
> Refereres fra: `rules.md` (P3), `SKILL.md` (Design System skill), `AGENTS.md` (UX_CHECK).
> AI-agenten skal altid verificere mod denne fil ved UX-relaterede ændringer.

---

## 1. Designfilosofi: Tre ubrydelige principper

### I. Det usynlige interface (Minimal Chrome)
**"Værktøjet skal forsvinde."**

Brugergrænsefladen eksisterer udelukkende for at tjene indholdet — ikke sig selv.

| Regel | Konkret implementering |
|---|---|
| Fjern det unødvendige | Hvert UI-element kræver en eksplicit begrundelse for sin eksistens |
| White space som hierarki | Adskil sektioner med luft — aldrig med linjer eller kasser |
| Kontekstuelle kontroller | Vis handlinger kun ved hover eller tekstmarkering — aldrig permanent |
| Ingen dekorativ farve | Farver bruges udelukkende semantisk (fejl, succes, dirty state) |

**Forbudt:**
- Borders/shadows rundt om knapper eller paneler uden funktionelt formål
- Gradienter til branding
- Ikoner større end 20px i UI, 16px inline
- Mere end 3 niveauer af visuel hierarki på én skærm

### II. Øjeblikkelig respons (Lokal-først)
**"Brugeren venter aldrig på netværket."**

| Princip | Implementering |
|---|---|
| Lokal-først arkitektur | Data lever primært på enheden; cloud er backup, ikke primær kilde |
| Auto-save som standard | Ingen Gem-knap til redigering. Gem-knap = eksplicit version-snapshot |
| Optimistisk UI | Opdater UI øjeblikkeligt — rollback ved fejl. Aldrig spinner for lokale operationer |
| Tastatur-først | 100% tastatur-navigation. Cmd+K Command Palette som primært knudepunkt |

**Respons-budget:** Visuel feedback på brugerinput < 100ms. Asynkrone operationer viser altid aktiv status.

### III. Progressiv afsløring (Progressive Disclosure)
**"Vis kun det der er relevant for den aktuelle opgave."**

```
Niveau 1 (altid synligt):   Kernefunktionalitet — indhold, primær handling
Niveau 2 (hover/aktiv):     Sekundære handlinger — rediger, slet, flyt
Niveau 3 (eksplicit åbn):   Avancerede indstillinger — skjult bag toggle/menu
```

Nye brugere møder kun Niveau 1. Ekspertfunktioner opdages progressivt.

---

## 2. Visuelt Design System

### Typografi

**Primær skrifttype:** `Inter` (variabel font) — designet specifikt til skærme med høj x-højde.

**Type Scale (matematisk 1.333x ratio):**
| Token | px | Tailwind | Anvendelse |
|---|---|---|---|
| `text-xs` | 12px | `text-xs` | Labels, metadata, uppercase trackers |
| `text-sm` | 14px | `text-sm` | Brødtekst, knapper, hjælpetekst |
| `text-base` | 16px | `text-base` | Primær brødtekst, editor-indhold |
| `text-xl` | 20px | `text-xl` | Sektion-overskrifter |
| `text-2xl` | 24px | `text-2xl` | Side-titler |
| `text-4xl` | 32px | `text-4xl` | Display-titler (login, onboarding) |

**Line-height:** Brødtekst: `leading-relaxed` (1.625) eller `leading-normal` (1.5). Min. 1.4 — aldrig under.

**Overskrifter:** `font-light` + `tracking-tight`. Udnytter hvidt rum frem for tyngde.

**Labels/Metadata:** `text-xs font-bold uppercase tracking-widest text-neutral-400`.

### Farvepalet — Udelukkende Semantisk

```
Primær tekst:      neutral-900    (#0a0a0a)  — Overskrifter, handlinger
Sekundær tekst:    neutral-500    (#737373)  — Hjælpetekst, beskrivelser
Deaktiveret:       neutral-300    (#d4d4d4)  — Placeholder, inaktiv
Baggrund:          neutral-50     (#fafafa)  — App-baggrund
Hover-overlay:     neutral-100    (#f5f5f5)  — Hover-states
Border:            neutral-200    (#e5e5e5)  — Subtile dividers

Dirty State:       amber-400/500  — Ugemte ændringer (ravgul pulsering)
Fejl:              red-500/600    — Fejlstatus, advarsler
Succes:            green-500      — Bekræftelse, completion
Links:             blue-600       — Klikbare referencer
AI/Aktiv:          Kontekst-afhængig (se nedenfor)
```

**Forbudt:** Dekorative farver, gradients til branding, farver uden semantisk rolle.

**Dark Mode:** Baggrunde tones ned fra ren sort — brug `neutral-900` (#171717) som "sort" baggrund, `neutral-800` som container. Undgå kraftig kontrast der forårsager øjentræthed.

### 8pt Grid System

**Al spacing følger 8-pixels multipla. Ingen undtagelser.**

```
8px  → p-2, gap-2, m-2    (micro spacing — inden i komponenter)
16px → p-4, gap-4, m-4    (komponent intern spacing)
24px → p-6, gap-6, m-6    (sektion spacing)
32px → p-8, gap-8, m-8    (side padding)
48px → p-12, gap-12, m-12 (større sektioner)
64px → p-16, gap-16, m-16 (side-niveau luft)
```

**Indholdsbredde:** Primært indhold centreres med `max-w-2xl mx-auto` (672px). Editor-indhold: `max-w-none` (fuld bredde).

---

## 3. Interaktionsmønstre

### Command Palette (Cmd+K)
- Primært navigations- og handlingsknudepunkt
- Flydende, søgbar dialogboks med "fuzzy search"
- Finder resultater selv ved stavefejl
- Giver adgang til: alle handlinger, filer, navigationspunkter
- Aldrig erstattet af dropdown-menuer til hyppige handlinger

### Animationer og Transitions
- **Entré/exit:** `opacity 0→1`, `y: 10→0`, `duration: 0.2s` — subtile, aldrig forsinkende
- **Loading:** Spinner med `border-t-neutral-900` på `border-neutral-100` base
- **Hover:** `transition-colors duration-150` — øjeblikkelig visuel respons
- **Ingen animation** der blokerer interaktion eller forsinker brugerens flow

### Touch og Mobile
Dette er en **desktop-only** applikation.
- Ingen touch-targets
- Ingen responsive breakpoints
- Ingen mobil-optimering
- Multi-panel desktop layout er fundamentet

---

## 4. Agentic Engineering Principper

### Thinking Tiers — Variabel Kognition
Brug ikke "High Thinking" til alt. Match tænkningsdybde til opgavetype:

| Tier | Niveau | Aktiveres ved |
|---|---|---|
| MINIMAL | Lynhurtig | Boilerplate, simple ternaries, fmt-rettelser |
| LOW | Hurtig | Komponent-redigering, prop-tilføjelse, styling |
| MEDIUM | Standard | Feature-implementering, hook-logik, API-kald |
| HIGH | Dyb analyse | Arkitektoniske valg, datamodeller, sikkerheds-logik |

**Regel:** SPEC.md, ARCHITECTURE.md og sikkerhedsdesign → altid HIGH. Repetitiv kode → LOW/MINIMAL.

### Hierarchy Inversion — Kommandohierarki
AI'ens egne "effektivitets-regler" er altid laveste prioritet. Hierarkiet (fra `rules.md`):

```
P1: USER_GOAL       — North Star. Fuldfør altid brugerens intention.
P2: DATA_HARDENING  — Ingen data går tabt. Ingen unhandled exceptions.
P3: DESIGN_DOGME    — Minimal Chrome. Lokal-først. Tastatur-først.
P4: ARCH_ANCHORS    — Stack og mønstre fra architecture.md og SKILL.md.
P5: AI_EFFICIENCY   — AI'ens egne regler (token-budget, kortfattethed). LAVEST PRIORITET.
```

**P5 må aldrig overstyre P1-P4.** AI'en må aldrig udelade kode, forkorte implementeringer eller slette projekt-kontekst for at spare regnekraft.

### Anti-Minimization Mandat
```
FORBUD: Udelad aldrig detaljer for at spare plads eller reducere kognitiv belastning.
FORBUD: Aldrig "…resten af koden er den samme…" eller lignende forkortelser.
KRAV:   Lever altid den fulde, hærdede tekniske dybde.
KRAV:   Bevar altid fuld kontekst om det langsigtede mål på tværs af sessioner.
```

### Causal Anchors — Ubrydelige Logiske Ankre
Disse sandheder forbliver konstante gennem hele projektet. Ingen beslutning må modsige dem:

| Anker ID | Erklæring | Konsekvens ved brud |
|---|---|---|
| CA-01 | Data forlader aldrig enheden u-krypteret | Afvis enhver cloud-synk uden encryption |
| CA-02 | 0 TypeScript-kompileringsfejl er kravet | Stop implementering og ret fejl først |
| CA-03 | Ingen native browser-dialogs (`alert`, `confirm`, `prompt`) | Brug altid styled React modal |
| CA-04 | Dirty State detekteres ved ENHVER brugermodifikation | `setIsDirty(true)` er obligatorisk |
| CA-05 | Minimal Chrome — intet visuelt element uden funktionelt formål | Anfør overtrædelse eksplicit og foreslå alternativ |

---

## 5. UX Verifikations-Checklist (UX_CHECK)

Kør denne checklist efter ENHVER UI-ændring:

```
□ Minimal Chrome: Er der fjernet alle elementer der ikke tjener indholdet?
□ 8pt Grid: Følger al spacing 8-pixels multipla?
□ Semantisk farve: Bruges farver KUN til semantisk kommunikation?
□ Typografi: Bruges korrekt skala og line-height (≥ 1.4)?
□ Progressiv afsløring: Er avancerede funktioner skjult bag Niveau 2/3?
□ Keyboard-navigation: Er alle handlinger tilgængelige uden mus?
□ Response-budget: Er visuel feedback < 100ms for lokale operationer?
□ Dark Mode: Er baggrunde tonede (ikke ren sort/hvid)?
□ Causal Anchors: Overtræder ændringen nogen af CA-01 til CA-05?
```

---
Last-Modified: 2026-03-30
Refereret af: rules.md, SKILL.md, AGENTS.md
