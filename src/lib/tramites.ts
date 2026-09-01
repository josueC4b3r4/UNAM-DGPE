import { getCollection, type CollectionEntry } from 'astro:content';
import {
  ETIQUETAS_CATEGORIA,
  ETIQUETAS_ROL,
  type Categoria,
  type Modalidad,
  type Rol,
} from './constantes';

export type { Categoria, Modalidad, Rol };
export type Tramite = CollectionEntry<'tramites'>;

/**
 * Forma reducida de un trámite que se serializa al cliente para el buscador.
 *
 * Se manda ESTO y no la colección completa: el cuerpo en Markdown de los 14
 * trámites pesa ~60 KB, y el buscador solo necesita metadatos. Mandar de más
 * castigaría directamente la métrica de Lighthouse.
 */
export interface TramiteIndexado {
  slug: string;
  titulo: string;
  resumen: string;
  categoria: Categoria;
  categoriaEtiqueta: string;
  roles: Rol[];
  modalidad: Modalidad;
  duracion: string;
  /** Términos alternativos con los que la gente busca este trámite. */
  sinonimos: string[];
  destacado: boolean;
}

export { ETIQUETAS_CATEGORIA, ETIQUETAS_MODALIDAD, ETIQUETAS_ROL } from './constantes';

/** Orden alfabético estable, independiente de la configuración regional del build. */
const porTitulo = (a: Tramite, b: Tramite) => a.data.titulo.localeCompare(b.data.titulo, 'es');

export async function obtenerTramites(): Promise<Tramite[]> {
  const tramites = await getCollection('tramites');
  /* Se copia antes de ordenar: `getCollection` devuelve un arreglo cacheado y
     ordenarlo en el lugar alteraría el orden para el resto del build. */
  return [...tramites].sort(porTitulo);
}

export async function obtenerTramitesDestacados(): Promise<Tramite[]> {
  const tramites = await obtenerTramites();
  return tramites.filter((t) => t.data.destacado);
}

export async function obtenerTramitesPorRol(rol: Rol): Promise<Tramite[]> {
  const tramites = await obtenerTramites();
  return tramites.filter((t) => t.data.roles.includes(rol));
}

export function aIndexado(tramite: Tramite): TramiteIndexado {
  const { titulo, resumen, categoria, roles, modalidad, duracion, sinonimos, destacado } =
    tramite.data;

  return {
    slug: tramite.id,
    titulo,
    resumen,
    categoria,
    categoriaEtiqueta: ETIQUETAS_CATEGORIA[categoria],
    roles,
    modalidad,
    duracion,
    sinonimos,
    destacado,
  };
}

export async function construirIndiceBusqueda(): Promise<TramiteIndexado[]> {
  const tramites = await obtenerTramites();
  return tramites.map(aIndexado);
}

/** Categorías presentes en el contenido, con su conteo, para los filtros del listado. */
export async function obtenerCategoriasConConteo() {
  const tramites = await obtenerTramites();
  const conteo = new Map<Categoria, number>();

  for (const t of tramites) {
    conteo.set(t.data.categoria, (conteo.get(t.data.categoria) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .map(([clave, total]) => ({ clave, etiqueta: ETIQUETAS_CATEGORIA[clave], total }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

export function etiquetaRol(rol: Rol): string {
  return ETIQUETAS_ROL[rol];
}

/* Se re-exportan para comodidad del código de servidor. El código de CLIENTE
   debe importarlas desde './rutas' directamente: este módulo carga
   `astro:content` y no tiene nada que hacer en el navegador. */
export { rutaRol, rutaTramite } from './rutas';

/**
 * Fecha larga en español. Se calcula en build (el sitio es estático), así que
 * no manda `Intl` al cliente.
 */
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(fecha);
}

/** Formato ISO para el atributo `datetime` de <time>. */
export function fechaISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
