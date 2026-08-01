import { useEffect, useRef, useState } from "react";
import "./App.css";

const curiosidades = [
  {
    number: "01",
    title: "Ternura sin medida",
    text: "Le encanta estar cerca, pedir cariño y transformar cualquier momento normal en uno especial.",
    tag: "Modo regalona",
  },
  {
    number: "02",
    title: "Pequeña guardiana",
    text: "Tiene tamaño Yorkshire, pero vigila la casa con la seguridad de quien cree medir dos metros.",
    tag: "Valentía XL",
  },
  {
    number: "03",
    title: "Dientes legendarios",
    text: "Su cara dulce esconde una sonrisa inolvidable: grandes dientes que ya son parte de su sello personal.",
    tag: "Sonrisa única",
  },
];

const fotos = [
  {
    src: "/images/marmota-1.jpg",
    alt: "Marmota disfrutando uno de sus momentos favoritos",
    caption: "Su mejor ángulo",
  },
  {
    src: "/images/marmota-2.jpg",
    alt: "Marmota mirando atentamente a la cámara",
    caption: "Mirada de jefa",
  },
  {
    src: "/images/marmota-3.jpg",
    alt: "Una fotografía especial de Marmota",
    caption: "Día de aventura",
  },
  {
    src: "/images/marmota-4.jpg",
    alt: "Marmota descansando tranquilamente",
    caption: "Pausa merecida",
  },
  {
    src: "/images/marmota-5.jpg",
    alt: "Marmota posando con mucha personalidad",
    caption: "Actitud Yorkshire",
  },
  {
    src: "/images/marmota-6.jpg",
    alt: "Otro momento inolvidable de Marmota",
    caption: "Momento Marmota",
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
          <a href="#galeria" onClick={closeMenu}>Galería</a>
          <a className="nav-pill" href="#final" onClick={closeMenu}>Conócela</a>
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
            Una Yorkshire muy especial
          </div>

          <h1 className="hero-title" aria-label="Hola, soy Marmota">
            <span className="title-line title-line-one">Hola, soy</span>
            <span className="title-line title-line-two">Marmota<span>.</span></span>
          </h1>

          <p className="hero-copy hero-enter hero-enter-4">
            Cinco años de ternura, carácter y una sonrisa imposible de olvidar.
            Es pequeña por fuera, enorme de corazón y absolutamente dueña de la casa.
          </p>

          <div className="hero-actions hero-enter hero-enter-5">
            <a className="primary-button" href="#historia">
              <span>Conoce su historia</span>
              <i aria-hidden="true">↘</i>
            </a>

            <a className="secondary-button" href="#galeria">
              Ver fotografías
            </a>
          </div>

          <div className="hero-meta hero-enter hero-enter-6">
            <div className="meta-item">
              <strong>5</strong>
              <span>Años de aventuras</span>
            </div>
            <div className="meta-divider" aria-hidden="true" />
            <div className="meta-item">
              <strong>100%</strong>
              <span>Personalidad</span>
            </div>
            <div className="meta-divider" aria-hidden="true" />
            <div className="meta-item">
              <strong>∞</strong>
              <span>Ternura</span>
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

          <div className="floating-card floating-card-top">
            <span className="floating-icon">M</span>
            <div>
              <strong>Pequeña guardiana</strong>
              <small>Valentía tamaño XL</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-icon">5</span>
            <div>
              <strong>Cinco años</strong>
              <small>de historias inolvidables</small>
            </div>
          </div>

          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
        </div>
      </div>

      <a className="scroll-cue" href="#historia" aria-label="Bajar a la historia de Marmota">
        <span>Descubrir</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}

function Marquee() {
  const items = ["Yorkshire", "Tierna", "Valiente", "Regalona", "Grandes dientes", "Pequeña jefa"];
  const repeatedItems = [...items, ...items];

  return (
    <section className="marquee-section" aria-label="Características de Marmota">
      <div className="marquee-track">
        {repeatedItems.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}<i aria-hidden="true">✦</i>
          </span>
        ))}
      </div>
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
            <span>años llenando cada rincón de alegría</span>
          </div>

          <span className="story-note">La protagonista</span>
        </div>

        <div className="story-content" data-reveal="right">
          <span className="section-label">Su historia</span>
          <h2>Una compañera pequeña con una presencia enorme.</h2>

          <p className="lead-text">
            Marmota llegó para convertir los días comunes en pequeñas historias.
            Desde entonces, cada paseo, siesta y mirada seria tiene algo que contar.
          </p>

          <p>
            Es cariñosa, observadora y muy segura de sí misma. Su tamaño contrasta
            con un carácter gigante y con esos dientes que aparecen justo cuando
            quiere recordarnos que, en realidad, ella dirige la casa.
          </p>

          <div className="story-list">
            <div className="story-list-item">
              <span>01</span>
              <p>Especialista en conseguir atención sin decir una palabra.</p>
            </div>
            <div className="story-list-item">
              <span>02</span>
              <p>Supervisa personalmente cada movimiento de la familia.</p>
            </div>
            <div className="story-list-item">
              <span>03</span>
              <p>Puede pasar de máxima ternura a guardiana oficial en segundos.</p>
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
          <h2>Todo lo que hace que Marmota sea Marmota.</h2>
          <p>
            Ternura, elegancia, carácter y una dosis perfectamente calculada de dramatismo Yorkshire.
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

function Quote() {
  return (
    <section className="quote-section">
      <div className="quote-word" aria-hidden="true">MARMOTA</div>
      <div className="container quote-content" data-reveal="scale">
        <span className="quote-icon">“</span>
        <blockquote>
          Pequeña por fuera, gigante de corazón y con suficientes dientes para
          recordarnos quién manda en casa.
        </blockquote>
        <div className="quote-author">
          <span />
          <p>Marmota, probablemente</p>
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
            <h2>Momentos que merecen quedarse.</h2>
          </div>
          <p>
            Un pequeño archivo visual de miradas, aventuras, poses serias y descansos profesionales.
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
        <span className="section-label">La conclusión oficial</span>
        <h2>El mundo es un poco mejor con Marmota en él.</h2>
        <p>
          Cinco años, miles de recuerdos y una personalidad que no cabe en una sola página.
        </p>
        <a className="final-button" href="#inicio">
          Volver a verla <span aria-hidden="true">↑</span>
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

        <p>Diseñada con cariño para una Yorkshire inolvidable.</p>

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
        <Marquee />
        <Historia />
        <Personalidad />
        <Quote />
        <Galeria />
        <FinalSection />
      </main>
      <Footer />
    </>
  );
}

export default App;