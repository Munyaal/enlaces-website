/**
 * reveal.ts
 *
 * Utilidad para añadir entradas sutiles a elementos del home usando GSAP +
 * ScrollTrigger. Pensada para mantener la animación localizada en
 * scripts por componente, evitando duplicar la lógica de reveal en cada
 * uno y centralizando el cumplimiento de tres reglas críticas:
 *
 *   1. Respetar `prefers-reduced-motion`. Si el usuario prefiere reducir
 *      movimiento, no se oculta el contenido y no se anima nada.
 *   2. Si JS falla, el contenido debe permanecer visible. Nunca se
 *      aplica estado inicial desde CSS; el `gsap.set()` se ejecuta
 *      únicamente cuando JS está vivo y el medio permite animación.
 *   3. Sólo se anima `opacity` y `transform` (`y`). Nunca propiedades de
 *      layout (height, width, top, margin, padding, etc.).
 *
 * El módulo registra ScrollTrigger perezosamente la primera vez que se
 * usa `revealOnEnter`, para que el helper "inmediato" del Hero no
 * descargue el plugin si nadie lo necesita.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Media query nativo: sólo animamos cuando el usuario no pidió reducir. */
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

/** Acumulamos registros para no llamar `registerPlugin` más de una vez. */
let scrollTriggerRegistered = false;

const ensureScrollTrigger = () => {
  if (scrollTriggerRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
};

const DEFAULT_DURATION = 0.6;
const DEFAULT_Y = 16;
const DEFAULT_START = "top 85%";

/** Opciones comunes a ambos helpers. */
interface BaseOptions {
  /** Selector CSS relativo al `root` (por defecto, `document`). */
  selector: string;
  /** Elemento contenedor para acotar la búsqueda. */
  root?: ParentNode | Element | null;
  /** Distancia inicial en píxeles sobre el eje Y (entra desde abajo). */
  y?: number;
  /** Duración del tween en segundos. */
  duration?: number;
  /** Stagger entre elementos. `false` desactiva el stagger. */
  stagger?: number | false;
  /** Delay inicial (sólo `revealImmediately`). */
  delay?: number;
}

/** Opciones adicionales exclusivas del reveal por scroll. */
interface ScrollOptions extends BaseOptions {
  /** Punto de disparo de ScrollTrigger. */
  start?: string;
}

/**
 * Resuelve el `root` a un `ParentNode` válido. Si se pasa `null`
 * (típico al encadenar `querySelector(...)`) cae a `document` para
 * mantener el contrato de búsqueda global.
 */
const resolveRoot = (root: BaseOptions["root"]): ParentNode =>
  (root as ParentNode | null) ?? document;

/**
 * Revela elementos al entrar al viewport usando ScrollTrigger.batch con
 * `once: true`. Stagger opcional para grupos naturales (tarjetas,
 * logos, etc.).
 */
export const revealOnEnter = (options: ScrollOptions): void => {
  ensureScrollTrigger();

  const root = resolveRoot(options.root);
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(options.selector),
  );
  if (targets.length === 0) return;

  // gsap.matchMedia evalúa la media query con el navegador y se re-engancha
  // automáticamente si el usuario cambia la preferencia en tiempo real.
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    const fromVars = { opacity: 0, y: options.y ?? DEFAULT_Y };

    gsap.set(targets, fromVars);

    ScrollTrigger.batch(targets, {
      start: options.start ?? DEFAULT_START,
      once: true,
      onEnter: (batch) => {
        const toVars: gsap.TweenVars = {
          opacity: 1,
          y: 0,
          duration: options.duration ?? DEFAULT_DURATION,
          ease: "power2.out",
        };
        if (options.stagger !== false) {
          toVars.stagger = options.stagger ?? 0;
        }
        gsap.to(batch, toVars);
      },
    });

    // Cleanup al revertirse el contexto (p.ej. el usuario activa reduced
    // motion durante la sesión): gsap.revert() restaura estilos inline.
    return () => mm.revert();
  });
};

/**
 * Revela elementos inmediatamente tras la carga, sin ScrollTrigger.
 * Pensado para el Hero, donde la animación debe dispararse antes de
 * que el usuario haga scroll. Respeta igualmente `prefers-reduced-motion`.
 */
export const revealImmediately = (options: BaseOptions): void => {
  const root = resolveRoot(options.root);
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(options.selector),
  );
  if (targets.length === 0) return;

  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    const fromVars = { opacity: 0, y: options.y ?? DEFAULT_Y };
    gsap.set(targets, fromVars);

    const toVars: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      duration: options.duration ?? DEFAULT_DURATION,
      ease: "power2.out",
      delay: options.delay ?? 0,
    };
    if (options.stagger !== false) {
      toVars.stagger = options.stagger ?? 0;
    }
    gsap.to(targets, toVars);

    return () => mm.revert();
  });
};