/**
 * reveal.ts
 *
 * Núcleo único de animaciones de entrada del sitio (GSAP + ScrollTrigger).
 *
 * Contrato:
 *   1. Sólo se animan `opacity` y `transform` (`y`, y el `scale` del Ken
 *      Burns). Nunca propiedades de layout (height, width, top, margin…).
 *   2. Se respeta `prefers-reduced-motion`: con "reduce" no se oculta ni
 *      se anima nada, y el contenido queda visible desde el primer paint.
 *   3. Sin JS el contenido también es visible: no existe estado inicial
 *      en CSS; el `gsap.set()` ocurre únicamente cuando JS vive y el
 *      medio permite animación.
 *   4. Todas las animaciones de una página comparten un único
 *      `gsap.matchMedia()`, creado de forma perezosa. Al cambiar la
 *      preferencia en sesión, GSAP revierte cada contexto (reduce →
 *      visible y sin movimiento) y lo vuelve a crear al desactivarlo
 *      (el Ken Burns regresa), sin llamadas manuales a `revert()`.
 *      Un elemento ya revelado no se vuelve a ocultar al recrear el
 *      contexto: se marca con `data-revealed` y, además, se omiten los
 *      que ya pasaron la línea de disparo.
 *   5. La API por scope es fail-closed: si `[data-reveal-scope]` no
 *      existe, avisa por consola y no anima. Nunca cae a `document`,
 *      así un scope inválido no puede tocar los `[data-reveal]` de toda
 *      la página. Un scope puede repetirse en la página y se inicializa
 *      cada root encontrado.
 *   6. El reveal respeta la opacidad final de diseño: antes de ocultar
 *      guarda la opacidad computada y anima hacia ella, no siempre a `1`.
 *   7. Cambiar `prefers-reduced-motion` en sesión no mueve el scroll:
 *      una guarda restaura la posición tras la reversión de GSAP.
 *
 * Qué preset usar:
 *   - `hero`: contenido above the fold (H1, kicker, divisor, CTAs). Se
 *     revela de inmediato, sin ScrollTrigger.
 *   - `section`: bloque de contenido (título + copy + media) al entrar
 *     al viewport.
 *   - `list`: rejillas y listas (tarjetas, logos, testimonios) donde el
 *     stagger debe sentirse más marcado.
 *
 * Contadores numéricos (`countUp`): no son un reveal, porque animan el
 * *contenido* de un número y no su opacidad/posición. Aun así viven en
 * este módulo para compartir el `gsap.matchMedia()` y respetar
 * `prefers-reduced-motion` con las mismas reglas que el resto.
 *
 * Escala de duraciones del sitio (CSS, sin tokens nuevos):
 *   - 150 ms: color / hover de texto.
 *   - 200 ms: botones y controles.
 *   - 300 ms: superficies y sombras.
 *   - ambiente: 8 s (Ken Burns del hero).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Media query nativo: sólo animamos cuando el usuario no pidió reducir. */
const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

/**
 * Línea de disparo de los reveals por scroll. `START_RATIO` debe
 * coincidir con el porcentaje de `START`: se usa para saber qué
 * elementos ya pasaron el umbral y no deben volver a ocultarse.
 */
const START = "top 85%";
const START_RATIO = 0.85;

/**
 * Presets normalizados de entrada. Son la única fuente de `y`, `duration`
 * y `stagger` para los reveals; ningún componente pasa números sueltos.
 * El easing (`power2.out`) se aplica dentro de los helpers.
 */
export const REVEAL_PRESETS = {
  /** Above the fold: entrada inmediata y desplazamiento mínimo. */
  hero: { y: 12, duration: 0.5, stagger: 0.08 },
  /** Bloque de contenido al hacer scroll. */
  section: { y: 16, duration: 0.5, stagger: 0.08 },
  /** Rejillas/listas: mismo desplazamiento, stagger más marcado. */
  list: { y: 16, duration: 0.5, stagger: 0.12 },
} as const;

/** Nombre válido de preset. */
export type RevealPreset = keyof typeof REVEAL_PRESETS;

/** Valores concretos que aporta un preset. */
export type RevealPresetValues = (typeof REVEAL_PRESETS)[RevealPreset];

/** Opciones del Ken Burns ambiental del hero. */
export interface AmbientZoomOptions {
  /** Scope que contiene la imagen (`[data-reveal-scope="<scope>"]`). */
  scope: string;
  /** Selector de la imagen dentro del scope. */
  selector?: string;
  /** Escala máxima del ciclo. */
  scale?: number;
  /** Duración de cada tramo del ciclo, en segundos. */
  duration?: number;
}

/**
 * Opciones internas de los helpers de entrada. Siempre reciben el
 * `root` ya resuelto y los valores completos de un preset, por eso no
 * hay defaults sueltos ni selectores globales.
 */
interface RevealTargetsOptions {
  /** Contenedor acotado del scope. */
  root: ParentNode;
  /** Selector relativo al `root` (default: `[data-reveal]`). */
  selector?: string;
  /** Distancia inicial en píxeles sobre el eje Y (entra desde abajo). */
  y: number;
  /** Duración del tween en segundos. */
  duration: number;
  /** Stagger entre elementos. `false` desactiva el stagger. */
  stagger: number | false;
}

/** Acumulamos registros para no llamar `registerPlugin` más de una vez. */
let scrollTriggerRegistered = false;
let fontRefreshRegistered = false;

/**
 * Guarda de posición de scroll ante cambios de `prefers-reduced-motion`.
 *
 * Contexto: al cambiar la preferencia, `gsap.matchMedia()` revierte sus
 * contextos y ScrollTrigger ejecuta `_refreshAll`, que normaliza cada
 * scroller con `obj(0)`. Cuando la memoria de scroll ya se limpió, esa
 * normalización deja la página al inicio (regresión reproducida en `/`
 * y `/nosotros`). Guardamos la posición en el propio handler —antes de
 * que GSAP reaccione— y la restauramos en el frame siguiente.
 *
 * Se puede retirar si una versión futura de GSAP/ScrollTrigger deja de
 * resetear el scroll al revertir contextos. El guard es idempotente por
 * módulo y se instala antes de crear los contextos de animación.
 */
let scrollPositionGuardInstalled = false;

const installScrollPositionGuard = (): void => {
  if (scrollPositionGuardInstalled) return;
  scrollPositionGuardInstalled = true;

  window
    .matchMedia(NO_PREFERENCE)
    .addEventListener("change", () => {
      const left = window.scrollX;
      const top = window.scrollY;

      // Un frame basta en Chrome: para cuando corre este callback,
      // ScrollTrigger ya normalizó el scroller. Si una versión futura
      // difiere el refresh, subir a dos `requestAnimationFrame` anidados.
      requestAnimationFrame(() => {
        window.scrollTo({ top, left, behavior: "instant" });
      });
    });
};

/**
 * Registra ScrollTrigger una sola vez y refresca una sola vez cuando
 * terminan de cargar las fuentes.
 *
 * ScrollTrigger ya refresca en `load`/`DOMContentLoaded`; el único
 * motivo para un refresh extra es `font-display: swap`, que puede
 * reflowear y mover los triggers. Las imágenes lazy no lo necesitan:
 * Astro emite `width`/`height` y el layout no cambia al cargarlas.
 */
const ensureScrollTrigger = (): void => {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }

  if (fontRefreshRegistered) return;
  fontRefreshRegistered = true;
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
};

/**
 * `gsap.matchMedia()` compartido por todas las animaciones de la página.
 * Se crea en la primera llamada y cada helper añade su propio contexto
 * con `mm.add(NO_PREFERENCE, …)`, de modo que GSAP gestiona el ciclo de
 * vida (revertir al activar reduce y reanudar al desactivarlo).
 */
let animationMedia: gsap.MatchMedia | null = null;

const getAnimationMedia = (): gsap.MatchMedia => {
  animationMedia ??= gsap.matchMedia();
  return animationMedia;
};

/**
 * Resuelve todos los contenedores de un scope. Fail-closed: si no existe
 * ninguno, avisa por consola y devuelve `[]` para que el llamador omita
 * la animación; nunca cae a `document`.
 *
 * Un mismo scope puede repetirse en la página (varios bloques que
 * comparten animación): se inicializa cada root encontrado. El valor se
 * escapa con `CSS.escape` para que un scope con caracteres especiales no
 * rompa el selector.
 */
const resolveScopeRoots = (scope: string): Element[] => {
  const roots = Array.from(
    document.querySelectorAll(`[data-reveal-scope="${CSS.escape(scope)}"]`),
  );

  if (roots.length === 0) {
    console.warn(
      `[reveal] No existe [data-reveal-scope="${scope}"]. Se omite la animación.`,
    );
  }

  return roots;
};

/**
 * Valida el preset en runtime: un nombre inexistente no debe caer
 * silenciosamente a los valores por defecto.
 */
const resolvePreset = (
  preset: string,
  caller: string,
): RevealPresetValues | null => {
  if (!(preset in REVEAL_PRESETS)) {
    console.warn(
      `[reveal] Preset "${preset}" inexistente en ${caller}(). Se omite la animación.`,
    );
    return null;
  }

  return REVEAL_PRESETS[preset as RevealPreset];
};

/**
 * Guarda la opacidad final de diseño antes de ocultar un elemento.
 *
 * Algunos elementos (p. ej. los logos de `companies.astro`) tienen una
 * opacidad intencional (`opacity-80`). Si el reveal animara siempre a
 * `1`, la perderían. Se memoiza en `data-reveal-opacity` para que el
 * valor de diseño sobreviva a reversiones y recreaciones del contexto.
 */
const rememberFinalOpacity = (targets: HTMLElement[]): void => {
  targets.forEach((target) => {
    if (target.dataset.revealOpacity !== undefined) return;

    const opacity = getComputedStyle(target).opacity;
    if (opacity !== "0") target.dataset.revealOpacity = opacity;
  });
};

/** Opacidad final memorizada; fallback `1` si no se guardó. */
const finalOpacityOf = (target: Element): number => {
  if (!(target instanceof HTMLElement)) return 1;

  const stored = target.dataset.revealOpacity;
  return stored === undefined ? 1 : Number(stored);
};

/**
 * Ejecuta `init` en cuanto el DOM está listo para consultarse.
 *
 * Existe para que cada script de componente no repita el mismo
 * boilerplate de `document.readyState` + `DOMContentLoaded`: si el
 * documento ya dejó de cargar (`readyState !== "loading"`), `init`
 * corre de inmediato; si sigue cargando, se difiere hasta
 * `DOMContentLoaded` (una sola vez).
 */
export const whenReady = (init: () => void): void => {
  installScrollPositionGuard();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
};

/**
 * Revela los `[data-reveal]` del scope al entrar al viewport.
 *
 * @param scope  Valor de `data-reveal-scope` que envuelve la sección.
 * @param preset Preset de entrada (`section` por defecto).
 */
export const revealSection = (
  scope: string,
  preset: RevealPreset = "section",
): void => {
  whenReady(() => {
    const values = resolvePreset(preset, "revealSection");
    if (!values) return;

    resolveScopeRoots(scope).forEach((root) => {
      revealOnEnter({ selector: "[data-reveal]", root, ...values });
    });
  });
};

/**
 * Revela de inmediato los `[data-reveal]` del scope (above the fold).
 *
 * @param scope Valor de `data-reveal-scope`; por defecto `hero`.
 */
export const revealHero = (scope = "hero"): void => {
  whenReady(() => {
    const values = resolvePreset("hero", "revealHero");
    if (!values) return;

    resolveScopeRoots(scope).forEach((root) => {
      revealImmediately({ selector: "[data-reveal]", root, ...values });
    });
  });
};

/**
 * Ken Burns continuo sobre la imagen de fondo del hero.
 *
 * Se apoya en `gsap.matchMedia`, por lo que es simétrico: al activar
 * reduce, GSAP revierte el tween y el `transformOrigin`; al desactivarlo,
 * el ciclo se vuelve a crear. Si el scope o la imagen no existen, no
 * anima.
 */
export const ambientZoom = ({
  scope,
  selector = "[data-hero-background]",
  scale = 1.03,
  duration = 8,
}: AmbientZoomOptions): void => {
  whenReady(() => {
    resolveScopeRoots(scope).forEach((root) => {
      const target = root.querySelector<HTMLElement>(selector);
      if (!target) return;

      getAnimationMedia().add(NO_PREFERENCE, () => {
        gsap.to(target, {
          scale,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "center",
        });
      });
    });
  });
};

/**
 * Fuerza el estado final (opacidad de diseño guardada, sin `transform`)
 * de los elementos indicados. Pensado para contenido que se muestra por
 * lógica de cliente después de que el reveal ya aplicó su estado inicial
 * (filtros del blog).
 *
 * Con `prefers-reduced-motion: reduce` no hay estado oculto que corregir
 * (nunca se aplicó `gsap.set`), así que no toca el DOM. Al terminar,
 * limpia el `transform` inline: un `translate(0px, 0px)` residual crearía
 * un stacking context innecesario.
 */
export const revealNow = (targets: Element[]): void => {
  if (targets.length === 0) return;
  if (!window.matchMedia(NO_PREFERENCE).matches) return;

  targets.forEach((target) => {
    if (target instanceof HTMLElement) target.dataset.revealed = "true";
  });

  gsap.set(targets, {
    opacity: (_index: number, target: Element) => finalOpacityOf(target),
    y: 0,
    clearProps: "transform",
  });
};

/**
 * Revela los elementos del `root` al cruzar la línea de disparo, con
 * `once: true`. Stagger opcional para grupos naturales (tarjetas,
 * logos, etc.).
 *
 * Antes de ocultar nada se descartan:
 *   - los ya revelados (`data-revealed="true"`), y
 *   - los que ya pasaron el umbral (su `top` cae dentro de los primeros
 *     `START_RATIO` del viewport), porque `ScrollTrigger.batch` ya no
 *     dispararía `onEnter` para ellos.
 *
 * Así un toggle `reduce` → `no-preference` no re-oculta bloques que el
 * usuario ya vio. Si no queda ningún target pendiente, no se crea el
 * batch.
 *
 * Interno: los componentes usan `revealSection`.
 */
const revealOnEnter = (options: RevealTargetsOptions): void => {
  ensureScrollTrigger();

  const targets = Array.from(
    options.root.querySelectorAll<HTMLElement>(
      options.selector ?? "[data-reveal]",
    ),
  );
  if (targets.length === 0) return;

  getAnimationMedia().add(NO_PREFERENCE, () => {
    const threshold = window.innerHeight * START_RATIO;
    const pending = targets.filter(
      (el) =>
        el.dataset.revealed !== "true" &&
        el.getBoundingClientRect().top > threshold,
    );
    if (pending.length === 0) return;

    // Antes de ocultar, recordamos la opacidad de diseño de cada logo
    // o elemento con opacidad propia (p. ej. `opacity-80`).
    rememberFinalOpacity(pending);
    gsap.set(pending, { opacity: 0, y: options.y });

    ScrollTrigger.batch(pending, {
      start: START,
      once: true,
      onEnter: (batch) => {
        batch.forEach((el) => {
          if (el instanceof HTMLElement) el.dataset.revealed = "true";
        });

        const toVars: gsap.TweenVars = {
          opacity: (_index: number, target: Element) => finalOpacityOf(target),
          y: 0,
          duration: options.duration,
          ease: "power2.out",
        };
        if (options.stagger !== false) {
          toVars.stagger = options.stagger;
        }
        gsap.to(batch, toVars);
      },
    });

    // Sin cleanup manual: `gsap.matchMedia()` revierte su propio contexto
    // (restaura estilos inline, mata tweens y ScrollTriggers) cuando la
    // media query deja de coincidir, p.ej. si el usuario activa reduced
    // motion durante la sesión. Llamar `mm.revert()` aquí dentro volvería
    // a disparar este cleanup y provocaría recursión infinita.
  });
};

/**
 * Revela elementos inmediatamente tras la carga, sin ScrollTrigger.
 * Pensado para contenido above the fold. Respeta igualmente
 * `prefers-reduced-motion`.
 *
 * Interno: los componentes usan `revealHero`.
 */
const revealImmediately = (options: RevealTargetsOptions): void => {
  const targets = Array.from(
    options.root.querySelectorAll<HTMLElement>(
      options.selector ?? "[data-reveal]",
    ),
  );
  if (targets.length === 0) return;

  getAnimationMedia().add(NO_PREFERENCE, () => {
    rememberFinalOpacity(targets);
    gsap.set(targets, { opacity: 0, y: options.y });

    const toVars: gsap.TweenVars = {
      opacity: (_index: number, target: Element) => finalOpacityOf(target),
      y: 0,
      duration: options.duration,
      ease: "power2.out",
    };
    if (options.stagger !== false) {
      toVars.stagger = options.stagger;
    }
    gsap.to(targets, toVars);
  });
};

/** Opciones del contador numérico ascendente. */
export interface CountUpOptions {
  /** Duración del conteo en segundos. */
  duration?: number;
  /** Valor final exacto que se escribe al terminar el conteo. */
  value?: number;
  /**
   * Se invoca al terminar el conteo. Sirve para encadenar el "pop" del
   * número o el pulso de un ícono. No se invoca con `reduce`.
   */
  onComplete?: () => void;
}

/** Duración por defecto del conteo (segundos). */
const COUNT_UP_DURATION = 1.6;

/**
 * Cuenta un número ascendente desde 0 hasta `value`.
 *
 * No es un reveal: anima el *contenido* de un elemento (su `textContent`)
 * y no una propiedad de estilo, así que no encaja en el modelo
 * `opacity`/`transform` de `REVEAL_PRESETS`. Aun así vive en este módulo
 * porque comparte el `gsap.matchMedia()` global y, con ello, la misma
 * política de `prefers-reduced-motion` que el resto del sitio.
 *
 * Contrato:
 *   - El valor final **ya está en el HTML** (renderizado por SSR). Con
 *     `prefers-reduced-motion: reduce` o sin JS, el número se queda
 *     visible en su valor real: nunca queda un "0" congelado.
 *   - El texto se sustituye por enteros redondeados durante el conteo.
 *   - Al terminar se escribe el valor exacto y se dispara `onComplete`.
 *
 * El `onComplete` no se invoca cuando el usuario pidió reducir el
 * movimiento: en ese caso la animación no llega a empezar y el pop
 * correspondiente tampoco debe reproducirse.
 *
 * @param target Elemento cuyo `textContent` se anima.
 * @param value  Valor final del contador.
 * @param options Duración, valor exacto y callback de finalización.
 */
export const countUp = (
  target: HTMLElement,
  value: number,
  options: CountUpOptions = {},
): void => {
  const { duration = COUNT_UP_DURATION, onComplete } = options;
  const finalValue = options.value ?? value;

  getAnimationMedia().add(NO_PREFERENCE, () => {
    // Objeto proxy: GSAP anima sus propiedades y `onUpdate` refleja el
    // valor redondeado en el DOM. Es el patrón estándar para contadores
    // con GSAP (no existe un tween nativo sobre `textContent`).
    const counter = { value: 0 };

    gsap.to(counter, {
      value: finalValue,
      duration,
      ease: "power2.out",
      // Redondea a entero en cada frame: nunca se ve "47.3".
      snap: { value: 1 },
      onUpdate: () => {
        target.textContent = String(Math.round(counter.value));
      },
      onComplete: () => {
        // Se escribe el valor exacto (por ejemplo "150", no "150.00001")
        // y se limpia cualquier transform residual del pop anterior.
        target.textContent = String(finalValue);
        onComplete?.();
      },
    });
  });
};

/** Opciones del conteo de un grupo de números de megas. */
export interface MegasCountersOptions {
  /**
   * Se invoca después del conteo y del "pop" de cada número. Permite
   * encadenar acentos propios de cada tarjeta (p. ej. el pulso del icono
   * del plan destacado del tarifario) sin duplicar el conteo.
   */
  onCountComplete?: (counter: HTMLElement) => void;
}

/** Duración del conteo de megas (segundos). */
const MEGAS_COUNT_DURATION = 1.6;

/** Desfase entre números: refuerza la progresión de velocidad. */
const MEGAS_COUNT_STAGGER = 0.15;

/**
 * "Pop" del número al llegar a su valor final.
 *
 * Se anima `scale` (transform), nunca `font-size`: el contrato del sitio
 * sólo permite animar opacidad y transform, y así el número no reflowea la
 * tarjeta.
 */
const popNumber = (element: HTMLElement): void => {
  gsap.fromTo(
    element,
    { scale: 1 },
    {
      scale: 1.15,
      duration: 0.22,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      clearProps: "transform",
    },
  );
};

/**
 * Anima todos los `[data-megas-count]` de un contenedor.
 *
 * Lo comparten el tarifario (`InternetHogarPlans`) y la guía de elección
 * (`InternetHogarPlanGuide`): el requerimiento es que la animación sea la
 * misma en ambos bloques, y tenerla aquí evita que una copia se quede
 * atrás. El contenedor puede ser una sección, un panel de tabs o una
 * tarjeta.
 *
 * Reglas:
 *   - Cada número se cuenta **una sola vez** (`data-counted`): alternar
 *     tabs no reinicia la animación ni hace "parpadear" el bloque.
 *   - El valor final ya está en el HTML; con `prefers-reduced-motion` esta
 *     función no altera nada (ver `countUp`).
 *   - El número animado debe ir en un elemento `aria-hidden` con el valor
 *     accesible duplicado (`sr-only`), porque durante el conteo el texto
 *     pasa por valores intermedios.
 *
 * @param root    Contenedor donde buscar `[data-megas-count]`.
 * @param options Callback opcional por número.
 */
export const countMegasIn = (
  root: ParentNode,
  options: MegasCountersOptions = {},
): void => {
  const counters = Array.from(
    root.querySelectorAll<HTMLElement>("[data-megas-count]"),
  );

  counters.forEach((counter, index) => {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";

    const value = Number(counter.dataset.megasValue ?? 0);

    gsap.delayedCall(index * MEGAS_COUNT_STAGGER, () => {
      countUp(counter, value, {
        duration: MEGAS_COUNT_DURATION,
        onComplete: () => {
          popNumber(counter);
          options.onCountComplete?.(counter);
        },
      });
    });
  });
};
