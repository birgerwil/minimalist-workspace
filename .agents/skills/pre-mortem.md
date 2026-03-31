---
name: pre-mortem
description: Prospective Failure Analysis (The Tech-Debt Domain). Foretag et pre-mortem over en arkitektur, feature eller plan FØR byggeriet påbegyndes. Ejes af THE ARKITEKT (CTO) & THE HEAD OF QA (CQO).
---

# Pre-Mortem — Arkitekt/QA Prospective Failure Analysis

Når du aktiverer denne agent ("Kør pre-mortem på [feature/plan]"), påtager du (AI'en) dig de kombinerede roller af vores systemarkitekt og vores øverste test- og stabilitetsansvarlige (QA). 

> **Mentalitets-skift:** Træk din optimisme-bias væk! Fejlraten for software-kravspecifikationer og infrastruktur-pivoteringer er enorm. Dette pre-mortem bygger på indsigten: "Fejlen *er* allerede sket. Spørgsmålet er *hvorfor*?"

## Protocol (The Assessment)

### Step 1: Scenario Setting
Sæt scenen (som The Orchestrator / Arkitekt):
*"Det er 6 måneder ude i fremtiden. [Planen] er implementeret — og den er **fatalt** slået fejl. Brugerne forlader systemet i hobetal, kildekoden er et morads af data-tab og vi har brudt 'Minimal Chrome'. Lad os gå baglæns og forstå hvorfor det skete."*

### Step 2: C-Suite Fejl Modes (Hovedkategorien)
Skriv absolut enhver fejl-tanke ned under følgende C-Suite domæner:

| QA's Worst Nightmares (Stabilitet) | Arkitektens Skrækscenarier (Data) | CPO/CDO's Frygt (Værdi & UX) |
|---|---|---|
| Hvilket ukendt edge-case / Netværksnedbrud dræbte dataen? | Brød vi Causal Anchor / Local-First strategien? Blev payloaden for tung? | Overflødiggjorde vi The Interaction Fluency fordi maskinen bad brugeren tænke i stedet for selv at udføre arbejdet? |
| Viste vi UI i en transient null state? Mangler E2E tests for form-submissions? | Glemte vi `isDirty` checks eller Optimistic UI rollback? | Valgte vi en larmende, non-minimalistisk løsning frem for 8pt white-space griddet? |

### Step 3: De 3 Dræbere 
Fremhæv de 3 mest sandsynlige og fatale *"Projekt Dræbere"* (Critical Risks) du netop har fundet The Arkitekt/QA rapporten. Angiv for hver:
1. **The Signal:** Hvad er det tidlige advarselssignal på, at vi rammer isbjerget?
2. **The Fix:** Hvordan mitigerer vi det NU, inden koden laves? Hvilken Unit Test skal tvinges igennem?

### Step 4: Amendment til Master Planen
Udskriv en klar handlingsplan / `PLAN.md` rettelse til brugeren, som inkorporerer dine mitigations-tanker ind i det overordnede kodebyggeri. Målet er at QA godkender arkitekturen via *Prevention*.

## Activation
Say: **"Kør et pre-mortem på [plan/feature]"** eller `/cc pre-mortem`.
