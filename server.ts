import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ─── Docs file whitelist ───────────────────────────────────────────────────
  // All readable/writable project documentation files.
  const DOCS_FILES: Record<string, string> = {
    "llms.txt":        path.join(process.cwd(), "llms.txt"),
    "manifest.md":     path.join(process.cwd(), "docs", "manifest.md"),
    "architecture.md": path.join(process.cwd(), "docs", "architecture.md"),
    "testing.md":      path.join(process.cwd(), "docs", "testing.md"),
    "SPEC.md":         path.join(process.cwd(), "docs", "SPEC.md"),
    "PLAN.md":         path.join(process.cwd(), "docs", "PLAN.md"),
    "STATE.md":        path.join(process.cwd(), "docs", "STATE.md"),
    "AGENTS.md":       path.join(process.cwd(), "docs", "AGENTS.md"),
    "DESIGN.md":       path.join(process.cwd(), "docs", "DESIGN.md"),
    "rules.md":        path.join(process.cwd(), "docs", "rules.md"),
    "SKILL.md":        path.join(process.cwd(), "docs", "SKILL.md"),
    "workflows.md":    path.join(process.cwd(), "docs", "workflows.md"),
    "CHANGELOG.md":    path.join(process.cwd(), "docs", "CHANGELOG.md"),
    "CONTRIBUTING.md": path.join(process.cwd(), "docs", "CONTRIBUTING.md"),
    "SECURITY.md":     path.join(process.cwd(), "docs", "SECURITY.md"),
    "cc-log.md":       path.join(process.cwd(), "docs", "cc-log.md"),
  };

  // API to read documentation files
  app.get("/api/docs/:filename", async (req, res) => {
    const filePath = DOCS_FILES[req.params.filename];
    if (!filePath) return res.status(404).json({ error: "File not found" });
    try {
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch {
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  // API to list all docs files (used when building dynamic llms.txt)
  app.get("/api/docs/list", async (_req, res) => {
    res.json({ files: Object.keys(DOCS_FILES) });
  });

  // API to fetch internal best practices (C-Suite board, SECURITY, grill-me)
  app.get("/api/best-practices", async (_req, res) => {
    try {
      const bestPractices: Array<{ name: string; content: string }> = [];
      const fetchFile = async (name: string, absolutePath: string) => {
        try {
          const content = await fs.readFile(absolutePath, "utf-8");
          bestPractices.push({ name, content });
        } catch {
          console.warn(`[server] Could not load best-practice file: ${absolutePath}`);
        }
      };

      await fetchFile('security', path.join(process.cwd(), 'docs', 'SECURITY.md'));
      await fetchFile('grill-me', path.join(process.cwd(), '.agents', 'skills', 'grill-me.md'));

      // Fetch C-level Board members
      const ccDir = path.join(process.cwd(), '.agents', 'skills', 'cc');
      try {
        const ccFiles = await fs.readdir(ccDir);
        for (const file of ccFiles) {
          if (file.endsWith('.md')) {
            await fetchFile(`cc/${file.replace('.md', '')}`, path.join(ccDir, file));
          }
        }
      } catch (e) {
        console.warn("[server] Could not read cc directory", e);
      }

      res.json({ practices: bestPractices });
    } catch (e) {
      res.status(500).json({ error: "Failed to load best practices" });
    }
  });

  // API to read all .agents/skills/**/*.md files for Master Prompt inclusion
  app.get("/api/agents/skills", async (_req, res) => {
    const skillsDir = path.join(process.cwd(), ".agents", "skills");

    // Recursive directory walker — picks up skills in any subdirectory (e.g. audit/)
    async function walkSkills(dir: string): Promise<{ name: string; filename: string; content: string }[]> {
      await fs.mkdir(dir, { recursive: true });
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const results: { name: string; filename: string; content: string }[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const nested = await walkSkills(fullPath);
          results.push(...nested);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const content = await fs.readFile(fullPath, "utf-8");
          // Name = relative path from skillsDir without extension, e.g. "audit/chef-auditor"
          const relativePath = path.relative(skillsDir, fullPath).replace(/\\/g, "/").replace(".md", "");
          results.push({ name: relativePath, filename: entry.name, content });
        }
      }
      return results;
    }

    try {
      const skills = await walkSkills(skillsDir);
      res.json({ skills });
    } catch (error) {
      console.error("[server] Failed to read .agents/skills:", error);
      res.json({ skills: [] }); // Graceful fallback — never breaks Master Prompt generation
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
