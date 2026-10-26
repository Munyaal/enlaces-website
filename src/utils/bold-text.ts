/**
 * src/utils/bold-text.ts
 *
 * Convierte un texto con marcadores `**...**` en una lista de segmentos
 * (texto normal / texto en negrita) para poder renderizarlo con etiquetas
 * reales en lugar de HTML crudo.
 *
 * Por qué existe este helper:
 *
 *   - El copy del sitio vive en arrays de strings planos. Para destacar
 *     fragmentos concretos (negritas) necesitamos conservar el texto tal
 *     cual lo escribe quien edita, sin inventar un formato de arrays de
 *     objetos que vuelve el copy ilegible.
 *   - `**negrita**` es la convención universal de Markdown: cualquiera que
 *     edite el contenido la entiende sin documentación extra.
 *   - Evita `set:html` por completo. Los segmentos se renderizan con
 *     `<strong>` y el contenido se escapa automáticamente, así que no hay
 *     superficie de inyección de HTML.
 *
 * Es lógica pura (sin DOM ni dependencias), por lo que se puede testear
 * y reutilizar desde cualquier componente.
 */

/** Fragmento de texto: `bold` indica si debe renderizarse en negrita. */
export interface Segment {
  text: string;
  bold: boolean;
}

/**
 * Divide `input` en segmentos normal/negrita a partir de los marcadores
 * `**...**`.
 *
 * Es deliberadamente tolerante a errores de escritura: un `**` sin cerrar
 * no genera negrita ni rompe el build, simplemente se queda como texto
 * literal. Un texto sin marcadores devuelve un único segmento normal.
 */
export const parseBoldSegments = (input: string): Segment[] => {
  const segments: Segment[] = [];
  // No global-lazy: los marcadores vacíos (`****`) no se consideran
  // negrita para evitar segmentos vacíos que rompen el layout.
  const pattern = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > cursor) {
      segments.push({ text: input.slice(cursor, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    cursor = match.index + match[0].length;
  }

  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), bold: false });
  }

  return segments;
};
