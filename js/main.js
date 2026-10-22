/**
 * KERNIA — Soluciones de negocios
 * main.js — Interacciones base v1.0
 *
 * Estructura modular lista para escalar.
 * Cada sección está aislada; agregar nuevas funcionalidades
 * no requiere modificar el código existente.
 */

'use strict';

/* =============================================================
   MÓDULO: Utilidades
   ============================================================= */
const utils = {
  /**
   * Selector DOM con fallback silencioso.
   * @param {string} selector
   * @param {Element} [root=document]
   * @returns {Element|null}
   */
  qs(selector, root = document) {
    return root.querySelector(selector);
  },

  /**
   * Selector DOM múltiple.
   * @param {string} selector
   * @param {Element} [root=document]
   * @returns {NodeList}
   */
  qsa(selector, root = document) {
    return root.querySelectorAll(selector);
  },

  /**
   * Año actual para el footer.
   * @returns {number}
   */
  currentYear() {
    return new Date().getFullYear();
  },
};


/* =============================================================
   MÓDULO: Footer
   ============================================================= */
const footer = {
  init() {
    const yearEl = utils.qs('#year');
    if (yearEl) {
      yearEl.textContent = utils.currentYear();
    }
  },
};


/* =============================================================
   MÓDULO: Navegación
   Preparado para agregar menú móvil, scroll activo, etc.
   ============================================================= */
const nav = {
  init() {
    this.highlightOnScroll();
    this.initMobileMenu();
  },

  /**
   * Marca el enlace de navegación activo según la sección visible.
   * Requiere que los <li><a href="#id"> coincidan con secciones en el DOM.
   */
  highlightOnScroll() {
    const links = utils.qsa('.site-nav a[href^="#"]');
    if (!links.length) return;

    const sections = Array.from(links)
      .map((link) => {
        const id = link.getAttribute('href').slice(1);
        return { link, section: utils.qs(`#${id}`) };
      })
      .filter(({ section }) => section !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const match = sections.find(({ section }) => section === target);
          if (!match) return;
          match.link.setAttribute('aria-current', isIntersecting ? 'true' : 'false');
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach(({ section }) => observer.observe(section));
  },

  initMobileMenu() {
    const toggle = utils.qs('.nav-toggle');
    const navEl = utils.qs('.site-nav');
    if (!toggle || !navEl) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      navEl.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navEl.classList.toggle('is-open', !expanded);
    });

    utils.qsa('.site-nav a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        if (navEl.classList.contains('is-open')) close();
      });
    });
  },
};


/* =============================================================
   MÓDULO: Animaciones de entrada
   Preparado para observar elementos con data-animate.
   ============================================================= */
const animations = {
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.observeCards();
  },

  observeCards() {
    const cards = utils.qsa('.service-card');
    if (!cards.length) return;

    // Configuración inicial
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = `opacity 400ms ease ${i * 60}ms, transform 400ms ease ${i * 60}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
          observer.unobserve(target);
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
  },
};


/* =============================================================
   MÓDULO: Placeholder — Futuras integraciones
   Espacio reservado para:
   - Integración con APIs externas
   - Manejo de formularios de contacto
   - Widgets de WhatsApp
   - Inicialización de componentes 3D (Three.js, etc.)
   ============================================================= */
const integrations = {
  init() {
    // TODO: inicializar integraciones cuando estén disponibles
  },
};


/* =============================================================
   INICIALIZACIÓN PRINCIPAL
   Se ejecuta cuando el DOM está completamente cargado.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  footer.init();
  nav.init();
  animations.init();
  integrations.init();
});
