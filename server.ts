import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const CONFIG_PATH = path.join(process.cwd(), "src", "config.json");

  app.use(express.json());

  // API Route: Get Config
  app.get("/api/config", async (req, res) => {
    try {
      const data = await fs.readFile(CONFIG_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      console.error("Error reading config:", error);
      res.status(500).json({ error: "Failed to read configuration" });
    }
  });

  // API Route: Update Config
  app.post("/api/config", async (req, res) => {
    try {
      const newConfig = req.body;
      await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf-8");
      res.json({ success: true });
    } catch (error) {
       console.error("Error writing config:", error);
      res.status(500).json({ error: "Failed to save configuration" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
