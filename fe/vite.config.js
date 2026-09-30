import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API is served by Apache under the same alias as this app
// (see docker-compose.yml / apache-projects.conf). Proxying it through Vite
// keeps everything same-origin in dev, so the session cookie just works and
// no CORS headers are needed on the PHP side.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/qibar/powerban/api": {
        target: "http://localhost",
        changeOrigin: true,
      },
    },
  },
});
