# CHANGELOG.md — AI Tuner Workbench

Alle væsentlige ændringer i dette projekt dokumenteres her.
Format følger [Keep a Changelog](https://keepachangelog.com/da/1.0.0/) og projektet bruger [Semantic Versioning](https://semver.org/).

---

## [Unreleased] — 2026-03-31

### Vision Refactor (GSD "Anti-Crap-In")
- **Kernevision split:** Vision-feltet er nu 3-delt (Kernebehov, Funktionel Reference, UI Reference).
- **Hard-Stop Clarification:** Nyt Step 2 i Wizard tvinger AI-afklaring (Grill-Me) *før* tekniske valg.
- **useWizard.ts**: Udvidet med `uiReferences`, `functionalCompetitors` og 5-trins state-machine.

### Safety Invariants (Forebyggelse)
- **Causal Anchors (CA-07 & CA-08)**: Indført i `rules.md`. Forbyder Board-inkonsistens og Wizard-bypass.
- **Automatic Health Check**: Ny Vitest test `boardInvariants.test.ts` validerer C-Suite filer mod UI.
- **Agent Self-Audit**: `/cc` kommandoen i `board.md` har nu et indlæst Pre-flight konsistens-tjek.

### C-Suite Reorganisering
- **Nye Roller**: COO (Operations) og CDO (Design) oprettet; `compliance.md` slettet.
- **Navne-alignment**: Alle agenter opdateret til CPO, CTO, CQA, COO og CDO.
- **AboutView.tsx**: UI opdateret med de 5 nye roller og navne.

### Rettet
- `useProjects.ts`: Fjernet fejlbehæftet auto-initialisering af Version 1, der knækkede Wizard-flowet.

## [Unreleased] — 2026-03-30

### Auditørkorps (Nyt)
- **Chef Auditør** (`.agents/skills/audit/chef-auditor.md`): Orchestrator med 5-trins triage-protokol
- **UX Auditør** (`audit/ux-auditor.md`): Interaction Fluency + UI/Docs-alignment
- **Docs Auditør** (`audit/docs-auditor.md`): Placeholder-tjek og cross-reference integritet
- **Sikkerhedsauditør** (`audit/security-auditor.md`): Firestore, env vars, PII/GDPR, CVE'er
- **API Auditør** (`audit/api-auditor.md`): npm-sundhed, fetch, Firestore-queries, Gemini API
- **Arkitektur Auditør** (`audit/architecture-auditor.md`): Drift, lag-violations, vendor lock-in
- **Performance Auditør** (`audit/performance-auditor.md`): Core Web Vitals 2025, bundle, render
- **Test Auditør** (`audit/test-auditor.md`): TDD-compliance, coverage, CI/CD
- **Corpus Auditør** (`audit/corpus-auditor.md`): CSI-loop — selvforbedring af korpset (Trin 5, automatisk)
- Aktivering via `/audit`, `/audit [domæne]`, `/audit refresh [domæne]`, `/audit corpus`

### Universelle Baseline-filer (Nyt)
- `docs/CHANGELOG.md` — Keep a Changelog-format med Semantic Versioning
- `docs/CONTRIBUTING.md` — Branch-navngivning, Conventional Commits, PR-regler
- `docs/SECURITY.md` — Ansvarlig fremlæggelse med responstider og scope
- `docs/workflows.md` — Index over on-demand workflows og UX_FLOWS

### Order Confirmation (Redesignet)
- Filer opdelt i to tydelige grupper: AI-genererede (8) og universelle baseline (6)
- Hver fil viser nu label + beskrivende tekst (ikke blot filnavn)
- Grupper har distinkt visuel identitet: neutral (AI) vs blå (baseline)

### AboutView / Om-siden (Opdateret)
- GSD Framework-sektionen viser nu alle 14 filer korrekt (var 9, forældet)
- To-gruppes layout: AI-genererede og universelle baseline med beskrivelser
- Filnavne korrekte (lowercase `architecture.md`, `testing.md`)

### Fixes & Konsistens
- `ARCHITECTURE.md` → `architecture.md` (lowercase, case-konsistent med disk)
- `SKILL.md` desc opdateret: "Agent Skills" → "Platform Codebook"
- "Principper" → "Hjørneflag" i Order Confirmation (terminologi-konsistens)
- `llms.txt` projektmap opdateret med alle 14 filer + auditørkorps
- `{{PROJECT_NAME}}` og `{{DOMAIN}}` placeholders erstattet i alle baseline-filer
- `manifest.md` markeret som ⚠️ DEPRECATED
- Server.ts skills-loader opgraderet til rekursiv directory walk (picks up `audit/` subdir)

### Ændret
- `AGENTS.md`: Auditørkorps-sektion tilføjet med komplet team-tabel og aktiveringsguide
- `docs/workflows.md`: Oprettet — index over alle on-demand workflows inkl. auditørkorps

---

## Versionsformat

```
## [MAJOR.MINOR.PATCH] — ÅÅÅÅ-MM-DD

### Tilføjet       — ny funktionalitet
### Ændret         — ændringer i eksisterende funktionalitet
### Forældet       — funktionalitet der snart fjernes
### Fjernet        — funktionalitet der er fjernet
### Rettet         — fejlrettelser
### Sikkerhed      — sårbarhedsrettelser
```

> **Regel:** Opdatér denne fil ved *enhver* PR der påvirker brugeroplevelsen eller API-overfladen.
> Breaking changes markeres tydeligt med ⚠️ og versionsnummer bumpes til næste MAJOR.
