// Vercel Serverless Function. Comentarios JSON guardados en un issue dedicado.
// No utiliza base de datos ni permite al navegador acceder al token GitHub.
const apiUrl = "https://api.github.com/repos/envargas/web-application/issues/2/comments";
const marker = "MARMOTA_JSON_V1\n";
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "marmota-web-comments",
};

function parseComment(item) {
  if (!item || typeof item.body !== "string" || !item.body.startsWith(marker)) return null;
  try {
    const record = JSON.parse(item.body.slice(marker.length));
    if (
      typeof record.owner_name !== "string" ||
      typeof record.pet_name !== "string" ||
      typeof record.message !== "string"
    ) return null;
    return {
      id: item.id,
      owner_name: record.owner_name.slice(0, 55),
      pet_name: record.pet_name.slice(0, 70),
      message: record.message.slice(0, 420),
      created_at: item.created_at,
    };
  } catch {
    return null;
  }
}

function validText(value, min, max) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}

async function github(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(process.env.GITHUB_COMMENTS_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_COMMENTS_TOKEN}` }
        : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const error = new Error("Error al conectar con GitHub.");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Allow", "GET, POST");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  try {
    if (req.method === "GET") {
      // Hasta 300 mensajes, sin escrituras ni despliegues por comentario.
      const pages = [];
      for (let page = 1; page <= 3; page += 1) {
        const batch = await github(`${apiUrl}?per_page=100&page=${page}`);
        pages.push(...batch);
        if (batch.length < 100) break;
      }
      const comments = pages
        .map(parseComment)
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 60);
      return res.status(200).json({ comments });
    }

    if (!process.env.GITHUB_COMMENTS_TOKEN) {
      return res.status(503).json({ error: "Los comentarios públicos todavía no están habilitados." });
    }

    // Comprobar origen en solicitudes que llegan desde un navegador.
    const origin = req.headers.origin;
    if (origin) {
      let url;
      try { url = new URL(origin); } catch { return res.status(403).json({ error: "Origen inválido." }); }
      const forwardedHost = req.headers["x-forwarded-host"] || req.headers.host;
      if (url.host !== forwardedHost || !["https:", "http:"].includes(url.protocol)) {
        return res.status(403).json({ error: "Origen no permitido." });
      }
    }

    if (req.headers["content-type"]?.split(";")[0] !== "application/json") {
      return res.status(415).json({ error: "Usa contenido JSON." });
    }
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Solicitud inválida." });
    }
    if (body.website) return res.status(400).json({ error: "Solicitud no válida." });

    const owner_name = validText(body.owner_name, 2, 55);
    const pet_name = validText(body.pet_name, 2, 70);
    const message = validText(body.message, 3, 420);
    if (!owner_name || !pet_name || !message) {
      return res.status(400).json({ error: "Completa correctamente los tres campos." });
    }

    // Sitios públicos: configurar rate limiting / protección antibots en Vercel.
    const created = await github(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: marker + JSON.stringify({ owner_name, pet_name, message }),
      }),
    });
    const comment = parseComment(created);
    if (!comment) throw new Error("No se pudo guardar el mensaje.");

    res.setHeader("Cache-Control", "no-store");
    return res.status(201).json({ comment });
  } catch (error) {
    const message = error.status === 403 || error.status === 429
      ? "No se puede publicar ahora. Intenta más tarde."
      : "No pudimos cargar los comentarios. Intenta nuevamente.";
    return res.status(502).json({ error: message });
  }
}
