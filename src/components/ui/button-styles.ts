/**
 * button-styles.ts
 *
 * Clases compartidas por `Button`, `CTAButton` y `PhoneCTAButton`.
 * Centraliza el lenguaje común (píldora, tipografía, transición y
 * escalas de hover/active) sin fusionar los componentes ni tocar sus
 * props, tamaños, paddings o variantes de color.
 *
 * Escala de duraciones del sitio:
 *   - 150 ms: color / hover de texto.
 *   - 200 ms: botones y controles (esta es la que aplica aquí).
 *   - 300 ms: superficies y sombras.
 *
 * Decisión: `gap`, `justify-*` y la elevación quedan fuera de la base.
 * `PhoneCTAButton` usa `justify-between` y un gap responsive
 * (`gap-4 sm:gap-6`); `CTAButton`/`PhoneCTAButton` usan `shadow-md`
 * mientras `Button` usa `shadow` + `hover:shadow-md`. Incluirlos en la
 * base generaría utilidades en conflicto y cambiaría el layout o la
 * elevación real de cada variante.
 */

/**
 * Estructura común: píldora, alineación vertical, tipografía y foco.
 *
 * `select-none` y `whitespace-nowrap` NO viven aquí: sólo los tenía
 * `Button`. En `CTAButton` el `whitespace-nowrap` impedía que el label
 * ("Ver planes para empresa") hiciera wrap a 2 líneas dentro de la card
 * de planes en móvil y el `overflow-hidden` del home lo recortaba.
 */
export const BUTTON_BASE_CLASSES =
  "inline-flex items-center rounded-full font-bold outline-none";

/**
 * Transición explícita a 200 ms. Se listan propiedades concretas en
 * lugar de `transition`/`all` para no animar layout ni filtros.
 *
 * `scale` va aparte de `transform` porque Tailwind v4 emite `scale-*`
 * como la propiedad CSS `scale`, no como `transform`: sin ella el hover
 * saltaría de golpe.
 */
export const BUTTON_TRANSITION_CLASSES =
  "transition-[transform,scale,box-shadow,color,background-color,border-color] duration-200 ease-out";

/**
 * Micro-interacción compartida. `motion-safe` desactiva la escala cuando
 * el usuario pidió reducir movimiento.
 */
export const BUTTON_SCALE_CLASSES =
  "motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98]";

/** Estados deshabilitado/ocupado comunes. */
export const BUTTON_STATE_CLASSES =
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 aria-[busy=true]:cursor-progress aria-[busy=true]:hover:scale-100";

/** Elevación base según el peso visual del botón. */
export const BUTTON_SHADOW_CLASSES = {
  /** Botón estándar (crece a `hover:shadow-md`). */
  default: "shadow",
  /** CTA destacado, siempre elevado. */
  elevated: "shadow-md",
} as const;
