import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageRoot = path.join(root, "public", "images");
const output = path.join(imageRoot, "galeria.json");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const folders = [
  ["galeria", "Galería"],
  ["familia", "Familia"],
  ["amigos", "Amigos"],
  ["viajes", "Paseos"],
  ["recuerdos", "Recuerdos"],
  ["hero", "Portadas"],
];

function scan(dir, collection, relative = []) {
  if (!existsSync(dir)) return [];
  const photos = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith(".")) continue;
    if (item.isDirectory()) {
      photos.push(...scan(path.join(dir, item.name), collection, [...relative, item.name]));
    } else if (item.isFile() && extensions.has(path.extname(item.name).toLowerCase())) {
      const name = item.name;
      const segments = [...relative, name];
      const file = path.join(dir, name);
      photos.push({
        src: "/images/" + collection.folder + segments.map(encodeURIComponent).join("/"),
        category: collection.label,
        date: statSync(file).mtimeMs,
        alt: "Foto de Marmota",
      });
    }
  }
  return photos;
}

export function generarGaleria() {
  mkdirSync(imageRoot, { recursive: true });

  const photos = [];
  for (const [folder, label] of folders) {
    photos.push(...scan(path.join(imageRoot, folder), { folder: folder + "/", label }));
  }

  // Mantener las imágenes originales sin exigir que se muevan de carpeta.
  if (existsSync(imageRoot)) {
    for (const item of readdirSync(imageRoot, { withFileTypes: true })) {
      if (!item.isFile() || !extensions.has(path.extname(item.name).toLowerCase())) continue;
      if (!/^marmota[-_]/i.test(item.name)) continue;
      photos.push({
        src: "/images/" + encodeURIComponent(item.name),
        category: "Recuerdos",
        date: statSync(path.join(imageRoot, item.name)).mtimeMs,
        alt: "Foto de Marmota",
      });
    }
  }

  photos.sort((a, b) => b.date - a.date || a.src.localeCompare(b.src));
  const manifest = photos.map(({ src, category, alt }) => ({ src, category, alt }));
  writeFileSync(output, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[Marmota] Galería actualizada: ${manifest.length} fotos encontradas.`);
  return manifest.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generarGaleria();
}
