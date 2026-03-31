# PLAN.md - Execution Roadmap (AI Tuner Workbench)

## Overordnet Mål
At udvikle en fuldendt og skalerbar "The Vision Motor", der omdanner en forfatters vilde idéer til struktureret kode og Causal Anchors, så The Elite Team (brugeren + IDE-agenter) kan overtage stafetten uden "Crap-In, Crap-Out".

## Milestones

### Milestone 1: Core "GSD Framework" Foundation
- [x] Opret `useWizard.ts` for AI generering (10 dynamiske moduler).
- [x] Opret Workbench Editor til visuel refaktorering.
- [x] Implementér "Causal Anchors" (the Rules engine).

### Milestone 2: C-Suite & Arkitektonisk Oprydning
- [x] Slet lokal overskrivning af vores egen `docs/`! (The Independence Directive CA-09).
- [x] Fjern `Gem-version` knappen for at undgå filial forvirring.
- [x] Indfør "The Best-Practice Merger" for the Master Prompt.

### Milestone 3: The Native Experience (Tauri v2)
- [ ] Omskriv app til Desktop Application (Tauri v2).
- [ ] Fjern Node/Express backend - flyt filsystem-ting til Rust IPC.
- [ ] Udskift Firestore Cloud Legacy med The SQLite-WASM / OPFS lokale lagring for fuld privacy.
