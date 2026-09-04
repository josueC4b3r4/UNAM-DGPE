import type { Rol } from './constantes';

/**
 * Construcción de URLs del sitio.
 *
 * Vive aparte de `tramites.ts` por una razón concreta de rendimiento: el
 * script del buscador necesita `rutaTramite` en el NAVEGADOR, y `tramites.ts`
 * importa `astro:content`. Importar desde allí arrastraría toda la capa de
 * contenido al bundle del cliente.
 *
 * Este módulo no tiene dependencias de ejecución: es seguro importarlo desde
 * cualquier lado, servidor o cliente.
 */

/** La barra final evita una redirección 301 al servir el sitio estático. */
export function rutaTramite(slug: string): string {
  return `/tramites/${slug}/`;
}

export function rutaRol(clave: Rol): string {
  return `/perfil/${clave}/`;
}

export function rutaPublicacion(slug: string): string {
  return `/publicaciones/${slug}/`;
}
