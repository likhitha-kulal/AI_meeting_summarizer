import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy any request starting with /process-meeting or /health
      // to the FastAPI backend. The rewrite strips nothing — paths match as-is.
      "^/(process-meeting|health)": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
