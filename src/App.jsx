import { useEffect, useLayoutEffect, useState } from "react";
import "./App.css";
import Comentarios from "./components/Comentarios.jsx";

const fotosIniciales = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/marmota-${index + 1}.jpg`,
  alt: "Foto de Marmota",
  category: "Recuerdos",
}));

function useFotos() {
  const [fotos, setFotos] = useState(fotosIniciales);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/images/galeria.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("No se encontró la galería.");
        return response.json();
      })
      .then((items) => {
        if (!Array.isArray(items)) return;
        const validos = items.filter((foto) =>
          typeof foto.src === "string" &&
          foto.src.startsWith("/images/") &&
          !foto.src.includes("..") &&
          typeof foto.category === "string",
        );
        setFotos(validos);
      })
      .catch(() => {
        // Al servir la aplicación fuera de Vite, mantener las fotos originales.
      });

    return () => controller.abort();
  }, []);

  return fotos;
}

function useScrollReveal(dependencies) {
  useLayoutEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.09, rootMargin: "0px 0px -35px 0px" },
    );

    for (const element of elements) {
      element.classList.add("will-reveal");
      if (!element.classList.contains("is-revealed")) observer.observe(element);
    }
    return () => observer.disconnect();
  }, dependencies);
}

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#inicio" className="site-logo" aria-label="Marmota, volver al inicio">
          <span className="logo-dot" aria-hidden="true" />
          marmota
        </a>
      </div>
    </header>
  );
}

function Intro({ fotos }) {
  const principal = fotos[0]?.src || "/images/marmota-portada.jpg";
  const secundaria = fotos[1]?.src || "/images/marmota-2.jpg";

  return (
    <section className="intro" id="inicio">
      <div className="container">
        <div className="intro-layout">
          <div className="intro-copy">
            <h1>Marmota<span>.</span></h1>
            <p>Cinco años, muchas fotos.</p>
            <a className="intro-link" href="#galeria">
              Ver fotos <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="intro-photos">
            <figure className="intro-image-main">
              <img src={principal} alt="Marmota en una de sus fotos" fetchPriority="high" />
            </figure>
            <figure className="intro-image-small">
              <img src={secundaria} alt="Otra foto de Marmota" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ fotos, index, close, change }) {
  useEffect(() => {
    if (index === null) return undefined;

    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") change((current) => (current - 1 + fotos.length) % fotos.length);
      if (event.key === "ArrowRight") change((current) => (current + 1) % fotos.length);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [index, fotos.length, close, change]);

  if (index === null || !fotos[index]) return null;
  const foto = fotos[index];
  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada">
      <button type="button" className="photo-backdrop" onClick={close} aria-label="Cerrar" />
      <div className="photo-lightbox-inner">
        <div className="lightbox-bar">
          <span>{index + 1} / {fotos.length}</span>
          <button type="button" className="lightbox-close" onClick={close} aria-label="Cerrar">Cerrar ×</button>
        </div>
        <div className="lightbox-picture">
          <button
            type="button"
            className="lightbox-direction prev"
            aria-label="Foto anterior"
            onClick={() => change((current) => (current - 1 + fotos.length) % fotos.length)}
          >←</button>
          <img src={foto.src} alt={foto.alt || "Marmota"} />
          <button
            type="button"
            className="lightbox-direction next"
            aria-label="Foto siguiente"
            onClick={() => change((current) => (current + 1) % fotos.length)}
          >→</button>
        </div>
        <p className="lightbox-category">{foto.category}</p>
      </div>
    </div>
  );
}

function Galeria({ fotos }) {
  const [category, setCategory] = useState("Todas");
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeIndex, setActiveIndex] = useState(null);

  const categories = ["Todas", ...new Set(fotos.map((foto) => foto.category))];
  const filtradas = category === "Todas" ? fotos : fotos.filter((foto) => foto.category === category);
  const visibles = filtradas.slice(0, visibleCount);

  // Revelar fotos al entrar en pantalla y al añadir más imágenes.
  useScrollReveal([category, visibleCount, fotos.length]);

  function selectCategory(next) {
    setCategory(next);
    setVisibleCount(24);
  }

  return (
    <section id="galeria" className="album-section">
      <div className="container">
        <div className="album-heading" data-reveal="soft">
          <h2>El álbum.</h2>
        </div>

        {categories.length > 2 && (
          <div className="album-filters" role="group" aria-label="Filtrar fotos">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={item === category ? "filter is-active" : "filter"}
                onClick={() => selectCategory(item)}
                aria-pressed={item === category}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {fotos.length === 0 ? (
          <div className="album-empty">
            Aún no hay fotos. Puedes añadirlas a <code>public/images/galeria/</code>.
          </div>
        ) : (
          <>
            <div className="photo-masonry">
              {visibles.map((foto, index) => (
                <button
                  type="button"
                  className="photo-tile"
                  data-reveal="photo"
                  style={{ "--reveal-delay": `${(index % 3) * 85}ms` }}
                  key={foto.src}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Abrir foto ${index + 1} de ${filtradas.length}`}
                >
                  <img src={foto.src} alt={foto.alt || "Foto de Marmota"} loading="lazy" />
                  <span className="tile-bottom">
                    <span>{foto.category}</span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              ))}
            </div>

            {filtradas.length > visibleCount && (
              <div className="album-load">
                <button type="button" onClick={() => setVisibleCount((count) => count + 24)}>
                  Ver más fotos <span>({filtradas.length - visibleCount} restantes)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Lightbox
        fotos={filtradas}
        index={activeIndex}
        close={() => setActiveIndex(null)}
        change={setActiveIndex}
      />
    </section>
  );
}

function SobreElla() {
  return (
    <section className="about-section" id="sobre-ella">
      <div className="container about-layout" data-reveal="soft">
        <div className="about-label">Un poco sobre ella</div>
        <div className="about-text">
          <h2>Así es Marmota.</h2>
          <p>
            Cariñosa, atenta a todo y con unos dientes inconfundibles.
          </p>
        </div>
        <div className="about-facts">
          <div><span>Edad</span><strong>5 años</strong></div>
          <div><span>Raza</span><strong>Yorkshire</strong></div>
          <div><span>Nombre</span><strong>Marmota</strong></div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a href="#inicio">marmota.</a>
        <span>Una colección de fotos de Marmota.</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

function App() {
  const fotos = useFotos();

  return (
    <>
      <Header />
      <main>
        <Intro fotos={fotos} />
        <Galeria fotos={fotos} />
        <SobreElla />
        <Comentarios />
      </main>
      <Footer />
    </>
  );
}

export default App;
