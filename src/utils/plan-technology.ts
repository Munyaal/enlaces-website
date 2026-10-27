/**
 * plan-technology.ts
 *
 * Canal de comunicación entre el tarifario (`InternetHogarPlans`) y la
 * guía de elección (`InternetHogarPlanGuide`) de `/internet-hogar`.
 *
 * Por qué un evento y no estado compartido: en Astro cada etiqueta
 * `<script>` se empaqueta como una entrada independiente, así que una
 * variable de módulo en un archivo común no se comparte entre componentes
 * —cada bundle tendría su propia copia—. El `document` sí es único en la
 * página, así que se usa como bus.
 *
 * Contrato:
 *   - La fuente de verdad es el tab activo del tarifario, no este módulo.
 *     Aquí no se guarda estado: sólo se avisa del cambio.
 *   - Sin JavaScript, la guía se queda en fibra (el panel que renderiza
 *     visible el SSR), que es exactamente el tab activo por defecto. Nunca
 *     puede quedar en un estado que el servidor no haya renderizado.
 *   - Este archivo es client-safe (no importa `astro:content`); el tipo
 *     `PlanTechnology` se importa con `import type`, así que no arrastra
 *     el tarifario al bundle.
 */
import type { PlanTechnology } from "../data/internet-hogar/plans";

/** Nombre del evento que avisa que cambió la tecnología activa. */
export const PLAN_TECNOLOGIA_EVENTO = "plan-tecnologia-cambia";

/** Avisa a la página de que el tab activo cambió. */
export const emitirPlanTecnologia = (id: PlanTechnology): void => {
  document.dispatchEvent(
    new CustomEvent<PlanTechnology>(PLAN_TECNOLOGIA_EVENTO, { detail: id }),
  );
};

/** Escucha los cambios de tecnología activa. */
export const alCambiarPlanTecnologia = (
  listener: (id: PlanTechnology) => void,
): void => {
  document.addEventListener(PLAN_TECNOLOGIA_EVENTO, (event) => {
    listener((event as CustomEvent<PlanTechnology>).detail);
  });
};
