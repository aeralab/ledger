import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lifestyleBase } from "lifestyle-sync/vite/base";
import { lifestyleEnvDir, lifestyleEnvPrefix } from "lifestyle-sync/vite/env";
import { lifestyleHtmlBoot } from "lifestyle-sync/vite/htmlBoot";
import { lifestylePreview } from "lifestyle-sync/vite/preview";
import { lifestylePwaPlugins } from "lifestyle-sync/vite/pwa";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  envDir: lifestyleEnvDir(root),
  envPrefix: lifestyleEnvPrefix,
  plugins: [
    react(),
    lifestyleHtmlBoot({ title: "记账" }),
    ...lifestylePwaPlugins({
      name: "智能记账",
      shortName: "记账",
      description: "日常收支记录",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
      manifestId: "https://ledger-app-delta-orpin.vercel.app/",
      cacheId: "ledger-app-v1",
    }),
  ],
  base: lifestyleBase(mode),
  resolve: {
    alias: {
      "lifestyle-sync": existsSync(path.resolve(root, "../../packages/lifestyle-sync/src/index.ts"))
        ? path.resolve(root, "../../packages/lifestyle-sync/src/index.ts")
        : path.resolve(root, "../../node_modules/lifestyle-sync/src/index.ts"),
    },
  },
  preview: lifestylePreview(5177, true),
  server: { port: 5177, host: true, strictPort: true },
}));
