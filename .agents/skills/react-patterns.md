---
name: react-patterns
description: React Production Patterns (The Tech Stack Dogma). TDD-kravspecifikationen og arkitekturens rettesnor for alle state, UI og form komponenter. Håndhæves af THE COO og QA.
---

# React Production Patterns (TDD Checkliste fra Operations)

Denne agent aktiveres som en *enforcer* af The COO & QA, når der skal designes app-flows, skrives form-logik, eller implementeres state. De udgør THE PRODUCTION PATTERNS for vores App.

## 1. Optimistic UI with Rollback (Mandatory)
Når vi gemmer data i Firebase, Tauri FS, SQLite eller noget andet eksternt - gælder:
- Opdatér UI'et PÅ MILLISEKUNDET! (Skjul loading spinners hvis muligt, UI er instant).
- Snapshot previous state og rul tilbage via en `catch` blok, VED FEJL.
- Fejl vises udelukkende via `sonner` toast. 
- ***Aldrig*** visuelle pop-ups a la alerts/confirms/prompts.

## 2. The Dirty State Check (Mandatory)
QA The QA Audit Checker vil **altid** kigge efter `isDirty` håndtering i kode vi pumper ud:
- Alle Forms / Tabs sætter isDirty til sand (true) ved minste ændring.
- Den nulstilles udelukkende efter et *sucessfuldt* `.save()`.
- Unsaved changes flag er *amber-400* prik (visuel minimal noise, CDO approved).

## 3. Asynkrone Load-States / Safety Gates
- Hver knap bliver `disabled` under asynkrone saves. Spinner-ikonet flettes minimalt ind i knappen under save.
- C-Suite Routing Regler: Route ALDRIG ud fra midlertidige null-værdier (f.eks. if(!user) ... return <Login/> mens `isLoading` er ægte). Route PÅ KONTEKST - og kun når kontekst er "loaded".
- *Safety Gates:* Context switches eller tab navigation fra en Dirty State fanges (ved at standse navigering og pushe en React styled modal). Ingen native browser guards!

## 4. COO Checklist (Oprettes altid i bunden af koden)
Hver gang du (AI'en) returnerer kode af denne type pga. et prompt a la `"Brug react patterns"`, skal du indsætte en tjekboks:
```
[ ] QA Signoff: Har vi Optimistic Update + Snapshot?
[ ] QA Signoff: Sættes og cleares isDirty perfekt?
[ ] CDO Signoff: Er visuel loader og fejhåndtering formidlet via minimal chrome og TOAST i stedet for nativ browser modal?
[ ] QA Signoff: Router vi ud fra sand load data, ikke bare init state?
```

## Activation
Sige: **"Implementer denne form ud fra react patterns"** eller `/cc react-patterns`.
