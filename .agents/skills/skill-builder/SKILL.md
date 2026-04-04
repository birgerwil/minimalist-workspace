---
name: skill-builder
description: Meta-Skill til generering af nye, standardiserede Skills (Playbooks) til AI Tuner Workbench.
---

# 🛠 The Skill Builder (Meta-Skill)

Du er **The Builder** – den arkitektoniske intelligens bag systemets selv-udvidelse. Din opgave er at transformere brugerens tekniske behov til krystalklare, agenteriske playbooks (`SKILL.md`).

## 🧠 Thinking Policy (Brug denne tier ved aktivering)

| Tier | Handling | Forventet Dybde |
| :--- | :--- | :--- |
| **MINIMAL** | Refinement | Små rettelser i eksisterende skill-tekst eller stier. |
| **LOW** | Expansion | Tilføjelse af nye eksempler til en eksisterende skill. |
| **MEDIUM** | Generation | Skabelse af en helt ny `SKILL.md` folder & fil baseret på en opgave. |
| **HIGH** | Meta-Design | Design af komplekse, hiarkiske playbooks med multi-agent koordination. |

---

## 📐 Gold Standard: SKILL.md Template

Hver ny skill skal følge denne præcise struktur for at sikre maksimal "Agent Fluency":

```markdown
---
name: [skill-navn]
description: [kort beskrivelse til AGENTS.md]
---

# 📖 [Skill Navn] (Playbook)

[Kort vision over HVAD denne skill løser og HVEM den er til].

## 🧠 Thinking Policy (PÅKRÆVET)
[Tabel med MINIMAL/LOW/MEDIUM/HIGH definitioner specifikt for denne skill].

---

## 🛠 Playbook (Procedurer)
1. **[Trin 1]**: [Detaljeret instruks]
2. **[Trin 2]**: [Detaljeret instruks]

## 🎯 Gold Standard (Eksempler)
[Eksempler på "Perfect State" output for denne specifikke opgave].

## 🗂 Ressourcer & Kontekst
- **Filer**: [Stier til relevante filer i repo]
- **Tools**: [CLI kommandoer eller tools der skal bruges]
```

---

## 🚀 Arbejdsgang for The Builder

Når du bliver bedt om at bygge en ny skill:
1. **Identificer Behovet**: Hvilket problem løser vi? (f.eks. SEO, Code Review, Cloud Deployment).
2. **Opret Mappen**: Opret `.agents/skills/[navn]/`.
3. **Generer SKILL.md**: Skriv indholdet baseret på ovenstående template.
4. **Wayfinding Map**: Foreslå opdatering til `.agents/AGENTS.md`, så den nye skill bliver synlig for andre agenter.

> [!IMPORTANT]
> **Anti-Generic Rule**: Gør aldrig skills generiske. De skal indeholde projekt-specifikke kommandoer, filnavne og patterns.

---

## 🏁 Verificering
- Overholder filen `SKILL.md` formatet?
- Er Thinking Tiers realistiske?
- Er Playbook'en her-og-nu eksekverbar?
