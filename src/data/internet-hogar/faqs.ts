/**
 * Preguntas frecuentes de `/internet-hogar`.
 *
 * Vive en `src/data/` y no inline en el componente por dos motivos:
 *
 *   1. La sección visual es sólo presentación; el copy se edita aquí.
 *   2. El mismo array alimenta el JSON-LD `FAQPage` de la página, así que
 *      el schema y el contenido visible no pueden desincronizarse.
 *
 * Las respuestas se modelan como fragmentos —texto plano o enlace— en
 * lugar de HTML crudo. El repo evita `set:html` a propósito (ver
 * `src/utils/bold-text.ts`): así el texto se escapa solo, no hay
 * superficie de inyección y los enlaces siguen siendo datos tipados.
 */
import { SITE } from "../site";
import { sanitizePhone } from "../../utils/helpers";

/** Número de soporte técnico que se muestra en la última pregunta. */
const TELEFONO_SOPORTE = "984 116 3005";

/** Destino `tel:` del número de soporte (formato internacional). */
const TELEFONO_SOPORTE_HREF = `tel:+52${sanitizePhone(TELEFONO_SOPORTE)}`;

/**
 * Fragmento de una respuesta. Sin `href` es texto normal; con `href` se
 * renderiza como enlace. `externo` añade `target="_blank"` y `rel` de
 * seguridad (WhatsApp), y se omite en los enlaces `tel:`.
 */
export type FaqFragmento =
  | { texto: string }
  | { texto: string; href: string; externo?: boolean };

/** Una pregunta frecuente con su respuesta por fragmentos. */
export interface FaqItem {
  /** Id estable: ancla de la pregunta y base del JSON-LD. */
  id: string;
  /** Enunciado visible en el encabezado del acordeón. */
  pregunta: string;
  /** Respuesta completa, en orden de lectura. */
  respuesta: FaqFragmento[];
}

/**
 * Preguntas frecuentes en el orden en que se muestran.
 *
 * Las respuestas conservan espacios al inicio/final de cada fragmento:
 * al unirlas para el JSON-LD el texto debe quedar separado igual que en
 * pantalla.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-cobertura",
    pregunta: "¿Cómo sé si hay cobertura de internet en mi domicilio?",
    respuesta: [
      { texto: "La cobertura depende de tu ubicación. Escríbenos por " },
      { texto: "WhatsApp", href: SITE.whatsapp, externo: true },
      {
        texto:
          " y nuestro equipo te ayudará a verificar la disponibilidad del servicio en tu domicilio.",
      },
    ],
  },
  {
    id: "faq-instalacion",
    pregunta: "¿Cuánto cuesta la instalación de internet?",
    respuesta: [
      {
        texto:
          "El costo de instalación puede variar según la promoción vigente y las condiciones del servicio. Contáctanos para conocer las opciones disponibles para tu domicilio o negocio: ",
      },
      { texto: "984 184 5726", href: SITE.whatsapp, externo: true },
      { texto: "." },
    ],
  },
  {
    id: "faq-pronto-pago",
    pregunta:
      "¿Cuál es la diferencia entre el precio de pronto pago y la tarifa normal?",
    respuesta: [
      {
        texto:
          "El precio de pronto pago es un beneficio que puedes aprovechar al realizar tu pago dentro de los primeros 5 días a partir de tu fecha de contratación. Después de este periodo, se aplica la tarifa normal.",
      },
    ],
  },
  {
    id: "faq-pago-tardio",
    pregunta: "¿Qué pasa si realizo mi pago después de los primeros 5 días?",
    respuesta: [
      {
        texto:
          "Si tu pago se realiza después de los primeros 5 días a partir de tu fecha de contratación, tu servicio pasa a la tarifa normal. Te recomendamos aprovechar el beneficio de pronto pago.",
      },
    ],
  },
  {
    id: "faq-soporte",
    pregunta: "¿Cómo puedo solicitar soporte técnico?",
    respuesta: [
      {
        texto:
          "Puedes comunicarte con nuestro equipo de atención para reportar cualquier inconveniente con tu servicio. Contamos con soporte técnico local para ayudarte a mantenerte conectado. Llámanos al ",
      },
      { texto: TELEFONO_SOPORTE, href: TELEFONO_SOPORTE_HREF },
      { texto: "." },
    ],
  },
];

/**
 * Texto plano de una respuesta, para el JSON-LD.
 *
 * `FAQPage` no admite HTML en `acceptedAnswer.text`: los fragmentos se
 * concatenan en orden y los enlaces pierden su marcado, pero conservan
 * su etiqueta visible (el número de teléfono o "WhatsApp").
 */
export const faqRespuestaTexto = (item: FaqItem): string =>
  item.respuesta.map((fragmento) => fragmento.texto).join("");
