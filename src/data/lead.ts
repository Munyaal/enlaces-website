/**
 * Contenido y configuración del formulario de registro de `/lead`.
 *
 * Vive en `src/data/` por la misma razón que `contact.ts`: es la única
 * fuente de verdad del formulario (endpoint, campos, copias de estado y
 * key de la API), de modo que nada se duplique inline en el markup. Lo
 * consumen `LeadForm.astro` (markup + `<script>` de cliente) y el
 * frontmatter de `src/pages/lead.astro` (salvaguarda de build).
 *
 * El formulario registra la participación en una dinámica: no cotiza ni
 * promete contacto por defecto. El checkbox de promociones es opcional,
 * viaja marcado por defecto y solo decide qué mensaje de éxito se
 * muestra en el cliente; no forma parte del payload que recibe
 * api-utils.
 *
 * El sitio es 100% estático: al enviar el formulario, un `<script>` de
 * cliente hace `fetch` POST hacia api-utils (`LEAD_ENDPOINT`), que
 * encola un correo con la plantilla `LEAD_TEMPLATE`. Este módulo no
 * importa `astro:content`, así que puede entrar al bundle de cliente
 * (ver la frontera de módulos en AGENTS.md).
 */
import { CANAL_CORREO, TELEFONO_PRINCIPAL } from "./site";

/** Endpoint de api-utils que recibe el POST y encola el correo. */
export const LEAD_ENDPOINT = "https://api-utils.munyaal.app/api/emails";

/** Plantilla de api-utils con la que se arma el cuerpo del correo. */
export const LEAD_TEMPLATE = "enlaces/new-lead";

/** Idioma de la plantilla de correo. */
export const LEAD_LANG = "es" as const;

/**
 * Destinatario declarado del correo.
 *
 * Existe **solo para satisfacer el DTO** de api-utils: el servidor
 * fuerza el destinatario real con `fixedTo`, así que si `CANAL_CORREO`
 * cambiara, este valor seguiría enviándose pero el lead seguiría
 * llegando a donde api-utils tenga configurado. Se deriva de
 * `CANAL_CORREO` (mismo canal comercial del footer) por DRY y
 * convención del repo — no controla a dónde llega el lead.
 */
export const LEAD_TO = CANAL_CORREO.value;

/**
 * Asuntos del correo según el checkbox de promociones.
 *
 * El template `enlaces/new-lead` no contempla el consentimiento, así que
 * el asunto es el único canal para segmentar los registros: ambos
 * comparten el prefijo `[DINAMICA]` (total) y se distinguen por
 * `[INFO SI]` / `[INFO NO]` (segmentos). Sin acentos para que los
 * filtros y búsquedas del correo sean predecibles.
 */
export const LEAD_SUBJECT_OPT_IN =
  "Aluxe fest Registro desde Enlaces Playa";
export const LEAD_SUBJECT_OPT_OUT =
  "Aluxe fest Registro y Solicitud desde Enlaces Playa";

/**
 * API key de api-utils que autoriza el envío del formulario.
 *
 * Es **pública por diseño**: viaja en el bundle de cliente y la
 * protección real vive en api-utils (cliente restringido, `fixedTo`,
 * allowlist de plantillas y CORS). Se inyecta en tiempo de build —
 * `.env` en local, `--build-arg` desde el secret `LEAD_API_KEY` en
 * CI — y si falta, el formulario degrada a
 * `LEAD_FORM.missingKeyError` sin disparar requests; la guardia del
 * workflow impide un build de producción sin ella. El tipado de la
 * lectura vive en `src/env.d.ts`.
 */
export const LEAD_API_KEY = import.meta.env.PUBLIC_LEAD_API_KEY ?? "";

/** Forma de un campo del formulario de registro. */
export interface LeadField {
  /** Identificador estable (`id`/`name` del control y `for` del label). */
  name: string;
  /** Etiqueta visible encima del control. */
  label: string;
  /** Pista breve dentro del control vacío: un ejemplo, no repite el label. */
  placeholder: string;
  /** Tipo de control a renderizar. */
  type: "text" | "email" | "tel";
  /** Valor de `autocomplete` del input (habilita el autollenado del navegador). */
  autocomplete: string;
}

/**
 * Campos en el orden en que se muestran dentro del card.
 *
 * Los cuatro son requeridos: sin ellos no se puede identificar al
 * participante ni validar su zona (la colonia es el dato que ubica la
 * dinámica en la Riviera Maya). Los `name` son las llaves que espera el
 * `context` de la plantilla, así que renombrar uno aquí cambia el envío.
 */
export const LEAD_FIELDS: LeadField[] = [
  {
    name: "fullName",
    label: "Nombre completo",
    placeholder: "Ej. Juan Pérez",
    type: "text",
    autocomplete: "name",
  },
  {
    name: "email",
    label: "Correo electrónico",
    placeholder: "correo@dominio.com",
    type: "email",
    autocomplete: "email",
  },
  {
    name: "phone",
    label: "Número de teléfono",
    placeholder: "984 000 0000",
    type: "tel",
    autocomplete: "tel",
  },
  {
    name: "colonia",
    label: "Colonia",
    placeholder: "Ej. Centro",
    type: "text",
    autocomplete: "address-level3",
  },
];

/**
 * Cuerpo del POST hacia `LEAD_ENDPOINT`, tal como lo define el DTO de
 * api-utils. Los cuatro valores de `context` se recortan con `.trim()`
 * antes de serializar (ver el `<script>` de `LeadForm`).
 */
export interface LeadPayload {
  /** Destinatario del correo (api-utils lo sobreescribe con `fixedTo`). */
  to: string;
  /** Asunto con el que llega el correo. */
  subject: string;
  /** Plantilla de api-utils con la que se arma el cuerpo. */
  template: string;
  /** Idioma de la plantilla. */
  lang: string;
  /** Datos del registro que rellenan la plantilla. */
  context: {
    fullName: string;
    email: string;
    phone: string;
    colonia: string;
  };
}


export const LEAD_FORM = {
  submitLabel: "Enviar registro",
  loadingLabel: "Enviando…",
  successTitle: "¡Gracias! Recibimos tu registro",
  /** Cuerpo de éxito cuando el usuario aceptó promociones/contacto. */
  successBodyContact:
    "Un asesor de Enlaces Playa se pondrá en contacto contigo muy pronto para compartirte más información de la dinámica.",
  /** Cuerpo de éxito cuando el usuario rechazó promociones/contacto. */
  successBodyNeutral:
    "Tu registro quedó confirmado. Gracias por participar en la dinámica de Enlaces Playa.",
  /** Checkbox opcional, marcado por defecto; no se envía al backend. */
  promotionsLabel:
    "Quiero recibir promociones, novedades y que Enlaces Playa me contacte.",
  error: `No pudimos enviar tu registro. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp al ${TELEFONO_PRINCIPAL.value} y con gusto te atendemos.`,
  missingKeyError: `El formulario no está disponible por una configuración pendiente del sitio. Mientras la resolvemos, llámanos al ${TELEFONO_PRINCIPAL.value} o escríbenos por WhatsApp y te ayudamos con tu registro.`,
  /** Label del honeypot: visible solo para bots, no invita a llenarlo. */
  honeypotLabel: "No llenes este campo",
} as const;
