import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageRoot = path.join(root, "public", "images");
const output = path.join(imageRoot, "galeria.json");
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const folders = [
  ["galeria", "Galería"],
  ["hero", "Portadas"],
  ["familia", "Familia"],
  ["amigos", "Amigos"],
  ["viajes", "Paseos"],
  ["recuerdos", "Recuerdos"],
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
        file,
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
        file: path.join(imageRoot, item.name),
        alt: "Foto de Marmota",
      });
    }
  }

  // Priorizar las fotos reales de galeria/ y la portada elegida.
  // No mostrar copias idénticas aunque estén guardadas con nombres diferentes.
  const hashes = new Set();
  const uniquePhotos = [];
  for (const photo of photos) {
    const digest = createHash("sha256").update(readFileSync(photo.file)).digest("hex");
    if (hashes.has(digest)) continue;
    hashes.add(digest);
    uniquePhotos.push(photo);
  }

  const folderPriority = new Map(folders.map(([name], i) => [name, i]));
  uniquePhotos.sort((a, b) => {
    const groupA = a.src.split("/")[2];
    const groupB = b.src.split("/")[2];
    const rankA = folderPriority.get(groupA) ?? folders.length;
    const rankB = folderPriority.get(groupB) ?? folders.length;
    return rankA - rankB || b.date - a.date || a.src.localeCompare(b.src);
  });

  const manifest = uniquePhotos.map(({ src, category, alt }) => ({ src, category, alt }));
  writeFileSync(output, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[Marmota] Galería actualizada: ${manifest.length} fotos únicas de ${photos.length} archivos.`);
  return manifest.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generarGaleria();
}
