# UX_FLOWS.md — Interaction Fluency Guide
# AI Tuner Workbench & fremtidige projekter

> **Interaction Fluency:** Det punkt hvor grænsefladen er så velafstemt med brugerens
> tankegang, at selve interfacet forsvinder — kun opgaven er tilbage.
>
> Refereres fra: `DESIGN.md`, `AGENTS.md` (UX_CHECK), `rules.md` (P3: DESIGN_DOGME).

---

## 1. De tre søjler for Interaction Fluency

### I. Mental Model Alignment
Brugerens interne mentale billede af systemet skal matche systemets faktiske opbygning.

**Test:** Kan en ny bruger beskrive appens struktur korrekt efter 30 sekunders brug — uden forklaring?

| ✅ Godt mønster | ❌ Anti-mønster |
|---|---|
| Routing afspejler brugerens opgave-fase | Routing baseret på systemets interne state |
| Navne matcher brugerens ordforråd | Tekniske navne eksponeret i UI |
| Hierarki er konsistent på ét niveau | Et niveau blander app-nav og projekt-nav |

### II. Information Architecture (IA)
Information er organiseret som brugeren *tænker* om problemet — ikke som systemet gemmer det.

**Principper:**
```
1. Ét hierarki pr. sidebar/navigation — bland aldrig app-niveau og projekt-niveau
2. Primære handlinger er kontekstuelt tilgængelige — ikke globalt altid synlige
3. Tab-rækkefølge følger persona og opgave-flow — ikke alfabetisk eller teknisk rækkefølge
4. Søgning (Command Palette) er fallback for kompleks navigation — ikke erstatning for god IA
```

### III. Task Flow Coherence
Hvert trin leder naturligt og uambiguøst til det næste — ingen falske exits, ingen overraskende sving.

**Principper:**
```
1. Brugeren ved altid hvad trin de er på og hvad næste trin er
2. Ingen eksit fra en guidet flow medmindre flowet er komplet
3. Asynkrone processer (AI-generering) er visuelt forankret i flowet — ikke flydende
4. Returbrugere og nye brugere routes forskelligt — brug kontekst, ikke state
```

---

## 2. Brugerforløb — Kanoniske Flows

### Flow A: Ny Iværksætter (første gang)
```
Login
  ↓
Tomt projekt oprettet
  ↓
Wizard: Vision (hvad vil du bygge?)
  ↓
Wizard: Præferencer (platform, skala, tempo)
  ↓
Wizard: Hjørneflag (SKAL / MÅ ALDRIG)
  ↓
Wizard: Generering (AI producerer alle filer)
  ↓
AI Sparring (AI kritiserer sine egne filer, bruger svarer)
  ↓
ProjectStatus: Oversigt (readiness + master prompt)
  ↓
[Klar til brug i IDE]
```
**KPI:** Tid fra login til "Kopier Master Prompt" < 5 minutter.

### Flow B: Returbruger (iteration)
```
Login → [Auto-route til status for senest valgte projekt]
  ↓
ProjectStatus: Se hvad der fejler
  ↓
[Valg A] Kør AI Sparring igen → forfin filer
[Valg B] Åbn avanceret editor → manuel redigering
[Valg C] Opdater med ny wizard-input → ny generering
  ↓
Gem version → Kopier Master Prompt
```
**KPI:** Returbruger når "Kopier Master Prompt" < 60 sekunder.

### Flow C: Arkitekt (ekspert)
```
Login → Status [eller direkte til Advanced Editor via Cmd+K]
  ↓
Tab-navigation: ARCHITECTURE → rules → AGENTS
  ↓
Manuel redigering + AI-forbedring pr. sektion
  ↓
Gem version (med summary)
```
**KPI:** Ingen tvungen passage igennem wizard for eksisterende projekter.

---

## 3. Routing-regler (Smart Context Routing)

### Regel R1 — Projekt-selektion bestemmer destination
```
Bruger vælger projekt:
  IF projekt har indhold (currentVersion is not null after load)
    → route til 'status'
  ELSE (nyt/tomt projekt)
    → route til 'wizard'
```
⛔ Anti-mønster: `viewMode === 'wizard' || !currentVersion` — dette router alle til wizard
  ved projektstarter, selvom indhold er ved at hentes fra cloud.

### Regel R2 — Ingen guidet flow har en "exit"-knap
```
UNDER en wizard/guided flow:
  - Ingen "Avanceret tilstand →" link
  - Ingen sidebar-navigation til andre sektioner
  - Fokus er låst til den aktuelle opgave
EFTER afsluttet flow:
  - Alle navigationsvalg tilgængelige fra Status
```

### Regel R3 — Faser er eksplicitte, ikke implicitte
```
Wizard trin-indikator inkluderer ALLE faser inkl. Sparring:
  [1] Vision → [2] Præferencer → [3] Hjørneflag → [4] Generering → [5] Sparring
Ikke: 4 trin efterfulgt af en mystisk ny skærm.
```

### Regel R4 — Readiness kommunikeres med handling, ikke procent
```
IKKE: "73%"
I STEDET: "3 af 7 filer er klar. Kør AI Sparring for at forbedre PLAN.md og AGENTS.md."
```

---

## 4. IA-principper for Sidebar og Navigation

### Princip N1 — Ét niveau pr. navigationskomponent
```
Sidebar indeholder ENTEN:
  [A] App-niveau navigation (Oversigt, Om, Indstillinger)
  [B] Projekt-navigation (projektliste)
  
IKKE begge blandet i ét hierarki.

Løsning: Separer med tydelig visuel gruppe-header:
  ── Mine projekter ──────
  ● Projekt A
  ● Projekt B
  ── App ─────────────────
  Indstillinger
  Om
```

### Princip N2 — Tab-rækkefølge følger bruger-persona
```
Iværksætter-flow (opbygning):
  SPEC → PLAN → AGENTS → STATE → (tekniske filer)

Arkitekt-flow (teknik):
  architecture → rules → AGENTS → SKILL → (specifikations-filer)

Standard (balanced):
  SPEC → architecture → PLAN → AGENTS → rules → SKILL → testing → STATE
```

### Princip N3 — Kommando Palette som eksperts genvej
```
Cmd+K giver adgang til ALLE handlinger og filer.
Det er eksperternes shortcut — ikke erstatning for god primær-navigation.
Bruger med ≥ 3 projektbesøg vil typisk skifte til Cmd+K-navigation.
```

---

## 5. Status Views — Handlingsorienteret Hierarki

En status-/oversigts-side bør altid følge dette hierarki:

```
1. KONTEKST     — "Hvad er dette?" (projekt-navn, fase)
2. TILSTAND     — "Hvad er situationen?" (hvad mangler, hvad er klar)
3. HANDLINGER   — "Hvad kan jeg gøre?" (fix mangler, rediger, kør igen)
4. EKSPORT      — "Jeg er klar" (Kopier Master Prompt, del, gem)
```

⛔ Anti-mønster: Eksport-CTA (Master Prompt) placeres før "Tilstand" — brugeren opfordres
til at kopiere noget de endnu ikke ved om er klar.

---

## 6. Feedback og Progress Kommunikation

### Asynkrone operationer
```
Trin 1: Øjeblikkelig optimistisk feedback (< 100ms)
Trin 2: Progress-indikator med tekst: "Genererer SPEC.md..." (ikke bare spinner)
Trin 3: Trin-for-trin bekræftelse efterhånden som det sker
Trin 4: Komplet-feedback med tydelig næste-handling
```

### Readiness og Kvalitet
```
Aldrig: et tal alene (73%)
Altid: tal + forklaring + handling
  "73% AI-beredskab — PLAN.md og AGENTS.md mangler specificitet.
   [Kør AI Sparring] for at forbedre disse automatisk."
```

---

## 7. UX Flow Checklist (til hvert nyt projekt)

Kør dette ved opstart af ethvert nyt projekt:

```
□ Er bruger-personas definerede? (Hvem er Bruger A og Bruger B?)
□ Er Flow A (ny bruger) sketched og tidssat?
□ Er Flow B (returbruger) sketched og tidssat?
□ Er routing-regler R1-R4 implementerede?
□ Er IA-strukturen i sidebar/navigation ét-niveau-konsistent?
□ Er tab-rækkefølgen personabaseret?
□ Er alle status-views handlingsorienterede (ikke rapport-orienterede)?
□ Er asynkrone operationer progress-kommunikeret trin-for-trin?
□ Er Readiness/Kvalitet kommunikeret med handling, ikke procent?
□ Er der ingen guidede forløb med uplanlagte exits?
```

---

## 8. Lærte Lektier fra AI Tuner Workbench

Disse fejl er identificeret og skal undgås i kommende projekter:

| ID | Fejl | Korrekt mønster |
|---|---|---|
| FL-01 | Routing baseret på `!currentVersion` → wizard for alle | Smart routing: tjek indhold fra cloud FØR routing |
| FL-02 | Exit-link i wizard ("Avanceret tilstand →") | Guidede flows er lukkede — exit kun fra completion |
| FL-03 | Sparring-fase uden visuel fase-indikator | Alle faser inkluderes i progress-indikatoren |
| FL-04 | Eksport-CTA før status-oversigt | Handlingshierarki: Kontekst → Tilstand → Handling → Eksport |
| FL-05 | Readiness som procent uden forklaring | Readiness = tekst + handling + procent som supplement |
| FL-06 | App-nav og projekt-nav i samme sidebar | Separer hierarki-niveauer med visuel gruppe-separator |
| FL-07 | Tab-rækkefølge teknisk, ikke persona-baseret | Design tab-rækkefølge ud fra brugerens primære opgave |
| FL-08 | Ingen vej tilbage til iterative AI-faser | Iterative faser (Sparring) tilgængelige fra Status altid |

---
Last-Modified: 2026-03-30
Refereret af: DESIGN.md, AGENTS.md (UX_CHECK), rules.md (P3)
Gælder for: Dette projekt og alle fremtidige projekter bygget med GSD Framework
