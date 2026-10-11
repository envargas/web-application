import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generarGaleria } from "./scripts/generar-galeria.mjs";

const galleryFolders = [
  "public/images/galeria",
  "public/images/familia",
  "public/images/amigos",
  "public/images/viajes",
  "public/images/recuerdos",
  "public/images/hero",
  "public/images",
];

function marmotaGaleria() {
  let pending = null;

  return {
    name: "marmota-galeria",
    configResolved() {
      generarGaleria();
    },
    configureServer(server) {
      server.watcher.add(galleryFolders);

      const updatePhotos = (file) => {
        const normalized = file.replaceAll("\\", "/");
        if (!normalized.includes("/public/images/")) return;
        if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(normalized)) return;

        // Si copias 100 fotos de golpe, crear el índice una sola vez.
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => {
          generarGaleria();
          server.ws.send({ type: "full-reload" });
          pending = null;
        }, 350);
      };

      server.watcher.on("add", updatePhotos);
      server.watcher.on("unlink", updatePhotos);
      server.httpServer?.on("close", () => {
        if (pending) clearTimeout(pending);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), marmotaGaleria()],
});
