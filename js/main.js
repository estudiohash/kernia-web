/**
 * KERNIA — Soluciones de negocios
 * main.js — Interacciones base v1.0
 *
 * Estructura modular lista para escalar.
 * Cada sección está aislada; agregar nuevas funcionalidades
 * no requiere modificar el código existente.
 */

'use strict';

import * as THREE from 'three';

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
   - Componentes 3D interactivos
   ============================================================= */
const integrations = {
  init() {
    // Integraciones externas pendientes.
  },
};

/* =============================================================
   MÓDULO: Mundo 3D persistente
   Implementa una experiencia scrollytelling con Three.js:
   - Un solo renderer y escena persistente
   - Scroll nativo mapeado a progreso normalizado
   - Varios capítulos visuales sin cambiar de escena
   - Transiciones suaves y responsive
   ============================================================= */
const world3d = {
  enabled: true,
  renderer: null,
  scene: null,
  camera: null,
  raf: null,
  chapters: [],
  chapterTargets: [],
  clock: null,

  init() {
    if (!this.enabled) return;
    try {
      this.clock = new THREE.Clock();
      this.setupScene();
      this.buildWorld();
      this.mapChapters();
      this.bindScroll();
      this.resize();
      this.animate();

      window.addEventListener('resize', () => this.resize());
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.enabled = false;
      }
    } catch (e) {
      console.warn('Kernia 3D deshabilitado:', e);
      this.enabled = false;
    }
  },

  setupScene() {
    const canvas = document.getElementById('world-canvas');
    if (!canvas) return;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.scene.fog = new THREE.Fog('#0a0c10', 6, 18);
  },

  buildWorld() {
    const scene = this.scene;

    // Luces
    scene.add(new THREE.AmbientLight('#5b6aff', 0.7));

    const key = new THREE.DirectionalLight('#ffffff', 1.1);
    key.position.set(3, 4, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight('#7aa8ff', 0.9);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    // Materiales reutilizables
    const materialAccent = new THREE.MeshStandardMaterial({ color: '#4f7cff', roughness: 0.25, metalness: 0.65 });
    const materialSurface = new THREE.MeshStandardMaterial({ color: '#181c24', roughness: 0.55, metalness: 0.35 });
    const materialWire = new THREE.MeshBasicMaterial({ color: '#2a3558', wireframe: true, transparent: true, opacity: 0.35 });

    // Grupo raíz del mundo
    this.world = new THREE.Group();
    scene.add(this.world);

    // Núcleo central
    this.core = new THREE.Group();
    const coreGeo = new THREE.IcosahedronGeometry(0.9, 2);
    this.coreMesh = new THREE.Mesh(coreGeo, materialAccent);
    this.core.add(this.coreMesh);
    scene.add(this.core);

    // Anillo orbital
    this.ring = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.7, 0.04, 16, 110);
    const ringMesh = new THREE.Mesh(ringGeo, materialSurface);
    this.ring.add(ringMesh);
    scene.add(this.ring);

    // Partículas flotantes
    this.particles = new THREE.Group();
    const geo = new THREE.SphereGeometry(0.06, 12, 12);
    for (let i = 0; i < 35; i++) {
      const mesh = new THREE.Mesh(geo, materialSurface);
      mesh.position.set(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6
      );
      mesh.userData = {
        base: mesh.position.clone(),
        speed: 0.4 + Math.random() * 1.2,
        amp: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
      };
      this.particles.add(mesh);
    }
    scene.add(this.particles);

    // Rejilla wireframe como detalle tecnológico
    const gridGeo = new THREE.PlaneGeometry(20, 20, 18, 18);
    const grid = new THREE.Mesh(gridGeo, materialWire);
    grid.rotation.x = -Math.PI / 2.3;
    grid.position.z = -3.5;
    scene.add(grid);
  },

  mapChapters() {
    const ids = ['hero', 'servicios', 'metodologia', 'demo', 'contacto'];
    this.chapters = ids.map((id) => document.getElementById(id)).filter(Boolean);

    this.chapterTargets = [
      { cam: [0, 0, 8], world: [0, 0, 0], ring: [0, 0, 0] },
      { cam: [2.2, 0.4, 7.2], world: [-1.1, 0.2, 0], ring: [Math.PI / 3, 0.3, 0] },
      { cam: [-2, -0.2, 7.6], world: [0.9, -0.15, 0], ring: [-Math.PI / 3, -0.2, 0] },
      { cam: [0, 0.5, 8], world: [0, 0.4, 0.6], ring: [0, Math.PI / 2, 0] },
      { cam: [0, -0.1, 7.8], world: [0, -0.3, -0.4], ring: [0, -Math.PI / 4, 0] },
    ];
  },

  bindScroll() {
    this.onScroll = () => this.syncFromScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.syncFromScroll();
  },

  syncFromScroll() {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    const chapterCount = Math.max(1, this.chapters.length - 1);
    const fractional = progress * chapterCount;
    this.exact = fractional;
  },

  resize() {
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  sampleTarget(t) {
    const clamped = Math.max(0, Math.min(1, t));
    const idx = clamped * (this.chapterTargets.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = this.chapterTargets[i];
    const b = this.chapterTargets[Math.min(i + 1, this.chapterTargets.length - 1)];
    const smooth = f < 0.5 ? 2 * f * f : -1 + (4 - 2 * f) * f;
    const next = (arr) => arr.map((v, idx) => this.lerp(a[idx], b[idx], smooth));
    return { cam: next(a.cam), world: next(a.world), ring: next(a.ring) };
  },

  animate() {
    if (!this.enabled) return;
    this.raf = requestAnimationFrame(() => this.animate());
    const dt = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    const exact = this.exact ?? 0;
    const target = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? exact : this.smoothTarget(exact);
    const state = this.sampleTarget(target);

    // Cámara
    this.camera.position.set(...state.cam);

    // Mundo
    this.world.position.set(...state.world);
    this.world.rotation.y += 0.004;

    // Anillo
    this.ring.rotation.set(...state.ring);
    this.ring.rotation.y += 0.02;

    // Núcleo
    this.core.rotation.x += 0.01;
    this.core.rotation.y += 0.015;

    // Partículas
    this.particles.children.forEach((mesh) => {
      const { base, speed, amp, phase } = mesh.userData;
      mesh.position.y = base.y + Math.sin(elapsed * speed + phase) * amp;
      mesh.position.x = base.x + Math.cos(elapsed * speed * 0.7 + phase) * amp * 0.7;
    });

    this.renderer.render(this.scene, this.camera);
  },

  smoothTarget(target) {
    if (!this.smooth) this.smooth = target;
    this.smooth += (target - this.smooth) * Math.min(1, 6 * this.clock.getDelta ? this.clock.getDelta() : 0.016);
    return this.smooth;
  },
};

/* =============================================================
   INICIALIZACIÓN PRINCIPAL
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  footer.init();
  nav.init();
  animations.init();
  integrations.init();
  world3d.init();
});
