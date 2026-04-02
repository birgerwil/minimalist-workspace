import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

// Load local env
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in .env. Cannot run E2E tests.");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// ─── Scenarios ─────────────────────────────────────────────────────────────

interface TestScenario {
  id: string;
  projectName: string;
  vision: string;
  platforms: string[];
  scale: string;
  tempo: string;
  cloud: string;
  ui: string;
  customStack?: string;
}

const SCENARIOS: TestScenario[] = [
  {
    id: "startup-mvp",
    projectName: "FoodieApp",
    vision: "En app til madelskere der vil bestille mad fra lokale restauranter med real-time tracking.",
    platforms: ["mobile"],
    scale: "public",
    tempo: "mvp",
    cloud: "aws",
    ui: "consumer"
  },
  {
    id: "enterprise-dash",
    projectName: "LogiMetric",
    vision: "En enterprise dashboard løsning til at tracke globale container-forsendelser med AI-prediction.",
    platforms: ["web"],
    scale: "team",
    tempo: "solid",
    cloud: "azure",
    ui: "dashboard",
    customStack: "C# .NET Backend + React with Tailwind"
  },
  {
    id: "local-tool",
    projectName: "NoteVault",
    vision: "En ultra-sikker, lokal notes-app med E2EE og markdown support.",
    platforms: ["desktop"],
    scale: "solo",
    tempo: "mvp",
    cloud: "none",
    ui: "tft"
  },
  {
    id: "lean-api",
    projectName: "WeatherCore",
    vision: "En ultra-hurtig vejr-API der aggregerer data fra 5 forskellige kilder.",
    platforms: ["api"],
    scale: "public",
    tempo: "solid",
    cloud: "paas",
    ui: "none"
  },
  {
    id: "multi-platform",
    projectName: "HealthFlow",
    vision: "En sundheds-app der synkroniserer data mellem web og mobil til patienter og læger.",
    platforms: ["web", "mobile"],
    scale: "team",
    tempo: "mvp",
    cloud: "gcp",
    ui: "consumer"
  }
];

// ─── Helpers (Mocked from UI implementation) ────────────────────────────────

async function generateAI(system: string, user: string, modelName = "gemini-1.5-flash") {
  const payload = {
    model: modelName,
    contents: [{ role: "user", parts: [{ text: user }] }],
    config: { systemInstruction: system }
  };

  const res = await fetch("http://localhost:3001/api/ai/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "AI Proxy call failed");
  }

  const data = await res.json();
  return (data as any).text;
}

function buildContextPrompt(scenario: TestScenario) {
  const platformDetails = scenario.platforms.map(p => `  - ${p}`).join("\n");
  const multiWarning = scenario.platforms.length > 1 ? "\nVIGTIGT: Multi-platform projekt. Delt logik isoleres." : "";
  
  return `
VISION FRA IVÆRKSÆTTER:
${scenario.vision}

PLATFORM & DEPLOYMENT:
${platformDetails}
${multiWarning}
BRUGERSKALA: ${scenario.scale}
UDVIKLINGSTEMPO: ${scenario.tempo}
CLOUD & INFRASTRUKTUR: ${scenario.cloud}
UI DESIGN FILOSOFI: ${scenario.ui}
${scenario.customStack ? `\nSPECIFIKT STACK-ØNSKE FRA BRUGER: ${scenario.customStack}` : ""}
`.trim();
}

// ─── Runner ────────────────────────────────────────────────────────────────

async function runTest() {
  console.log("🚀 Starting QA E2E Verification Suite...");
  
  const results = [];

  for (const s of SCENARIOS) {
    console.log(`\n🧪 Testing Scenario: ${s.id.toUpperCase()}...`);
    
    const context = buildContextPrompt(s);
    
    // 1. Generate SPEC
    console.log("   - Generating SPEC.md...");
    const specSystem = "Du er en Senior Product Designer. Transformer vision til SPEC.md. Svar på dansk.";
    const spec = await generateAI(specSystem, `Projekt: ${s.projectName}\nVision: ${s.vision}\nKontekst: ${context}`);

    // 2. Generate ARCHITECTURE
    console.log("   - Generating ARCHITECTURE.md (Context-Aware)...");
    const archSystem = `Du er en Senior AI Architect. Design ARCHITECTURE.md til en MVP. 
    VIGTIGT: Overhold the Low Confidence Rule for komplekse valg. 
    Svar på dansk. Inkludér '## ⚠️ Uafklarede Arkitektur-Flag' hvis nødvendigt.`;
    const arch = await generateAI(archSystem, `Fundament: ${spec}\nWizard Context: ${context}`);

    // 3. Generate MASTER PROMPT (llms.txt)
    console.log("   - Generating llms.txt (Master Prompt)...");
    const llmSystem = "Du er en System Engineer. Skab en kortfattet llms.txt (max 2KB) oversigt over projektet.";
    const llmsTxt = await generateAI(llmSystem, `Spec: ${spec}\nArch: ${arch}\nContext: ${context}`);

    // Verification of the +20 Context Items
    const contextItems = [
      "VISION", "PLATFORM", "SCALE", "TEMPO", "CLOUD", "UI PHILOSOPHY",
      "CA-01", "CA-02", "CA-03", "CA-04", "CA-05", // Causal Anchors
      "FL-01", "FL-02", "FL-04", // UX Flows
      "N1", "Progressive Disclosure", "8pt grid", "Minimal Chrome",
      "TypeScript", "MVP"
    ];

    const missingItems = contextItems.filter(item => !llmsTxt.includes(item) && !arch.includes(item));
    const contextScore = ((contextItems.length - missingItems.length) / contextItems.length) * 100;

    results.push({
      scenario: s.id,
      projectName: s.projectName,
      archSnippet: arch.substring(0, 500) + "...",
      llmsSnippet: llmsTxt.substring(0, 500) + "...",
      hasCloudRef: arch.toLowerCase().includes(s.cloud.toLowerCase()) || (s.cloud === 'none' && arch.toLowerCase().includes('lokal')),
      hasPlatformRef: s.platforms.every(p => arch.toLowerCase().includes(p.toLowerCase())),
      hasLowConfFlag: arch.includes("⚠️ Uafklarede Arkitektur-Flag") || arch.includes("Low Confidence"),
      contextScore,
      missingItems
    });
  }

  // Generate Report
  let report = "# QA E2E Audit Report\n\nGenerated: " + new Date().toLocaleString() + "\n\n";
  report += "Denne rapport verificerer at The Workbench fører den fulde kontekst fra Wizard UI'et helt ned i kildekoden.\n\n";
  report += "| Scenario | Project | Cloud Match | Platform Match | Context Score | Low Conf Flag | Result |\n";
  report += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
  
  for (const r of results) {
    const status = (r.hasCloudRef && r.hasPlatformRef && r.contextScore > 80) ? "✅ PASS" : "❌ FAIL";
    report += `| ${r.scenario} | ${r.projectName} | ${r.hasCloudRef ? "✅" : "❌"} | ${r.hasPlatformRef ? "✅" : "❌"} | ${r.contextScore}% | ${r.hasLowConfFlag ? "YES" : "NO"} | ${status} |\n`;
  }

  report += "\n\n## Detaljeret Analyse\n\n";
  for (const r of results) {
    report += `### Scenario: ${r.scenario}\n\n**Architecture Snippet:**\n\`\`\`markdown\n${r.archSnippet}\n\`\`\`\n\n`;
  }

  await fs.writeFile("QA_REPORT.md", report);
  console.log("\n✨ Verification complete! Report generated: QA_REPORT.md");
}

runTest().catch(console.error);
