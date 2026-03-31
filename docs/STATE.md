# STATE.md - Beslutningslog og Åbne Risici

## 31. Marts 2026: "The Independence Directive"
- **Fejl opdaget:** `WorkbenchEditor` / `useVersions` overskrev host-motorens egen kodebase fordi "Gem"-knappen skrev kundeprompts direkte ned i maskinrummets egen `docs/` mappe. Derved slettede the vision motor sin egen hukommelse.
- **Konsekvens:** Alle "Gem"-knapper slettet, file-write endpoints pauset. Master Prompt (UI-output) laves nu *dynamic client-side* ved tab-klik for at sikre filesystem immutability.
- **Action Items:** Master prompt injicerer nu automatisk best-practices from C-Suite (`.agents/skills/cc/po.md`, osv.) og `SECURITY.md` ind i kundernes prompt-fil (`§15`), uden at skrive *noget* til vores eget disk-bibliotek.

## Åbne Risici
1. Firestore synkronisering: Vi benytter primært UI'en til asynkron vision-boarding. Hvor tit og automatiseret the Wizard synkroniserer med Firebase når "Save-knap" mangler, skal finpudses. (Evt. Auto-save i baggrunden når man klikker på tabs).
2. Tauri V2 Migration stadig afventet. Skrive-rettigheder fra browser til lokal-filer via Rust IPC skal følge The Independence Directive og KUN skrive i Kundens projektfolder, IKKE Antigravitys egen Mappe.
