---
name: pre-mortem
description: En fremsynet risikoanalyse-metode, der simulerer et totalt projekt-krak om 6 måneder for at forudsige de faktiske risici i dag.
---

# Pre-Mortem (The Project Autopsy)

Denne skill bruges til at finde de blinde vinkler i et projekt, før vi overhovedet skriver den første linje kode.

## 🧠 Thinking Policy (Brug denne tier ved aktivering)

| Tier | Tilgang | Forventet Dybde |
| :--- | :--- | :--- |
| **MINIMAL** | Red flagging | Peger på det mest åbenlyse problem i en idé. |
| **LOW** | Reality check | Udfordrer realismen i et specifikt feature-ønske. |
| **MEDIUM** | Pre-Mortem | Simulerer at projektet er fejlet om 6 måneder – hvorfor skete det? |
| **HIGH** | Vision Audit | Nedbryder hele projektets "WHY". Kan vi løse det her med et Google Sheet? |

---

## 🧭 Wayfinding (Hvor er vi?)
- **Fundament**: `SPEC.md`
- **Tidsramme**: 1-6 måneder frem (Fiktivt).
- **Referencer**: `docs/rules.md` (P1 Priority: USER_GOAL)

## 🛠 Metoden (The Fatal Flaw)

1. **Simulering:** Forestil dig at projektet i dag er en total fiasko. Alt er gået galt.
2. **Obduktion:** Hvad dræbte det? Var det dårlig UX, forkert teknisk stack, eller manglede bruger-behovet?
3. **Forebyggelse:** Hvilke 3 ting skal vi ændre i vores nuværende plan for at undgå denne skæbne?

## 🏁 Output Protokol (The Fatal Flaw Report)
Når du har obduceret idéen, returner:
- 💀 **Dødsårsagen** (Hvad var den ene kritiske fejl?).
- 🛡 **Modgift** (Hvad skal vi ændre i dag for at beskytte os?).
- 💡 **Den ærlige dom** (Er risikoen for høj ift. gevinsten?).

---
*Aktivering: "Kør en Pre-Mortem på /cc pre-mortem [projekt/fil]"*
