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
  return {
    name: "marmota-galeria",
    configResolved() {
      generarGaleria();
    },
    configureServer(server) {
      server.watcher.add(galleryFolders);
      server.watcher.on("add", (file) => {
        if (/\\public\\images\\|\/public\/images\//.test(file) && /\.(jpe?g|png|webp|avif|gif)$/i.test(file)) {
          generarGaleria();
          server.ws.send({ type: "full-reload" });
        }
      });
      server.watcher.on("unlink", (file) => {
        if (/\\public\\images\\|\/public\/images\//.test(file) && /\.(jpe?g|png|webp|avif|gif)$/i.test(file)) {
          generarGaleria();
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), marmotaGaleria()],
});
