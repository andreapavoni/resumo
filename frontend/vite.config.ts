import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    outDir: "../static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "app.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
  plugins: [
    tailwindcss(),
    {
      name: "rewrite-app-route",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/app") {
            req.url = "/app.html";
          }
          next();
        });
      },
    },
  ],
});
