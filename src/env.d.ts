/**
 * Tipado de las variables de entorno del proyecto.
 *
 * Sin este archivo, `import.meta.env` cae al index signature
 * `[key: string]: any` de Vite y cualquier acceso compila como `any`.
 * Declarar aquí las variables `PUBLIC_*` que usamos les da un tipo
 * real (`string | undefined`) y documenta cuáles existen. La
 * referencia a `astro/client` aporta el resto de los tipos base
 * (`astro:assets`, `astro:content`, `ImportMeta`, etc.).
 */
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * API key pública de api-utils para el formulario de `/lead`.
   * Es restringida del lado del servidor, no un secreto (ver el
   * comentario de `LEAD_API_KEY` en `src/data/lead.ts`).
   */
  readonly PUBLIC_LEAD_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
