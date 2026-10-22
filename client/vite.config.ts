import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  // The client always calls same-origin /api so auth cookies stay first-party
  // (browsers drop cross-site cookies). In dev, forward /api to the backend;
  // in production vercel.json does the same.
  const apiTarget = (env.VITE_API_BASE_URL || "http://localhost:5000")
    .replace(/\/$/, "")
    .replace(/\/api$/, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true, secure: true },
      },
    },
  };
});
