import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createRequire } from "module";
import { defineConfig } from "vite";

// vite-plugin-manus-runtime só existe no ambiente Manus — ignorar em produção/Vercel
const _require = createRequire(import.meta.url);
let manusPlugins: any[] = [];
try {
    const { vitePluginManusRuntime } = _require("vite-plugin-manus-runtime");
    manusPlugins = [vitePluginManusRuntime()];
} catch {
    // Plugin não disponível fora do ambiente Manus
}

export default defineConfig({
    plugins: [react(), tailwindcss(), jsxLocPlugin(), ...manusPlugins],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
        },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    publicDir: path.resolve(import.meta.dirname, "client", "public"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        host: true,
        allowedHosts: [
            ".manuspre.computer",
            ".manus.computer",
            ".manus-asia.computer",
            ".manuscomputer.ai",
            ".manusvm.computer",
            "localhost",
            "127.0.0.1",
        ],
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
