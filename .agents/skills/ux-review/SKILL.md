---
name: ux-review
description: Kvalitetstjek af brugeroplevelsen baseret på "Minimal Chrome", "Minimalistisk Sejr" og boardets 5 spørgsmål.
---

# UX Review Playbook

Denne skill bruges til at validere UI/UX mod projektets kerneværdier: **Minimal Chrome**, **High Fluency** og **Action-Oriented Status**.

## 🧠 Thinking Policy (Brug denne tier ved aktivering)

| Tier | Opgave Type | Forventet Dybde |
| :--- | :--- | :--- |
| **MINIMAL** | Farve/tekst tjek | Hurtig validering af design-tokens (`text-sm`, farvekontrast). |
| **LOW** | Layout tweaks | Justering af padding/margins (8pt grid) og simpel alignment. |
| **MEDIUM** | Feature Review | Fuld gennemgang af en funktions flow og overholdelse af UX-spørgsmål. |
| **HIGH** | Vision Audit | Arkitektonisk vurdering af om en feature overhovedet skal eksistere (Minimalistisk Sejr). |

---

## 🧭 Wayfinding (Hvor er vi?)
- **UI Kit**: `src/components/ui/`
- **Design Tokens**: `src/index.css`
- **Referencer**: `docs/rules.md` (UX-principper)

## 🛠 Boardets 5 UX Spørgsmål (The Checklist)

1. **Information Density (Signal-til-Støj):** Er der unødvendige labels, borders eller ikoner? Sigt efter "No Chrome".
2. **Action-Orientation:** Er det vigtigste element det mest synlige? Kan man gætte næste skridt uden at læse?
3. **8pt Grid Consistency:** Bruger vi præcise `p-2`, `m-4` osv? Ingen ad-hoc pixels.
4. **Smart/Loaded Context Routing:** Undgår vi hopping/layout shifts under loading? Bruger vi progressive disclosure?
5. **Keyboard Access & Visual:** Er alt tilgængeligt og læsbart (`text-sm` minimum)?

## 🏁 Output Protokol (The Fluency Score)
Når du har gennemgået koden/skærmbilledet, returner:
- 🔴 **Kritisk forbudt** (Skal fjernes inden compile).
- 🟡 **Friktion** (Gør ondt på brugeren; overflødig navigation/borders).
- ✅ **Minimalistisk Sejr** (Hvad du har skåret væk med succes).

**Hver review afsluttes med en 1-10 Fluency Score.**

---
*Aktivering: "Kør et UX-Review på dette /cc ux-review [kode/screenshot]"*
