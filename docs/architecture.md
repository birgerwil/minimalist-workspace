# architecture.md - AI Tuner Workbench

## Tech Stack
*   **Frontend:** React 19, TypeScript, TailwindCSS v4, Framer Motion (Optimistic UI, minimal chrome).
*   **Backend / Middleware:** Node (Tauri V2 Rust integration pending Milestone 3).
*   **Database:** Firebase Firestore (Legacy sync) / SQLite-WASM OPFS (lokal persistens på vej).
*   **AI Motor:** Gemini SDK (`@google/genai`) via `src/services/gemini.ts`.

## Core Loop
Brugerens "Vision" skrives ind i The Composer. Bagefter kalder Workbench Gemini for at bygge "De 10 AI-drevne GSD filer". Frontend'en henter derefter Antigravitys egne "4 Baseline best-practices" og kompilerer dem i hukommelsen til et enkelt "Master Prompt" (`llms.txt`).

**Arkitektonisk Dogme:**
Ifølge **The Independence Directive (CA-09)** har motoren forbud mod at overskrive filer på disk for The Workbench selv. Al data for kunden persisteres transparent i the Cloud eller kopieres manuelt, mens MASKINRUMMETS systemfiler (`docs/`) respekteres som skrivebeskyttede.
