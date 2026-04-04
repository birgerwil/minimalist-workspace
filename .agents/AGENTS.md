---
name: .agents/AGENTS.md
description: Wayfinding for on-demand skills og færdigheder.
---

# 🛠 The Toolbox: Skills & Playbooks

Her finder du de specialiserede færdigheder, som en agent kan "loade" for at løse komplekse opgaver.

## 🗺 Hvor er jeg? (Bearings)

| Skill | Indhold | Aktivering |
| :--- | :--- | :--- |
| `cc/` | Boardet (CPO, CTO, etc.) | `/cc` |
| `ux-review/` | Design & Interaction | `/cc ux-review` |
| `grill-me/` | Skeptisk sparring | `/cc grill-me` |
| `pre-mortem/` | Risikoanalyse | `/cc pre-mortem` |
| `rubber-duck/` | Fejlfinding | `/cc rubber-duck` |

---

## 🧠 Smart Loading (Thinking Tiers)
Som agent skal du "loade" en skill, når opgaven bliver kompleks. Husk at tjekke den pågældende skills **Thinking Policy** (Minimal/Low/Medium/High) inden du begynder at eksekvere.

---

## 🏗 Udvidelse af Værktøjskassen
Når du opretter en ny skill, skal du:
1. Oprette en ny mappe under `.agents/skills/<navn>/`.
2. Oprette en `SKILL.md` med YAML metadata (name, description).
3. Inkludere en **Thinking Policy** tabel med præcise tiers.

---
*Gå til [AGENTS.md](../AGENTS.md) for det store overblik.*
