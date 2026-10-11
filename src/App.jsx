import { useEffect, useRef, useState } from "react";
import "./App.css";
import Comentarios from "./components/Comentarios.jsx";

const curiosidades = [
  {
    number: "01",
    title: "Siempre cerca",
    text: "Le gusta que le hagan cariño y estar donde está el resto de la familia.",
    tag: "Cariñosa",
  },
  {
    number: "02",
    title: "No se le escapa nada",
    text: "Está atenta a los ruidos y siempre sabe cuándo alguien llega.",
    tag: "Atenta",
  },
  {
    number: "03",
    title: "Sus famosos dientes",
    text: "Su sonrisa es una de las cosas que más llaman la atención cuando la conoces.",
    tag: "Inconfundible",
  },
];

const fotos = [
  {
    src: "/images/marmota-1.jpg",
    alt: "Marmota disfrutando uno de sus momentos favoritos",
    caption: "Una de mis favoritas",
  },
  {
    src: "/images/marmota-2.jpg",
    alt: "Marmota mirando atentamente a la cámara",
    caption: "Muy atenta",
  },
  {
    src: "/images/marmota-3.jpg",
    alt: "Una fotografía especial de Marmota",
    caption: "De paseo",
  },
  {
    src: "/images/marmota-4.jpg",
    alt: "Marmota descansando tranquilamente",
    caption: "Hora de descansar",
  },
  {
    src: "/images/marmota-5.jpg",
    alt: "Marmota posando con mucha personalidad",
    caption: "Posando",
  },
  {
    src: "/images/marmota-6.jpg",
    alt: "Otro momento inolvidable de Marmota",
    caption: "Otra de Marmota",
  },
];

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -70px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = null;

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
      frameId = null;
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}

function PointerGlow() {
  useEffect(() => {
    const glow = document.querySelector(".pointer-glow");
    if (!glow || !window.matchMedia("(pointer: fine)").matches) return undefined;

    let frameId = null;
    let x = -200;
    let y = -200;

    const paint = () => {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frameId = null;
    };

    const handlePointerMove = (event) => {
      x = event.clientX - 180;
      y = event.clientY - 180;
      if (frameId === null) frameId = window.requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <div className="pointer-glow" aria-hidden="true" />;
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <i />
    </span>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <ScrollProgress />

      <div className="container navbar-content">
        <a className="logo" href="#inicio" aria-label="Ir al inicio" onClick={closeMenu}>
          <BrandMark />
          <span className="logo-text">Marmota<span>.</span></span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={menuOpen ? "is-open" : ""}
          aria-label="Navegación principal"
        >
          <a href="#historia" onClick={closeMenu}>Historia</a>
          <a href="#personalidad" onClick={closeMenu}>Personalidad</a>
          <a href="#galeria" onClick={closeMenu}>Fotos</a>
          <a className="nav-pill" href="#comentarios" onClick={closeMenu}>Comentarios</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const visualRef = useRef(null);

  const handlePointerMove = (event) => {
    if (!window.matchMedia("(pointer: fine)").matches || !visualRef.current) return;

    const bounds = visualRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    visualRef.current.style.setProperty("--tilt-x", `${y * -8}deg`);
    visualRef.current.style.setProperty("--tilt-y", `${x * 10}deg`);
    visualRef.current.style.setProperty("--shift-x", `${x * 15}px`);
    visualRef.current.style.setProperty("--shift-y", `${y * 15}px`);
  };

  const resetTilt = () => {
    if (!visualRef.current) return;
    visualRef.current.style.setProperty("--tilt-x", "0deg");
    visualRef.current.style.setProperty("--tilt-y", "0deg");
    visualRef.current.style.setProperty("--shift-x", "0px");
    visualRef.current.style.setProperty("--shift-y", "0px");
  };

  return (
    <section className="hero" id="inicio">
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="hero-lines" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-content">
          <div className="eyebrow hero-enter hero-enter-1">
            <span className="eyebrow-dot" />
            Una Yorkshire llamada Marmota
          </div>

          <h1 className="hero-title" aria-label="Hola, soy Marmota">
            <span className="title-line title-line-one">Hola, soy</span>
            <span className="title-line title-line-two">Marmota<span>.</span></span>
          </h1>

          <p className="hero-copy hero-enter hero-enter-4">
            Tiene cinco años, mucho carácter y unos dientes que no pasan desapercibidos.
            Aquí juntamos algunas fotos y recuerdos de ella.
          </p>

          <div className="hero-actions hero-enter hero-enter-5">
            <a className="primary-button" href="#galeria">
              <span>Ver sus fotos</span>
              <i aria-hidden="true">↘</i>
            </a>

            <a className="secondary-button" href="#comentarios">
              Dejarle un mensaje
            </a>
          </div>

          <div className="hero-meta hero-enter hero-enter-6">
            <div className="meta-item">
              <strong>5</strong>
              <span>años</span>
            </div>
            <div className="meta-divider" aria-hidden="true" />
            <div className="meta-item">
              <strong>Yorkshire</strong>
              <span>su raza</span>
            </div>
            <div className="meta-divider" aria-hidden="true" />
            <div className="meta-item">
              <strong>Chile</strong>
              <span>su hogar</span>
            </div>
          </div>
        </div>

        <div
          ref={visualRef}
          className="hero-visual hero-enter hero-enter-3"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <div className="hero-image-card">
            <div className="hero-image-mask">
              <img
                className="hero-image"
                src="/images/marmota-portada.jpg"
                alt="Fotografía principal de Marmota"
              />
            </div>

            <span className="image-index">M / 05</span>
            <span className="image-caption">Yorkshire · Chile</span>
          </div>

        </div>
      </div>

      <a className="scroll-cue" href="#historia" aria-label="Bajar a la historia de Marmota">
        <span>Descubrir</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}

function Historia() {
  return (
    <section className="section story-section" id="historia">
      <div className="section-number" aria-hidden="true">01</div>

      <div className="container story-grid">
        <div className="story-visual" data-reveal="left">
          <div className="story-image-wrapper">
            <img
              className="story-image"
              src="/images/marmota-historia.jpg"
              alt="Marmota durante uno de sus momentos especiales"
              loading="lazy"
            />
            <div className="story-image-shine" aria-hidden="true" />
          </div>

          <div className="story-badge">
            <strong>5</strong>
            <span>años de vida</span>
          </div>

          <span className="story-note">Marmota</span>
        </div>

        <div className="story-content" data-reveal="right">
          <span className="section-label">Su historia</span>
          <h2>Así es Marmota.</h2>

          <p className="lead-text">
            Marmota es una Yorkshire de cinco años. Le gusta estar acompañada
            y tiene su propia manera de pedir atención.
          </p>

          <p>
            Es cariñosa, está pendiente de lo que pasa a su alrededor y tiene
            una sonrisa que es difícil confundir con otra.
          </p>

          <div className="story-list">
            <div className="story-list-item">
              <span>01</span>
              <p>Le encanta que le hagan cariño.</p>
            </div>
            <div className="story-list-item">
              <span>02</span>
              <p>Está pendiente de cualquier ruido.</p>
            </div>
            <div className="story-list-item">
              <span>03</span>
              <p>Tiene unos dientes difíciles de olvidar.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Personalidad() {
  return (
    <section className="section personality-section" id="personalidad">
      <div className="personality-orb" aria-hidden="true" />

      <div className="container">
        <div className="section-heading" data-reveal="up">
          <span className="section-label light-label">Su personalidad</span>
          <h2>Tres cosas sobre ella.</h2>
          <p>
            Un poco de su personalidad, para quienes todavía no la conocen.
          </p>
        </div>

        <div className="cards-grid">
          {curiosidades.map((curiosidad, index) => (
            <article
              className="info-card personality-card"
              key={curiosidad.title}
              data-reveal="up"
              style={{ "--delay": `${index * 120}ms` }}
            >
              <div className="card-topline">
                <span className="card-number">{curiosidad.number}</span>
                <span className="card-tag">{curiosidad.tag}</span>
              </div>
              <h3>{curiosidad.title}</h3>
              <p>{curiosidad.text}</p>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryLightbox({ activePhoto, onClose, onPrevious, onNext }) {
  useEffect(() => {
    if (!activePhoto) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, onClose, onPrevious, onNext]);

  if (!activePhoto) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Fotografía ampliada">
      <button className="lightbox-backdrop" type="button" onClick={onClose} aria-label="Cerrar galería" />
      <div className="lightbox-panel">
        <button className="lightbox-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <button className="lightbox-nav lightbox-prev" type="button" onClick={onPrevious} aria-label="Foto anterior">←</button>
        <img src={activePhoto.src} alt={activePhoto.alt} />
        <div className="lightbox-caption">
          <span>{activePhoto.position}</span>
          <p>{activePhoto.caption}</p>
        </div>
        <button className="lightbox-nav lightbox-next" type="button" onClick={onNext} aria-label="Foto siguiente">→</button>
      </div>
    </div>
  );
}

function Galeria() {
  const [activeIndex, setActiveIndex] = useState(null);

  const closeLightbox = () => setActiveIndex(null);
  const showPrevious = () => setActiveIndex((current) => (current - 1 + fotos.length) % fotos.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % fotos.length);

  const activePhoto = activeIndex === null
    ? null
    : {
        ...fotos[activeIndex],
        position: `${String(activeIndex + 1).padStart(2, "0")} / ${String(fotos.length).padStart(2, "0")}`,
      };

  return (
    <section className="section gallery-section" id="galeria">
      <div className="section-number section-number-right" aria-hidden="true">02</div>

      <div className="container">
        <div className="section-heading gallery-heading" data-reveal="up">
          <div>
            <span className="section-label">Galería</span>
            <h2>Fotos de Marmota.</h2>
          </div>
          <p>
            Algunas de nuestras fotos favoritas.
          </p>
        </div>

        <div className="gallery-grid">
          {fotos.map((foto, index) => (
            <button
              className="gallery-item"
              type="button"
              key={foto.src}
              onClick={() => setActiveIndex(index)}
              aria-label={`Abrir fotografía ${index + 1}: ${foto.caption}`}
              data-reveal="up"
              style={{ "--delay": `${(index % 3) * 100}ms` }}
            >
              <img src={foto.src} alt={foto.alt} loading="lazy" />
              <span className="gallery-overlay" aria-hidden="true" />
              <span className="gallery-corner" aria-hidden="true">↗</span>
              <span className="gallery-caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{foto.caption}</strong>
              </span>
            </button>
          ))}
        </div>
      </div>

      <GalleryLightbox
        activePhoto={activePhoto}
        onClose={closeLightbox}
        onPrevious={showPrevious}
        onNext={showNext}
      />
    </section>
  );
}

function FinalSection() {
  return (
    <section className="final-section" id="final">
      <div className="final-rings" aria-hidden="true" />
      <div className="container final-content" data-reveal="scale">
        <span className="section-label">Un poco de Marmota</span>
        <h2>Eso es Marmota.</h2>
        <p>
          Gracias por pasar a conocerla. Si tienes mascota, puedes dejarle un mensaje.
        </p>
        <a className="final-button" href="#inicio">
          Volver al inicio <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <a className="footer-brand" href="#inicio">
          <BrandMark />
          <span>Marmota.</span>
        </a>

        <p>Una página para guardar sus fotos y recuerdos.</p>

        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

function App() {
  useRevealOnScroll();

  return (
    <>
      <PointerGlow />
      <Navbar />
      <main>
        <Hero />
        <Historia />
        <Personalidad />
        <Galeria />
        <Comentarios />
        <FinalSection />
      </main>
      <Footer />
    </>
  );
}

export default App;