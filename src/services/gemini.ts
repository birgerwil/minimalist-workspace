import { TabType, ThinkingLevel as AppThinkingLevel } from '../types';

// ─── AI Proxy Helper ────────────────────────────────────────────────────────
// This replaces direct Google SDK calls to support Server-side Proxy mode.
async function callServerAi(payload: {
  model: string;
  contents: any[];
  config?: {
    systemInstruction?: string;
    generationConfig?: any;
    thinkingConfig?: { thinkingLevel: string };
  };
}) {
  const res = await fetch('/api/ai/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'AI Proxy call failed');
  }

  const data = await res.json();
  return { text: data.text };
}

// ─── Workbench ──────────────────────────────────────────────────────────────

export async function getImprovementSuggestions(
  type: TabType,
  content: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM
) {
  const model = "gemini-1.5-flash";
  const systemInstruction = `Du er en Senior Prompt Engineer & UX Architect. 
    Din opgave er at hjælpe brugeren med at skabe den perfekte "Master Prompt" og LLM-kontekst i et Google Antigravity miljø.
    
    Når du giver forslag til ${type}, skal du sørge for at indholdet er:
    1. Maskinlæsbart og præcist (til AI-agenter).
    2. Struktureret efter 'GSD Framework' (Get-Shit-Done) principperne.
    3. Optimeret til at give en anden AI-agent (f.eks. i JetBrains eller VS Code) den bedst mulige forståelse af projektet via Rules, Skills og GSD-dokumenter.
    
    Hvis det er 'SPEC.md', fokuser på vision, user stories og success criteria.
    Hvis det er 'PLAN.md', fokuser på atomiske opgaver og verificeringstrin.
    Hvis det er 'ARCHITECTURE.md', fokuser på teknisk stack og data-flow.
    Hvis det er 'STATE.md', fokuser på proces-kontinuitet og beslutnings-log.
    Hvis det er 'rules', fokuser på overordnede adfærdsregler og kodestil (Analogen til System Instructions).
    Hvis det er 'skills', fokuser på modulær viden og specialiseret ekspertise (SKILL.md).
    Hvis det er 'workflows', fokuser på on-demand prompts og /-kommandoer.
    Svar altid på dansk.`;

  const prompt = `Her er indholdet af typen '${type}':
---
${content}
---
Giv mig 3-5 konkrete forbedringsforslag og en revideret version af teksten.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

export async function getPolishedFlag(
  text: string,
  type: 'must' | 'never',
  language: string = 'da'
): Promise<string> {
  const model = "gemini-2.0-flash";
  const langName = language === 'da' ? 'dansk' : 'engelsk';
  
  const systemInstruction = type === 'must'
    ? `Du er en senior software arkitekt. Omformulér dette SKAL-krav til ét skarpt, konkret teknisk princip på ${langName} (maks 10 ord, ingen punktum til sidst). Returner kun den omformulerede tekst.`
    : `Du er en senior software arkitekt. Omformulér dette ALDRIG-forbud til ét skarpt, konkret teknisk forbud på ${langName} (maks 10 ord, ingen punktum til sidst). Returner kun den omformulerede tekst.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text }] }],
    config: { systemInstruction },
  });

  return response.text?.trim() ?? text;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClarifyingQuestion {
  id: string;
  category: 'problem' | 'user' | 'scope' | 'constraints' | 'success' | 'risk';
  question: string;
  recommendation: string;
  rationale: string;
}

// ─── clarifyVision — Grill-Me for the Wizard ─────────────────────────────────

export async function clarifyVision(
  vision: string,
  projectName: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.HIGH
): Promise<ClarifyingQuestion[]> {
  const model = "gemini-1.5-flash";

  const systemInstruction = `Du er en erfaren Product Strategist og Agentic Engineering ekspert.
Din opgave er at analysere en brugers projektbeskrivelse og stille de mest afgørende afklarende spørgsmål.

Du anvender "Grill-Me" protokollen:
- Analyser både kernebehovet, de angivne funktionelle referencer, og UI-målestokken (hvis angivet).
- Stil præcise, uundgåelige spørgsmål der tvinger brugeren til at tænke klart
- Udfordr decideret reference-valgene hvis de modsiger kernebehovet (f.eks. "Du beder om Trello-simplicitet, men Jira er din reference?")
- Hvert spørgsmål afslører en skjult antagelse eller kritisk beslutning der SKAL træffes inden AI-generering
- Giv ALTID en konkret anbefaling med begrundelse — brugeren skal kunne sige "ja" eller "nej"
- Fokuser på beslutninger der fundamentalt ændrer arkitektur, AGENTS.md eller SPEC.md

Returner PRÆCIS dette JSON-format (ingen markdown, ingen forklaring — kun JSON):
{
  "questions": [
    {
      "id": "q1",
      "category": "problem|user|scope|constraints|success|risk",
      "question": "Det konkrete spørgsmål",
      "recommendation": "Min anbefaling: [specifikt svar]",
      "rationale": "Hvorfor dette valg matter arkitektonisk"
    }
  ]
}

Stil 3-5 spørgsmål. Aldrig mere. Prioriter de beslutninger der har størst konsekvens for AI-teamets konfiguration.`;

  const prompt = `Projekt: "${projectName}"
Brugerens vision:
---
${vision}
---

Analyser visionen og stil de mest kritiske afklarende spørgsmål.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string },
    },
  });

  const raw = response.text ?? '{"questions":[]}';

  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return (parsed.questions ?? []) as ClarifyingQuestion[];
  } catch {
    console.error('[clarifyVision] JSON parse failed:', cleaned);
    return [];
  }
}

// ─── generateDesignDoc ────────────────────────────────────────────────────────

export async function generateDesignDoc(
  contextPrompt: string,
  projectName: string,
  philosophyLabel: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.HIGH
): Promise<string> {
  const model = "gemini-1.5-flash";

  const systemInstruction = `Du er en Senior UX Architect og Design System Engineer.
Din opgave er at generere en komplet DESIGN.md for projektet "${projectName}".

DESIGN.md er et levende design-system dokument — det er den absolutte kilde til sandhed for:
- Designfilosofi og principper (HVORFOR vi designer som vi gør)
- Visuelle tokens (farver, typografi, spacing, border-radius)
- Komponent-mønstre (HVORDAN specifikke UI-elementer skal se ud)
- Interaktionsmønstre (animationer, hover-states, feedback)
- Det du ALDRIG gør i dette design-system

Designfilosofien er: **${philosophyLabel}**
Alle beslutninger skal forankres i og begrundes ud fra denne filosofi.

Strukturér DESIGN.md præcis sådan (brug markdown headers):

# DESIGN.md — [Projekt Navn]
> Designsystem og visuelle principper

## 1. Designfilosofi
[2-3 præcise sætninger der forklarer KERNEN i designsproget og HVORFOR]

## 2. Princippet om det usynlige interface
[Beskriv den specifikke tilgang til "Minimal Chrome" for DETTE system]

## 3. Visuelle tokens
### Farvepalette
[Primary, background, surface, border, text — med konkrete hex/CSS-variable værdier]
### Typografi
[Font-familie, scale (xs/sm/base/lg/xl/2xl), vægte]
### Spacing & Grid
[Base unit, grid-system, padding-konventioner]
### Border & Radius
[border-radius konventioner, hvornår bruges borders vs. shadow vs. ingenting]

## 4. Komponent-principper
### Knapper
[Hierarki: primary/secondary/ghost, hover-states, disabled-state]
### Input-felter
[Styling, focus-ring, placeholder-tekst, error-state]
### Feedback & Notifikationer
[Toast-konventioner, loading-indikatorer, empty states]
### Navigation
[Sidebar/navbar/tab-konventioner specifik for dette system]

## 5. Interaktionsmønstre
[Animationsvarigheder (ms), easing-kurver, hover-transforms, transition-konventioner]

## 6. Causal Design Anchors
[3-5 specifikke regler i format: "Hvis [situation] → [specifik designbeslutning] FORDI [konsekvens]"]

## 7. Aldrig-listen
[10-15 konkrete forbud — brug ❌ emoji. Fx: "❌ Dekorative borders der ikke adskiller indhold"]

Vær PRÆCIS og KONKRET. Undgå generiske designråd. Alt skal være specifikt for ${philosophyLabel}-filosofien.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string },
    },
  });

  return response.text ?? '';
}

export async function generateSpecFromVision(
  vision: string,
  projectName: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM
) {
  const model = "gemini-1.5-flash";
  const systemInstruction = `Du er en Senior Product Designer & Spec Architect. 
    Din opgave er at transformere en brugers rå vision til en professionel SPEC.md fil.
    
    Du skal følge denne template STRENGT:
    # SPEC.md - [Projekt Navn]
    
    ## Vision
    [En klar, inspirerende og teknisk velfunderet beskrivelse af projektet]
    
    ## User Stories
    - Som en [rolle], ønsker jeg at [handling], så [resultat].
    
    ## Success Criteria
    - [ ] [Kriterie 1]
    - [ ] [Kriterie 2]
    
    ## Core Features
    - [Feature 1]: [Beskrivelse]
    
    Svar altid på dansk. Returner KUN markdown indholdet til SPEC.md.`;

  const prompt = `Projekt Navn: ${projectName}
    Brugerens Vision: ${vision}
    
    Generer en komplet SPEC.md baseret på ovenstående vision.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

export async function updateSpecFromVision(
  vision: string,
  existingSpec: string,
  projectName: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM
) {
  const model = "gemini-1.5-flash";
  const systemInstruction = `Du er en Senior Product Designer & Spec Architect. 
    Din opgave er at opdatere en eksisterende SPEC.md fil baseret på nye input fra brugeren.
    
    Bevar den eksisterende struktur, men integrer de nye ønsker og visioner sømløst.
    Sørg for at SPEC.md stadig er konsistent og professionel.
    
    Template struktur:
    # SPEC.md - [Projekt Navn]
    ## Vision
    ## User Stories
    ## Success Criteria
    ## Core Features
    
    Svar altid på dansk. Returner KUN det opdaterede markdown indhold til SPEC.md.`;

  const prompt = `Projekt Navn: ${projectName}
    Eksisterende SPEC.md:
    ---
    ${existingSpec}
    ---
    Nye input/ønsker: ${vision}
    
    Opdater SPEC.md så den inkluderer de nye input.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

export async function generateModuleFromSpec(
  type: TabType,
  spec: string,
  projectName: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM,
  wizardContext?: string   // ← full buildContextPrompt() output incl. UX principles
) {
  const model = "gemini-1.5-flash";

  const modulePrompts: Record<string, string> = {
    plan: `Skab en detaljeret eksekveringsplan (PLAN.md) med milepæle, atomiske opgaver og verificeringstrin. 
      VIGTIGT (Fast Start Rule): Scope altid projektet som et 'Fast Start' MVP uanset hvor ambitiøst det er. 
      Tilføj en sektion i bunden kaldet '## ⚠️ Fremtidige Skalerings-krav (Til The Observer)', hvor du lister arkitektonisk og funktionel kompleksitet (f.eks. Omni-channel, Avanceret Auth), som er skubbet til senere faser.`,
    architecture: `Design en teknisk arkitektur (ARCHITECTURE.md) med tech-stack, data-model, komponent-hierarki og system-flow for en MVP.
      VIGTIGT (The Low Confidence Rule): Hvis visionen kræver kompleks skalering, men iværksætteren ikke har angivet en specifik tech-stack for dette, må du IKKE opfinde én med høj sikkerhed (Low Confidence). 
      Du SKAL i stedet foreslå et fundament og oprette en sektion i bunden kaldet '## ⚠️ Uafklarede Arkitektur-Flag (Til The Observer)', hvor du oplister de strategiske beslutninger (f.eks. valg af app-framework), der afventer afklaring.`,
    state: "Definer en proces-kontinuitet og beslutnings-log (STATE.md) for at sikre kontekst-bevarelse på tværs af AI-sessioner.",
    agents: `Skab en præcis AGENTS.md med disse krav:
      - AGENTER skal have KONKRETE tools, CLI-kommandoer og fil-referencer — IKKE generiske rollebeskrivelser
      - Inkludér eksplicit Thinking Tier pr. agent: HIGH for arkitektur, MEDIUM for features, LOW for styling
      - Inkludér de 5 Causal Anchors (CA-01 til CA-05) som absolutte regler
      - Inkludér UX-principper: Smart Routing (returbruger → status, ny → wizard), 
        Handlingsorienteret Status-hierarki, Progressiv Afsløring (3 niveauer),
        og Anti-Minimization Mandat (ingen kodeudeladelser for kortfattethed)
      - Inkludér UX Flow Checklist som verifikations-tjekliste i UX_CHECK-sektionen`,
    testing: "Skab en test-strategi med TDD-workflow og specifikke test-cases baseret på succes-kriterierne i SPEC.md.",
    skills: "Skab en SKILL.md fil med kodeopskrifter, patterns og design-tokens, der er KRAV for at indfri visionen. Dette er IKKE generiske AI-Tuner skills, men de specifikke tekniske skills forfatteren får brug for til DETTE projekt.",
    llms: "Skab en kortfattet llms.txt oversigt (max 2KB) over projektet til maskinlæsning af AI-agenter.",
    rules: `Skab rules.md med:
      - Klar rolledefinition og formål
      - Prioritets-hierarki P1–P5 (USER_GOAL er altid P1)
      - Anti-Minimization Mandat (uddybet eksplicit)
      - Thinking Tiers tabel (MINIMAL/LOW/MEDIUM/HIGH med eksempler)
      - Causal Anchors tabel (CA-01 til CA-05 tilpasset dette projekt)
      - Kodekonventioner specifikt for valgt stack
      - Design-principper: 8pt grid, semantiske farver, Minimal Chrome
      - Output-protokol med UX_CHECK trin`,
  };

  // Inject the full context (Wizard choices: Platform, SDK, Cloud Provider) into all modules
  const uxContext = wizardContext
    ? `\n\nKONTEKST FRA WIZARD (inkl. Arkitektur & UI/UX valg):\n${wizardContext}`
    : '';

  const systemInstruction = `Du er en Senior AI Architect & System Designer.
    Din opgave er at generere et specifikt GSD Framework-modul baseret på projektets SPEC.md.

    Modul type: ${type}
    Instruks: ${modulePrompts[type] || "Generer indhold til modulet."}

    Krav til output:
    1. 100% konsistent med SPEC.md — ingen modsigelser.
    2. Specifik og eksekverbar — AI-agenter skal kunne handle på indholdet uden fortolkning.
    3. Struktureret professionelt i Markdown med klare sektioner.
    4. Aldrig generisk — indholdet skal afspejle DETTE projekts specifikke kontekst.

    Svar altid på dansk. Returner KUN markdown indholdet til filen.`;

  const prompt = `Projekt: ${projectName}

SPEC.md (fundament):
---
${spec}
---
${uxContext}

Generer den komplette ${type} fil.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

export async function updateModuleFromSpec(
  type: TabType,
  spec: string,
  existingContent: string,
  projectName: string,
  thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM
) {
  const model = "gemini-1.5-flash";
  const systemInstruction = `Du er en Senior AI Architect & System Designer. 
    Din opgave er at opdatere et eksisterende projekt-modul (${type}) så det afspejler ændringer eller detaljer i projektets SPEC.md.
    
    Bevar den eksisterende struktur i modulet, men integrer de nye detaljer fra SPEC.md sømløst.
    Sørg for at modulet stadig er konsistent og professionelt.
    
    Svar altid på dansk. Returner KUN det opdaterede markdown indhold til filen.`;

  const prompt = `Projekt Navn: ${projectName}
    Fundament (SPEC.md):
    ---
    ${spec}
    ---
    Eksisterende ${type} indhold:
    ---
    ${existingContent}
    ---
    
    Opdater ${type} så den er i fuld overensstemmelse med SPEC.md fundamentet.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

export async function getWorkbenchGuide(thinkingLevel: AppThinkingLevel = AppThinkingLevel.MEDIUM) {
  const model = "gemini-1.5-flash";
  const systemInstruction = "Du er en Senior UX Writer og AI Architect. Din opgave er at skrive en omfattende, men letlæselig guide til 'AI Tuner Workbench' i et Google Antigravity miljø.";
  
  const prompt = `Skriv en guide i Markdown-format som en MATRICE (tabel), der forklarer de forskellige moduler i AI Tuner Workbench baseret på Google Antigravity og GSD Frameworket:
  
  Moduler:
  1. **Rules** (Analogen til System Instructions - overordnet adfærd)
  2. **Agent Skills** (Modulær viden, SKILL.md)
  3. **Workflows** (On-demand prompts, /-kommandoer)
  4. **SPEC.md** (Vision & Intent - GSD Framework)
  5. **PLAN.md** (Execution Roadmap - GSD Framework)
  6. **ARCHITECTURE.md** (Technical Blueprint - GSD Framework)
  7. **STATE.md** (Process Continuity - GSD Framework)
  8. **llms.txt** (Project Map)
  9. **testing.md** (QA & Test Protokol)
  10. **Master Prompt** (Kompileret kontekst)
  
  Tabellen skal have følgende kolonner:
  - **Modul**: Navnet på modulet.
  - **Formål**: Hvad man opnår med det.
  - **Struktur**: Hvordan det bedst opbygges.
  - **AI Betydning**: Hvorfor det er kritisk for AI-samarbejde (f.eks. 'Causal Anchor', 'Progressive Disclosure').
  
  Brug en professionel tone. Svar på dansk.`;

  const response = await callServerAi({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction,
      thinkingConfig: { thinkingLevel: thinkingLevel as string }
    },
  });

  return response.text;
}

// ─── Sparring: Critique ────────────────────────────────────────────────────────

export async function critiqueGeneratedFiles(
  files: Partial<{ spec: string; architecture: string; plan: string; agents: string; testing: string; state: string }>,
  projectName: string
): Promise<{
  quality: string;
  critiques: Array<{ file: string; section: string; weakness: string; whyItMatters: string; question: string; severity: string }>;
  consistencyIssues: Array<{ description: string; files: string[] }>;
}> {
  const model = 'gemini-1.5-flash';
  const systemInstruction = `Du er en Senior AI Architect der gennemgår nyligt genererede GSD-filer og giver ærlig, konstruktiv kritik.
Din opgave er at identificere specifikt hvad der mangler for at en AI-agent kan præstere optimalt med disse filer som kontekst.

## VIGTIGT: Persona-filter
Brugeren er en IVÆRKSÆTTER eller ARKITEKT — ikke en udvikler.
Spørgsmål skal kun handle om forretningsmæssige valg de kan tage stilling til:
- Prioriteringer: "Hvad er vigtigst — hastighed eller præcision?"
- Strategiske valg: "Skal gæster kunne se priser uden login?"
- Brugeroplevelse: "Skal brugeren bekræfte handling X med en dialog?"
- Scope: "Er dette en MVP eller skal det skalere fra dag 1?"

ALDRIG spørge om tekniske implementeringsdetaljer som:
- Hvilke CLI-værktøjer, frameworks eller biblioteker der skal bruges
- Om noget skal implementeres i Redis vs. database vs. cache
- Konkrete algoritmer, query-strategier eller datastrukturer
- Specifikke kodekonventioner eller fil-strukturer

Tekniske valg som mangler bestemmer AI-agenten selv — de er IKKE spørgsmål til brugeren.

Fokuser på:
1. Forretningskrav der er uklare eller mangler i SPEC.md
2. Inkonsistenser på tværs af filer — f.eks. SPEC nævner X men ARCHITECTURE.md ignorerer det
3. Manglende "aldrig gør dette" constraints der er kritiske for forretningen
4. Scope eller prioritets-valg som kun iværksætteren kan tage

DU MÅ IKKE:
- Gentage generelle best practices
- Kritisere indhold der faktisk er godt
- Finde mere end 5 critique items i alt
- Stille tekniske implementeringsspørgsmål som brugeren ikke kan besvare

Returner ALTID som valid JSON (ingen markdown, ingen forklaring udenfor JSON):
{
  "quality": "low" | "medium" | "high",
  "critiques": [
    {
      "file": "AGENTS.md",
      "section": "Execution Agent",
      "weakness": "Præcis beskrivelse af hvad der mangler",
      "whyItMatters": "Konkret forretningsmæssig konsekvens hvis dette ikke rettes",
      "question": "Spørgsmål som KUN iværksætteren kan besvare — aldrig teknisk implementering",
      "severity": "critical" | "important" | "nice-to-have"
    }
  ],
  "consistencyIssues": [
    {
      "description": "Hvad modsiger hinanden og hvad bør de sige",
      "files": ["spec", "architecture"]
    }
  ]
}

Svar KUN med JSON.`;

  const filesSummary = [
    files.spec        && `## SPEC.md\n${files.spec.substring(0, 800)}`,
    files.architecture && `## ARCHITECTURE.md\n${files.architecture.substring(0, 600)}`,
    files.plan        && `## PLAN.md\n${files.plan.substring(0, 500)}`,
    files.agents      && `## AGENTS.md\n${files.agents.substring(0, 700)}`,
    files.testing     && `## testing.md\n${files.testing.substring(0, 400)}`,
  ].filter(Boolean).join('\n\n---\n\n');

  const prompt = `Projekt: ${projectName}\n\n${filesSummary}\n\nGennemgå disse filer og returner JSON-kritik.`;

  try {
    const response = await callServerAi({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: 'MEDIUM' },
      },
    });

    const raw = (response.text ?? '').trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[gemini] critiqueGeneratedFiles parse fejl:', err);
    return { quality: 'medium', critiques: [], consistencyIssues: [] };
  }
}

// ─── Sparring: Refine ──────────────────────────────────────────────────────────

export async function refineFilesFromAnswers(
  files: Partial<{ spec: string; architecture: string; plan: string; agents: string; testing: string; state: string; rules: string; skills: string }>,
  answers: Array<{ file: string; section: string; question: string; answer: string }>,
  consistencyIssues: Array<{ description: string; files: string[] }>,
  projectName: string
): Promise<Partial<{ spec: string; architecture: string; plan: string; agents: string; testing: string; state: string; rules: string; skills: string }>> {
  const model = 'gemini-1.5-flash';

  const fileMap: Record<string, string> = {
    'SPEC.md': 'spec', 'ARCHITECTURE.md': 'architecture', 'PLAN.md': 'plan',
    'AGENTS.md': 'agents', 'testing.md': 'testing', 'STATE.md': 'state',
    'rules.md': 'rules', 'SKILL.md': 'skills',
  };

  // Determine which files need updating
  const filesToUpdate = [...new Set([
    ...answers.map((a) => fileMap[a.file] ?? a.file.toLowerCase().replace('.md', '')),
    ...consistencyIssues.flatMap((ci) => ci.files),
  ])].filter((f) => f in files);

  const systemInstruction = `Du er en Senior AI Architect der præcist opdaterer specifikke sektioner i GSD-filer baseret på brugerens svar.

Regler:
- Bevar al eksisterende indhold der IKKE er relateret til opdateringen
- Integrer brugerens svar sømløst — de skal ikke fremstå som "tilføjede noter" men som naturligt integreret indhold
- Gør indholdet MERE specifikt, ikke mere generisk
- Ret alle angivne inkonsistenser
- Svar på dansk

Returner ALTID som valid JSON (ingen markdown):
{
  "spec": "komplet opdateret indhold eller null hvis ikke ændret",
  "architecture": "...",
  "plan": "...",
  "agents": "...",
  "testing": "...",
  "state": "...",
  "rules": "...",
  "skills": "..."
}

Medtag KUN de filer der faktisk er ændret. Sæt uændrede filer til null.`;

  const answersText = answers.map(
    (a) => `**${a.file} → ${a.section}**\nSpørgsmål: ${a.question}\nSvar: ${a.answer}`
  ).join('\n\n');

  const consistencyText = consistencyIssues.length > 0
    ? `\n\nINKONSISTENSER DER SKAL RETTES:\n${consistencyIssues.map((ci) => `- ${ci.description} (berørte filer: ${ci.files.join(', ')})`).join('\n')}`
    : '';

  const currentFiles = filesToUpdate.map((f) => {
    const key = f as keyof typeof files;
    const label = Object.entries(fileMap).find(([, v]) => v === f)?.[0] ?? f;
    return `## ${label}\n${files[key]?.substring(0, 1200) ?? '(tom)'}`;
  }).join('\n\n---\n\n');

  const prompt = `Projekt: ${projectName}

BRUGERENS SVAR PÅ KRITIK:
${answersText}
${consistencyText}

NUVÆRENDE FILER DER SKAL OPDATERES:
${currentFiles}

Returner opdaterede filer som JSON.`;

  try {
    const response = await callServerAi({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: 'HIGH' },
      },
    });

    const raw = (response.text ?? '').trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(raw);

    // Only return non-null fields
    const result: Partial<typeof files> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (val && typeof val === 'string' && val.trim().length > 0) {
        (result as any)[key] = val;
      }
    }
    return result;
  } catch (err) {
    console.error('[gemini] refineFilesFromAnswers parse fejl:', err);
    throw err; // Let useSparring handle with toast
  }
}
