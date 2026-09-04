/**
 * Acceso a las circulares, avisos y convocatorias.
 *
 * Vive aparte de los componentes porque la regla de ordenación es una decisión
 * de producto, no de maquetado: quien dibuje las columnas no debería poder
 * cambiar sin querer qué se considera «reciente».
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { TIPOS_PUBLICACION, type TipoPublicacion } from './constantes';

export type Publicacion = CollectionEntry<'publicaciones'>;

/**
 * Todas las vigentes, de la más reciente a la más antigua.
 *
 * El orden por fecha descendente no es un detalle: una portada que muestra
 * arriba la circular de hace ocho meses es una portada que nadie mantiene, y
 * eso se nota antes que cualquier problema de diseño.
 */
export async function obtenerPublicaciones(): Promise<Publicacion[]> {
  const todas = await getCollection('publicaciones', ({ data }) => data.vigente);
  return todas.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

/**
 * Las tres columnas de la portada, ya ordenadas y recortadas.
 *
 * `limite` existe porque la portada no puede crecer sin fin: el sitio real
 * resuelve lo mismo dejando que la columna de circulares se desplace dentro de
 * su caja. Aquí se prefiere cortar y enlazar al listado completo, que funciona
 * igual con teclado y no esconde contenido tras un scroll que hay que
 * descubrir.
 */
export async function obtenerPorTipo(limite = 5): Promise<
  { tipo: TipoPublicacion; items: Publicacion[]; total: number }[]
> {
  const todas = await obtenerPublicaciones();
  return TIPOS_PUBLICACION.map((tipo) => {
    const items = todas.filter((p) => p.data.tipo === tipo);
    return { tipo, items: items.slice(0, limite), total: items.length };
  });
}

/**
 * Fecha en formato corto y legible: "28 ago 2026".
 *
 * Se crea el formateador UNA vez: `Intl.DateTimeFormat` es caro de construir y
 * esto se llama una vez por publicación.
 */
const FORMATO_CORTO = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const fechaCorta = (fecha: Date): string => FORMATO_CORTO.format(fecha);

/** Para el atributo `datetime` de <time>: siempre ISO, sin importar el idioma. */
export const fechaISO = (fecha: Date): string => fecha.toISOString().slice(0, 10);
