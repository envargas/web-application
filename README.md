# Marmota

Álbum de fotos de Marmota (React + Vite). Diseño de galería con filtros por categorías, fotografías ampliables y un libro de visitas.

## Ejecutar

```bash
npm install
npm run dev
```

Abre la dirección indicada por Vite (habitualmente `http://localhost:5173/`).

## Añadir 10, 50 o 200 fotos de golpe

**No necesitas tocar el código ni registrar cada imagen a mano.**

1. Copia o arrastra fotos `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` o `.gif` a **`public/images/galeria/`**.
2. Si prefieres organizarlas, usa estas carpetas: `public/images/familia/`, `amigos/`, `viajes/`, `recuerdos/` y `hero/`. El filtro de la galería se crea solo.
3. Al iniciar Vite se ejecuta `scripts/generar-galeria.mjs` automáticamente y genera **`public/images/galeria.json`**. Al añadir o eliminar una foto, Vite también actualiza el índice.
4. Para subirlas al repositorio, en Windows haz doble clic en **`SUBIR_FOTOS_MARMOTA.bat`** y confirma el listado. O usa los comandos:

   ```bash
   git add public/images/galeria public/images/familia public/images/amigos public/images/viajes public/images/recuerdos public/images/hero
   git commit -m "Agregar nuevas fotos"
   git push origin feature/marmota-estilo-comentarios
   ```

5. Vercel vuelve a desplegar las fotografías al recibir el commit, según la configuración de la rama.

Las imágenes existentes `public/images/marmota-*.jpg` se integran automáticamente. El índice se **genera en cada compilación**, por lo que no es necesario versionarlo.

**Importante:** evita fotos originales enormes: idealmente conviértelas a JPG o WebP (1600–2000 px de lado mayor y calidad 75–85). No subas imágenes privadas a un repositorio público. GitHub rechaza archivos superiores a 100 MB de forma individual. HEIC no se admite directamente; convierte las fotos HEIC a JPG/WebP.

## Libro de visitas sin base de datos

- **En desarrollo** (`npm run dev`) funciona en vista previa: los mensajes se guardan en el navegador (`localStorage`) y solo los ve quien los creó.
- **En Vercel:** `api/comments.js` registra cada mensaje como un objeto JSON en un comentario del issue **[#2](https://github.com/envargas/web-application/issues/2)**. Se reutiliza GitHub como almacenamiento persistente, **sin una base de datos y sin escribir archivos en el sistema de Vercel**.
- Los datos del comentario son públicos: nombre, mascota, mensaje y fecha. El usuario no necesita cuenta GitHub.
- GitHub Issue #2 permite eliminar o moderar comentarios manualmente desde GitHub; no borrar el issue.

### Activación en Vercel

1. En GitHub crea un **fine-grained personal access token**, limitado únicamente al repositorio `envargas/web-application`, con permiso **Issues: Read and write** y Metadata: Read.
2. En Vercel > Project > **Settings > Environment Variables** añade `GITHUB_COMMENTS_TOKEN` con el token. **No** antepongas `VITE_` al nombre.
3. Vuelve a desplegar tu proyecto. El servidor podrá publicar nuevos comentarios. Si falta la variable, la API devolverá 503 en los envíos.
4. Para evitar spam, activa protección antibots y límites de solicitudes en el endpoint `/api/comments` desde el firewall de Vercel antes de compartir públicamente el enlace.

No subas el token a GitHub ni lo pongas en código que ejecuta el navegador. El repositorio es público; los mensajes también son públicos por diseño.

**Límite actual de lectura:** se consultan hasta 300 respuestas del issue y se muestran las 60 más recientes. El listado no representa un sistema de moderación automática.

## Estructura

- `src/App.jsx`: portada, galería con filtros y vista ampliada.
- `src/App.css`: diseño general.
- `src/components/Comentarios.jsx`: formulario y listado.
- `api/comments.js`: función serverless de Vercel para los mensajes.
- `scripts/generar-galeria.mjs`: índice automático.
- `vite.config.js`: generación en desarrollo y compilación.

## Rama de trabajo

La funcionalidad se prueba en `feature/marmota-estilo-comentarios`. Mantén a salvo cualquier cambio local no subido (incluidos `package.json`, `src/data/` y fotos personales) antes de mezclar ramas.
