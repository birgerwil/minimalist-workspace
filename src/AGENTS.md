---
name: src/AGENTS.md
description: Wayfinding for kildekoden. Komponenter, Hooks og UI-hierarki.
---

# 🎨 Codebase: UI & Frontend Terræn

Du befinder dig i hjertet af applikationen. Her bygger vi brugerfladen med React og Vanilla CSS.

## 🗺 Hvor er jeg? (Bearings)

| Mappe | Indhold | Næste skridt |
| :--- | :--- | :--- |
| `src/components/ui/` | Primitives (Buttons, Cards, Inputs) | Genbrug altid eksisterende UI tokens |
| `src/hooks/` | State management (Wizard, Versions) | Læs `useWizard.ts` for central logik |
| `src/services/` | AI integration & Backend proxy | Se `gemini.ts` for AI instruktioner |
| `src/index.css` | Designtokens & Grid (8pt) | GSD Frameworkets fundament |

---

## 🏗 Udviklings-Dogmer
1. **Minimal Chrome**: Ingen unødvendige borders, skygger eller labels.
2. **Thinking Tiers**: Brug **MEDIUM** for feature-logik og **LOW** for styling tweaks.
3. **TypeScript First**: Sørg for at alle props og state er typet korrekt.

---

## 🛠 Relevante Skills
Når du arbejder her, kan du med fordel bruge:
- `/cc react-patterns`: Validering af din React kode.
- `/cc ux-review`: Sidste tjek af UI-tokens og flow.

---
*Gå til [AGENTS.md](../AGENTS.md) for det store overblik.*
