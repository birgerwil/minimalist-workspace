# testing.md - QA & Test Protokol (AI Tuner Workbench)

## Overordnet Strategi
(Dette definerer *vores* test-metode til AI Tuner systemet, og kopieres til forfatteren igennem Master Prompt).

1. **Test-Driven Development (TDD) Som Fundament**
   Før nogen produktionskode skrives, skrives der en asynkron suite (f.eks. Vitest) som beskriver specifikationen. Først når vi ser en rød test, skrives de nødvendige abstraktioner.

2. **Causal Anchors og Board Invariants (`boardInvariants.test.ts`)**
   Alt hvad C-Suite beslutter ift. compliance (f.eks. `AboutView.tsx` og de 5 medlemmer QA, PO, Arkitekt, COO, CDO) *skal* testes via assertion for DOM eller fil-tilstedeværelse automatisk.
   Vi bruger `happy-dom` til unit-ui tests (Hurtigt, ingen e2e dependencies).

3. **Backend / API Mocking**
   Endpoints som the `POST /api/agents/skills` og opslaget af `grill-me` m.v. bliver mocket i tests, fordi fil-system interaktion i vores Node-backend ikke må ødelægge the host environment. (Opdateret via CA-09).
