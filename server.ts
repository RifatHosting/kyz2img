import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure multer memory storage
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  // API Routes
  app.post("/api/upload", (req, res) => {
    upload.single("image")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ error: `Unknown error: ${err.message}` });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const mimeType = req.file.mimetype;

        const fileBlob = new Blob([fileBuffer], { type: mimeType });

        // Upload to Uguu
        const uguuFormData = new FormData();
        uguuFormData.append("files[]", fileBlob, fileName);
        const uguuPromise = fetch("https://uguu.se/upload", {
          method: "POST",
          body: uguuFormData,
        })
          .then((r) => r.json())
          .then((d) => d.files[0].url)
          .catch((e) => {
            console.error("Uguu error:", e);
            return null;
          });

        // Upload to Pixhost
        const pixhostFormData = new FormData();
        pixhostFormData.append("content_type", "0");
        pixhostFormData.append("img", fileBlob, fileName);
        const pixhostPromise = fetch("https://api.pixhost.to/images", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: pixhostFormData,
        })
          .then((r) => r.json())
          .then((d) => d.show_url)
          .catch((e) => {
            console.error("Pixhost error:", e);
            return null;
          });

        const [uguuUrl, pixhostUrl] = await Promise.all([
          uguuPromise,
          pixhostPromise,
        ]);

        if (!uguuUrl && !pixhostUrl) {
          return res
            .status(500)
            .json({ error: "Failed to upload to both services" });
        }

        res.json({
          urls: {
            uguu: uguuUrl,
            pixhost: pixhostUrl,
          },
        });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
      }
    });
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
