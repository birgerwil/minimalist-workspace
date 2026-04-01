# STATE.md - Beslutningslog og Åbne Risici

## 31. Marts 2026: "The Independence Directive"
- **Fejl opdaget:** `WorkbenchEditor` / `useVersions` overskrev host-motorens egen kodebase fordi "Gem"-knappen skrev kundeprompts direkte ned i maskinrummets egen `docs/` mappe. Derved slettede the vision motor sin egen hukommelse.
- **Konsekvens:** Alle "Gem"-knapper slettet, file-write endpoints pauset. Master Prompt (UI-output) laves nu *dynamic client-side* ved tab-klik for at sikre filesystem immutability.
- **Action Items:** Master prompt injicerer nu automatisk best-practices from C-Suite (`.agents/skills/cc/po.md`, osv.) og `SECURITY.md` ind i kundernes prompt-fil (`§15`), uden at skrive *noget* til vores eget disk-bibliotek.

- **2026-04-01**: **Cloud-Native Pivot.** Arkitekturen er nu 100% Firebase-baseret. `useDiskSync.ts` er fjernet for at minimere kompleksitet og eliminere risikoen for filsystem-konflikter.
- **2026-04-01**: **Projekt-livscyklus.** Fuld slette-funktionalitet (`deleteProject`) implementeret via Firestore. Dette fuldender Cloud-projektoverblikket.
- **2026-04-01**: **AI Model-vask.** Alle interne Gemini-kald er migreret til `gemini-1.5-flash` for at sikre stabilitet og korrekt API-nøgle håndtering.

## Åbne Risici
1. **Firestore Sync Strategy**: Nu hvor vi er 100% cloud-baserede, skal vi sikre optimal performance under hyppige opdateringer. Auto-save ved tab-skift og debounced gem-logik i editoren er kritiske.
2. **Offline-kapabilitet**: Uden Tauri v2/Lokal-sync er brugeren afhængig af internetadgang. Fremtidig PWA-understøttelse eller SQLite-WASM bør overvejes som næste skridt mod local-first uden at bryde 'The Independence Directive'.
