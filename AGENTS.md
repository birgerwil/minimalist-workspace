---
name: AGENTS.md
description: Hoved-kortet for AI-navigering i The Workbench. Vejviser til terræn, skills og agenter.
---

# 🧭 The Workbench: Agent Wayfinding (Trail Map)

Velkommen til projektets hjerte. Dette dokument hjælper dig (AI-agenten) med at orientere dig i koden, finde de rette værktøjer og forstå vores design-dogmer.

## 🗺 Hvor er jeg? (Bearings)

| Mappe | Indhold | Næste skridt |
| :--- | :--- | :--- |
| `src/` | React frontend & UI komponenter | Læs `src/AGENTS.md` |
| `server.ts` | Backend AI Proxy & Server logik | Læs kildekoden direkte |
| `.agents/skills/` | On-demand færdigheder (Playbooks) | Se `.agents/AGENTS.md` |
| `docs/` | Dokumentation, Rules & State | Læs `docs/rules.md` |

---

## 🏗 Projektets Fundament (The Ground Truth)
Disse filer definerer alt, hvad vi bygger:
1. **SPEC.md**: Projektets vision, prioriteter og scope (Product Owner ejer denne).
2. **architecture.md**: Teknisk stack, data-model og integrationer (Arkitekten ejer denne).
3. **docs/rules.md**: De absolutte regler (P1-P5), Thinking Tiers og UX-dogmer.

---

## 🛠 Aktivering af Skills
Vi bruger **"Progressive Disclosure"**. Hvis du har brug for en specifik færdighed, skal du "loade" den fra `.agents/skills/`. Her er de mest brugte:
- `/cc ux-review`: Kvalitetstjek af UI.
- `/cc grill-me`: Skeptisk udfordring af ideer.
- `/cc pre-mortem`: Fremsynet risikoanalyse.
- `/cc rubber-duck`: Logisk fejlfinding linje-for-linje.

---

## 👔 The Board (C-Suite)
Hvis du er i tvivl om strategi eller retning, indkald boardet med `/cc`.
De sikrer, at vi aldrig over-engineerer og altid holder os til visionen.

*Husk: Vi bygger "Tools for Thought". Minimal Chrome, High Fluency.*
