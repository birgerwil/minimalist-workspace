# SKILL.md - AI Tuner Workbench

> Skills er navngivne, kaldbare opskrifter. Hver skill har et klart input, en klar output og
> trin-for-trin instruktioner. En AI-agent skal kunne eksekvere en skill fra bunden ved at læse den.

---

## Skill: add-new-tab

**Formål:** Tilføj et nyt dokumentationsmodul (tab) til Workbench-editoren.
**Input:** Tabens ID (streng), visningsnavn, tilhørende filnavn på disk, felt i `InstructionSet`.
**Output:** Ny tab synlig i editor med fuld læse/skrive/diff/sync support.

### Trin

**1. `src/types.ts` — Tilføj felt til `InstructionSet`**
```typescript
export interface InstructionSet {
  // ... eksisterende felter
  myNewField: string;  // ← Tilføj
}
```

**2. `src/tabConfig.ts` — Registrér tab i alle maps**
```typescript
export const TAB_TO_FIELD: Record<string, keyof InstructionSet> = {
  // ... eksisterende
  'my-tab': 'myNewField',  // ← Tilføj
};

export const TAB_LABEL: Record<string, string> = {
  'my-tab': 'MyDoc.md',    // ← Tilføj (vises i tab-strip)
};

export const TAB_TO_FILENAME: Record<string, string> = {
  'my-tab': 'MyDoc.md',    // ← Tilføj (filnavn på disk i /docs/)
};
```

**3. `src/components/WorkbenchEditor.tsx` — Tilføj til WORKBENCH_TABS konstant**
```typescript
const WORKBENCH_TABS: string[] = [
  'rules', 'skills', ..., 'my-tab',  // ← Tilføj
];
```

**4. `src/hooks/useDiskSync.ts` — Registrér fil til disk-sync**
```typescript
const files = [
  // ... eksisterende
  { tab: 'my-tab', name: 'MyDoc.md' },  // ← Tilføj
];
```

**5. `src/hooks/useVersions.ts` — Opdatér `pushToDisk` og `compileMasterPrompt`**
```typescript
// I pushToDisk: tilføj feltet til disk-write
{ tab: 'my-tab', field: 'myNewField', filename: 'MyDoc.md' }

// I compileMasterPrompt: tilføj sektionen
`## MyDoc\n${version.myNewField || ''}\n\n`
```

**6. Verificering**
```bash
node -e "require('./node_modules/typescript/lib/tsc.js')"  # → 0 fejl
# Klik på den nye tab i UI → indhold læses og skrives korrekt
# Klik Gem → MyDoc.md opdateres i /docs/ mappen
# Tjek Diff-panelet → ny tab vises korrekt
```

---

## Skill: add-new-ai-operation

**Formål:** Tilføj en ny AI-genereret handling til en specifik tab.
**Input:** Handling-navn, aktiv tab, hvad AI'en skal generere, bruger-trigger (knap).
**Output:** Ny AI-knap i WorkbenchEditor der kalder Gemini og indsætter resultatet.

### Trin

**1. `src/services/gemini.ts` — Tilføj ny service-funktion**
```typescript
export async function myNewOperation(
  input: string,
  projectName: string,
  thinkingLevel: ThinkingConfigParamName = 'MEDIUM'
): Promise<string> {
  const client = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const prompt = `
    Du er en ekspert i [domæne]. Baseret på følgende input:
    ${input}
    Generér [beskrivelse af output] for projektet "${projectName}".
    Format: Markdown. Sprog: Dansk.
  `;
  const result = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: THINKING_LEVELS[thinkingLevel] } },
  });
  return result.text ?? '';
}
```

**2. `src/hooks/useAI.ts` — Tilføj handler**
```typescript
// I UseAIReturn interface:
handleMyNewOperation: () => Promise<void>;

// I useAI():
const handleMyNewOperation = async () => {
  if (!currentVersion || !selectedProject) return;
  setIsAiLoading(true);
  try {
    const result = await myNewOperation(
      getTabContent(currentVersion, activeTab),
      selectedProject.name,
      currentVersion.thinkingLevel
    );
    setCurrentVersion(prev => prev ? setTabContent(prev, activeTab, result) : null);
    setIsDirty(true);
    toast.success('Genereret!');
  } catch (err) {
    console.error('[useAI] myNewOperation fejlede:', err);
    toast.error('AI-generering fejlede.');
  } finally {
    setIsAiLoading(false);
  }
};
```

**3. `src/components/WorkbenchEditor.tsx` — Tilføj knap i relevant Composer**
```tsx
<button
  onClick={ai.handleMyNewOperation}
  disabled={ai.isAiLoading || !currentVersion?.spec}
  className="py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium..."
>
  <Sparkles size={14} className={cn(ai.isAiLoading && 'animate-pulse')} />
  Generér [Navn]
</button>
```

**4. Verificering**
```bash
node -e "require('./node_modules/typescript/lib/tsc.js')"  # → 0 fejl
# Klik knappen i UI → AI genererer og indsætter indhold
# Gem → Firestore opdateres, disk opdateres
```

---

## Skill: firebase-hook-pattern [⚠️ DEPRECATAED]

> **BEMÆRK:** Denne skill er under udfasning jf. Milestone 3 (Migration til Tauri v2 & Local-First). 
> Firebase real-time listeners erstattes af direkte disk-I/O og SQLite fremover.

**Formål:** Legacy standard-mønstret for React hooks der integrerer med Firebase.
**Input:** Hvilken Firestore-collection / Auth-event der skal observeres.
**Output:** En type-sikker hook med korrekt subscription, cleanup og error-håndtering.

### Kanonisk mønster

```typescript
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { MyType } from '../types';

export interface UseMyDataReturn {
  data: MyType[];
  isLoading: boolean;
  error: string | null;
}

export function useMyData(projectId: string | null): UseMyDataReturn {
  const [data, setData] = useState<MyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return; // ← Guard: altid tjek dependencies

    setIsLoading(true);

    // Observer: Firestore real-time subscription
    const q = query(
      collection(db, 'projects', projectId, 'myCollection'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MyType));
        setData(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMyData] Firestore fejl:', err);
        setError('Kunne ikke hente data.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // ← Cleanup altid
  }, [projectId]); // ← Dependency array: præcis hvad der trigger re-subscription

  return { data, isLoading, error };
}
```

**Regler:**
- Hvert `onSnapshot` call returnerer en `unsubscribe`-funktion — brug den altid i cleanup.
- Brug `setIsLoading(true)` FØR subscription og `setIsLoading(false)` i BEGGE success/error paths.
- Log fejl med `[HookNavn]` prefix: `console.error('[useMyData] Firestore fejl:', err)`.

---

## Skill: Design System & Visual Tokens

> **Komplet reference:** `docs/DESIGN.md` — Denne sektion er et hurtigt opslagsværk.
> Ved tvivl: DESIGN.md har forrang.

### Typografi
- **Font:** `Inter` (variabel font). Line-height: min. `1.4` — brødtekst `leading-relaxed` (1.625).
- **Scale (1.333x ratio):**

| Token | px | Tailwind | Brug |
|---|---|---|---|
| Micro | 12px | `text-xs` | Labels, uppercase metadata |
| Body small | 14px | `text-sm` | Brødtekst, knapper |
| Body | 16px | `text-base` | Editor-indhold |
| Section | 20px | `text-xl` | Sektion-overskrifter |
| Title | 24px | `text-2xl` | Side-titler |
| Display | 32px | `text-4xl` | Onboarding, login |

- **Overskrifter:** `font-light tracking-tight` — aldrig `font-bold` i UI-hierarki.
- **Labels:** `text-xs font-bold uppercase tracking-widest text-neutral-400`.

### Grid System — Strengt 8pt (ingen undtagelser)
```
8px  → p-2  (micro)      16px → p-4  (komponent)
24px → p-6  (sektion)    32px → p-8  (side-padding)
48px → p-12 (større)     64px → p-16 (display)
```

### Farvepalet — Semantisk Brug Kun
```
neutral-900   Primær tekst, handlinger
neutral-500   Sekundær tekst, hjælpetekst
neutral-300   Deaktiveret, placeholder
neutral-50    App-baggrund (light)
neutral-100   Hover-overlays
neutral-200   Subtile dividers
amber-400/500 Dirty State (ravgul pulsering)
red-500/600   Fejl, advarsler
green-500     Succes, completion
blue-600      Links
```
**Forbudt:** Dekorative farver, gradienter, farver uden semantisk rolle.

**Dark Mode:** Baggrund → `neutral-900`, containers → `neutral-800`. Aldrig ren sort — tones ned for at undgå øjentræthed.

### Minimal Chrome Dogme
- Ingen borders/shadows uden funktionelt formål
- White space (8pt grid) som eneste adskillelsesværktøj
- Ikoner: `lucide-react`, max 20px UI / 16px inline
- Hover-states afslører handlinger — ikke permanent synlige

### Interaktionsmønstre
- **Command Palette (Cmd+K):** Primært navigations- og handlingsknudepunkt. Fuzzy search.
- **Progressive Disclosure:** Niveau 1 (altid) → Niveau 2 (hover) → Niveau 3 (eksplicit åbn).
- **Tastatur-først:** 100% keyboard-navigation. Desktop-only. Ingen touch-targets.
- **Respons-budget:** < 100ms visuel feedback på lokale handlinger.

---

## Skill: Data Persistence Patterns

### Dirty State Detection
```typescript
// Sæt isDirty = true ved ENHVER brugermodifikation
onChange={(e) => {
  setCurrentVersion(prev => prev ? setTabContent(prev, activeTab, e.target.value) : null);
  setIsDirty(true);  // ← Altid!
}}
```

### Dirty State UI Indikator (ravgul pulsering)
```tsx
{isDirty && (
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Ugemte ændringer" />
)}
```

### Safety Gates (Ugemte ændringer ved projekt-skift)
```typescript
const handleProjectSwitch = (project: Project) => {
  if (isDirty) {
    showConfirm('Du har ugemte ændringer. Vil du skifte projekt?', () => {
      setIsDirty(false);
      setSelectedProject(project);
    });
    return;  // ← Blokér skift
  }
  setSelectedProject(project);
};
```

### Optimistisk UI med Rollback
```typescript
const previousState = currentVersion;
setCurrentVersion(optimisticUpdate);  // Vis straks
try {
  await saveToFirestore(optimisticUpdate);
} catch (err) {
  setCurrentVersion(previousState);   // Rollback ved fejl
  toast.error('Gem fejlede – dine ændringer er gendannet lokalt');
}
```

### localStorage Projekt-Hukommelse
```typescript
localStorage.setItem('lastProjectId', project.id);          // Ved valg
const savedId = localStorage.getItem('lastProjectId');       // Ved app-start
if (savedId) setSelectedProject(projects.find(p => p.id === savedId) ?? null);
```

---

## Skill: Asynkron UI Feedback

### Spinner Pattern
```tsx
{isSaving && (
  <div className="w-4 h-4 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
)}
```

### Toast Patterns (sonner)
```typescript
toast.success('Version 3 gemt!');
toast.error('Gem fejlede – prøv igen.');
toast.info('Ingen ændringer at synkronisere.');
```

### Modal Pattern (styled — aldrig native dialogs)
```typescript
// Trigger via showConfirm (fra App.tsx prop):
showConfirm('Er du sikker?', () => { doAction(); });
// Trigger via setPendingSaveCallback (for gem-flow med summary-input):
setPendingSaveCallback((summary) => executeSave(summary));
```

---

## Skill: tabConfig.ts API

Central kilde til tab→field mapping. **Brug altid disse funktioner — aldrig inline ternary chains.**

```typescript
import { TAB_TO_FIELD, TAB_LABEL, TAB_TO_FILENAME, getTabContent, setTabContent } from '../tabConfig';

const content  = getTabContent(currentVersion, activeTab);        // Læs
const updated  = setTabContent(currentVersion, activeTab, value); // Skriv (immutabelt)
const label    = TAB_LABEL[activeTab];      // → "SPEC.md", "rules.md" etc.
const filename = TAB_TO_FILENAME[activeTab]; // → "SPEC.md", "llms.txt" etc.
```

---

## Skill: grill-me

**Formål:** Stress-test en plan eller et design ved at stille ét spørgsmål ad gangen og gennemgå hele beslutnings-træet.
**Aktivering:** Sig `"grill me on [emne]"` — eller del en plan og sig `"grill me"`.
**Fil:** `.agents/skills/grill-me.md`

### Protokol (kort)

- Spørgsmål stilles **ét ad gangen** — aldrig bundtet.
- Hvert spørgsmål ledsages af **AI's anbefaling** med begrundelse.
- Svage eller vage svar udfordres med **opfølgning** inden næste gren.
- Beslutninger bekræftes kort inden videre fremdrift.
- Kodebehov undersøges i kodebasen **FØR** det stilles som spørgsmål.

### Beslutnings-træ rækkefølge
```
1. Mål & success-kriterier
2. Bruger & persona
3. Datamodel & entiteter
4. Arkitektur & afgrænsninger
5. State & persistens
6. UI & brugerforløb
7. Edge cases & begrænsninger
8. Implementeringsrækkefølge & kritisk sti
```

---

## 🚀 Kommende Skills (Milestone 3: Tauri v2)

> Følgende opskrifter vil blive kodificeret, når vi starter migreringen til Tauri v2. 
> De udgør fundamentet for "Local-First" arkitekturen.

### Skill: tauri-fs-pattern (In-Progress)
**Formål:** Læsning og skrivning af `.md` filer direkte til brugerens harddisk.
**API:** `@tauri-apps/plugin-fs` og `BaseDirectory.AppLocalData`.
**Advarsel:** Erstatning af `isDirty` optimistisk UI rollbacks med direkte synkrone-følende I/O-kald.

### Skill: rust-ipc-bridge (In-Progress)
**Formål:** Kommunikationslag mellem React-frontend og Rust-backend.
**API:** `invoke('command_name', { payload })`.
**Advarsel:** Skal håndtere asynkrone Rust-resultater med standardiserede success/error-objekter.

### Skill: frameless-window-layout (In-Progress)
**Formål:** Skab et ægte native OS-vindue uden browser-chrome.
**API:** `data-tauri-drag-region` for custom titlebars, integration med systemets window-controls (Minimér, Maksimér, Luk).
**Advarsel:** Skrøbelig på tværs af Windows/macOS. Testes grundigt under Milestone 3.

---
Last-Modified: 2026-03-31
