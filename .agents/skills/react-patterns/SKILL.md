---
name: react-patterns
description: Retningslinjer for React-kodekvalitet i projektet, herunder hooks, state-management og UI-komponenter.
---

# React Patterns (The Code Standard)

Denne skill sikrer, at vores React-frontend er modulær, effektiv og følger projektets designfilosofi (Minimalist-Workspace).

## 🧠 Thinking Policy (Brug denne tier ved aktivering)

| Tier | Tilgang | Forventet Dybde |
| :--- | :--- | :--- |
| **MINIMAL** | Syntax check | Peger kun på åbenlyse fejl som manglende tegn eller forkerte typer. |
| **LOW** | Flow check | Gennemgår logikken i en funktion og leder efter "off-by-one" fejl. |
| **MEDIUM** | Deep Dive | Forklarer koden linje-for-linje og stiller spørgsmålstegn ved alle antagelser. |
| **HIGH** | Refactor Audit | Vurderer om koden er så kompleks, at den bør skrives helt om. |

---

## 🧭 Wayfinding (Hvor er vi?)
- **UI Kit**: `src/components/ui/`
- **Hooks**: `src/hooks/`
- **Referencer**: `docs/rules.md` (Kodekonventioner)

## 🛠 React Retningslinjer (The Pattern Checklist)

1. **Custom Hooks:** Flyt kompleks logik væk fra komponenten. Ingen "Mega-komponenter".
2. **Context vs Props:** Brug context til globale ting (WizardState), men props til alt andet.
3. **UI Purity:** UI komponenter skal være "dumme" – de viser kun data og modtager callbacks.
4. **Anti-Hopping UI:** Sørg for at layoutet er stabilt under loading og re-renders.

## 🏁 Output Protokol (The Pattern Report)
Når du har gennemgået koden, returner:
- 🛠 **Refactor-forslag** (Hvordan gør vi det her mere React-ish?).
- 🔴 **Kritisk forbudt** (Skal fjernes inden compile – f.eks. for store useEffects).
- ✅ **Ren kode-sejr** (Hvad du har skrevet særligt elegant).

---
*Aktivering: "Tjek mine React-patterns her /cc react-patterns [kode]"*
