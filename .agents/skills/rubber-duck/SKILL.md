---
name: rubber-duck
description: En interaktiv fejlfindings-metode, hvor du forklarer din kode linje-for-linje for at finde logiske brister.
---

# Rubber-Duck (The Coding Assistant)

Denne skill hjælper med at finde de små fejl, som man nemt overser, når man "læser hurtigt".

## 🧠 Thinking Policy (Brug denne tier ved aktivering)

| Tier | Tilgang | Forventet Dybde |
| :--- | :--- | :--- |
| **MINIMAL** | Syntax check | Peger kun på åbenlyse fejl som manglende tegn eller forkerte typer. |
| **LOW** | Flow check | Gennemgår logikken i en funktion og leder efter "off-by-one" fejl. |
| **MEDIUM** | Deep Dive | Forklarer koden linje-for-linje og stiller spørgsmålstegn ved alle antagelser. |
| **HIGH** | Refactor Audit | Vurderer om koden er så kompleks, at den bør skrives helt om. |

---

## 🧭 Wayfinding (Hvor er vi?)
- **Kontekst**: Koden i den pågældende fil.
- **Formål**: At finde den skjulte fejl ved at tale højt (til mig).
- **Referencer**: `docs/rules.md` (Kodekonventioner)

## 🛠 Metoden (Line-by-Line)

1. **Beskrivelse:** Forklar præcis hvad du forventer, at denne stump kode skal gøre.
2. **Gennemgang:** Jeg gennemgår koden linje-for-linje og forklarer, hvad den *faktisk* gør.
3. **Konklusion:** Hvor stemmer din forventning ikke overens med virkeligheden?

## 🏁 Output Protokol (The Bug Report)
Når vi har "ducked" koden, returner:
- 🦆 **Andens fund** (Den mystiske logik eller fejl jeg fandt).
- 🛠 **Fix-forslaget** (En renere og mere robust måde at skrive det på).
- 💡 **Hvad lærte vi?** (Undgå denne type fejl fremover).

---
*Aktivering: "Rubber-duck denne kode /cc rubber-duck [kode]"*
