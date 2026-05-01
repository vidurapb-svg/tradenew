import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API to fetch Yahoo Finance data without CORS issues
  app.get("/api/yahoo", async (req, res) => {
    try {
      const { symbol, range, interval = "1d", period1, period2 } = req.query;
      let url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}`;
      
      if (period1 && period2) {
        url += `&period1=${period1}&period2=${period2}`;
      } else if (range) {
        url += `&range=${range}`;
      } else {
        url += `&period1=0&period2=9999999999`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch data" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
