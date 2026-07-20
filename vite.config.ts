import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const readServerPublicEnv = () => {
  const envPath = resolve(process.cwd(), "server/.env");
  if (!existsSync(envPath)) return {} as Record<string, string>;

  return readFileSync(envPath, "utf8").split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return acc;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (["SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"].includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const serverPublicEnv = readServerPublicEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? serverPublicEnv.VITE_SUPABASE_URL ?? serverPublicEnv.SUPABASE_URL;
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? serverPublicEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? serverPublicEnv.SUPABASE_PUBLISHABLE_KEY;

export default defineConfig({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl ?? ""),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey ?? ""),
  },
  server: {
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [tsconfigPaths(), tanstackStart({ server: { entry: "server" } }), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/jsx-runtime") || id.endsWith("/react/index.js") || id.includes("react/cjs")) return "react";
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/router-core") || id.includes("@tanstack/react-query") || id.includes("@tanstack/react-start")) return "tanstack";
            if (id.includes("@radix-ui/")) return "radix";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("recharts")) return "charts";
            if (id.includes("embla-carousel")) return "carousel";
            if (id.includes("date-fns")) return "dates";
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router"] },
});

