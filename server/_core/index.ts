import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic, setupVite } from "./vite.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 5000): Promise<number> {
  console.log(`[Server] Procurando porta disponível a partir de ${startPort}...`);
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`Nenhuma porta disponível encontrada a partir de ${startPort} `);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Upload Middleware
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  const upload = multer({ storage });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
  });

  // Servir pasta de uploads de forma estática
  app.use("/uploads", express.static(path.join(__dirname, "../../public/uploads")));

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    console.log("[Server] Modo Desenvolvimento: Iniciando Vite...");
    await setupVite(app, server);
  } else {
    console.log("[Server] Modo Produção: Servindo arquivos estáticos.");
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  server.listen(port, () => {
    console.log(`\n\n[Server] 🚀 APLICAÇÃO RODANDO EM: http://localhost:${port}/ \n\n`);
  });

  // Global Error Handler (MUST BE LAST)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[EXPRESS GLOBAL ERROR HANDLER]");
    console.error(err); // Full stack trace

    const status = err.statusCode || err.status || 500;
    res.status(status).json({
      error: true,
      message: err.message || "Erro interno do servidor",
      code: err.code || "INTERNAL_ERROR",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });
}

startServer().catch(console.error);
