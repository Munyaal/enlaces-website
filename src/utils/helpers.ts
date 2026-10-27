/**
 * Utilidades de formato para datos de contacto.
 *
 * `sanitizePhone` deja solo dígitos para construir destinos `tel:` a partir
 * del número visible. Vive en `utils/` y no en `data/` porque no es
 * contenido: `src/data/site.ts` la usa para derivar los `href` de cada canal
 * y así el texto y el enlace no pueden divergir.
 */
export const sanitizePhone = (raw: string) => raw.replace(/\D/g, "");
