import { useEffect, useState } from "react";
import "./Comentarios.css";

const STORAGE_KEY = "marmota-comments-preview-v1";
const hasSharedComments = !import.meta.env.DEV;
const endpoint = "/api/comments";

function loadPreview() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function requestComments(options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "No pudimos conectar con los comentarios.");
  }
  return result;
}

function Comentarios() {
  const [comments, setComments] = useState(() => hasSharedComments ? [] : loadPreview());
  const [loading, setLoading] = useState(hasSharedComments);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [form, setForm] = useState({ owner: "", pet: "", message: "", website: "" });

  useEffect(() => {
    if (!hasSharedComments) return undefined;

    const controller = new AbortController();
    setLoading(true);

    requestComments({ signal: controller.signal })
      .then((result) => {
        setComments(Array.isArray(result.comments) ? result.comments : []);
        setError("");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [refreshCount]);

  function changeField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitComment(event) {
    event.preventDefault();
    if (sending) return;
    if (form.website) return; // Campo oculto para bots sencillos.

    const owner_name = form.owner.trim();
    const pet_name = form.pet.trim();
    const message = form.message.trim();

    setError("");
    setNotice("");

    if (owner_name.length < 2 || pet_name.length < 2 || message.length < 3) {
      setError("Completa tu nombre, el de tu mascota y un mensaje.");
      return;
    }

    setSending(true);
    try {
      if (hasSharedComments) {
        const result = await requestComments({
          method: "POST",
          body: JSON.stringify({ owner_name, pet_name, message }),
        });
        setComments((previous) => [result.comment, ...previous].filter(Boolean).slice(0, 60));
        setNotice("Tu comentario quedó publicado. Gracias por escribirle a Marmota.");
      } else {
        const preview = {
          id: `preview-${Date.now()}`,
          owner_name,
          pet_name,
          message,
          created_at: new Date().toISOString(),
        };
        const updated = [preview, ...comments].slice(0, 20);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setComments(updated);
        setNotice("Guardado como prueba en este navegador. Aún no es visible para otras personas.");
      }
      setForm({ owner: "", pet: "", message: "", website: "" });
    } catch (reason) {
      setError(reason.message || "No se pudo guardar el comentario.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comments-section section" id="comentarios" aria-labelledby="comments-title">
      <div className="container">
        <div className="comments-heading">
          <span className="section-label">Libro de visitas</span>
          <h2 id="comments-title">Déjale un mensaje a Marmota.</h2>
          <p>
            Si la conoces, o simplemente quieres saludarla, puedes escribir aquí.
            Cuéntanos también cómo se llama tu mascota.
          </p>
        </div>

        {!hasSharedComments && (
          <p className="comments-preview" role="status">
            <strong>Vista previa:</strong> los comentarios que escribas se guardan solo
            en este navegador. Para que todos los visitantes puedan verlos,
            hace falta publicar la página en Vercel y configurar el acceso a GitHub.
          </p>
        )}

        <div className="comments-layout">
          <form className="comments-form" onSubmit={submitComment}>
            <h3>Escribe tu comentario</h3>
            <label htmlFor="comment-owner">Tu nombre</label>
            <input
              id="comment-owner"
              name="owner"
              type="text"
              placeholder="Ej. Camila"
              autoComplete="name"
              minLength={2}
              maxLength={55}
              value={form.owner}
              onChange={(event) => changeField("owner", event.target.value)}
              required
              disabled={sending}
            />

            <label htmlFor="comment-pet">¿De qué mascota eres dueño/a?</label>
            <input
              id="comment-pet"
              name="pet"
              type="text"
              placeholder="Ej. Luna, mi perrita"
              minLength={2}
              maxLength={70}
              value={form.pet}
              onChange={(event) => changeField("pet", event.target.value)}
              required
              disabled={sending}
            />

            <label htmlFor="comment-message">Tu mensaje para Marmota</label>
            <textarea
              id="comment-message"
              name="message"
              placeholder="Escribe algo para Marmota..."
              rows={5}
              minLength={3}
              maxLength={420}
              value={form.message}
              onChange={(event) => changeField("message", event.target.value)}
              required
              disabled={sending}
            />
            <span className="comments-counter">{form.message.length}/420</span>

            <div className="comments-hp" aria-hidden="true">
              <label htmlFor="comment-website">Sitio web</label>
              <input
                id="comment-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => changeField("website", event.target.value)}
              />
            </div>

            {error && <p className="comments-feedback is-error" role="alert">{error}</p>}
            {notice && <p className="comments-feedback" role="status">{notice}</p>}

            <button className="comments-submit" type="submit" disabled={sending}>
              {sending ? "Enviando..." : hasSharedComments ? "Publicar comentario" : "Probar comentario"}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <div className="comments-wall">
            <div className="comments-wall-title">
              <h3>Lo que le han escrito</h3>
              <span>{comments.length} {comments.length === 1 ? "mensaje" : "mensajes"}</span>
            </div>

            {loading ? (
              <p className="comments-empty">Cargando comentarios...</p>
            ) : comments.length === 0 ? (
              <p className="comments-empty">
                Todavía no hay mensajes. Puedes dejar el primero.
              </p>
            ) : (
              <div className="comments-items" aria-live="polite">
                {comments.map((comment) => (
                  <article className="comment-card" key={comment.id}>
                    <div className="comment-top">
                      <strong>{comment.owner_name}</strong>
                      <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                    </div>
                    <p className="comment-pet">Dueño/a de {comment.pet_name}</p>
                    <p className="comment-message">{comment.message}</p>
                  </article>
                ))}
              </div>
            )}
            {hasSharedComments && !loading && (
              <button
                className="comments-refresh"
                type="button"
                onClick={() => setRefreshCount((value) => value + 1)}
              >
                Actualizar mensajes
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comentarios;
