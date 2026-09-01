import type { TramiteIndexado } from './tramites';

/**
 * Lógica de búsqueda. Sin DOM a propósito: así se puede razonar sobre ella
 * (y probarla) sin montar una página.
 */

export interface Resultado {
  tramite: TramiteIndexado;
  puntaje: number;
  /** Rango [inicio, fin) del título que coincide, para resaltarlo. */
  coincidencia: [number, number] | null;
}

/**
 * Quita acentos y pasa a minúsculas para que "sabatico" encuentre "sabático".
 *
 * IMPORTANTE: conserva la longitud de la cadena. Un carácter precompuesto en
 * NFC ("á") se descompone en base + diacrítico y, al quitar el diacrítico,
 * vuelve a ser un solo carácter ("a"). Gracias a eso los índices calculados
 * sobre el texto normalizado siguen siendo válidos sobre el texto original,
 * que es lo que permite resaltar la coincidencia en el sitio correcto.
 *
 * `\p{Mn}` = categoría Unicode "Mark, nonspacing", es decir los diacríticos
 * combinantes. Se usa la propiedad Unicode en vez del rango ̀-ͯ
 * porque el rango literal deja caracteres invisibles en el archivo.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}

const MINIMO_CARACTERES = 2;

/** Peso de cada tipo de coincidencia. Ordenados de más a menos específico. */
const PESOS = {
  tituloEmpieza: 100,
  tituloContiene: 70,
  sinonimoEmpieza: 55,
  sinonimoContiene: 45,
  categoria: 20,
  resumen: 12,
  destacado: 5,
} as const;

/**
 * Busca en el índice y devuelve resultados ordenados por relevancia.
 *
 * Estrategia en dos pasos:
 *   1. FILTRAR — cada palabra de la consulta debe aparecer en algún campo del
 *      trámite. Así "constancia servicios" encuentra "Constancia de servicios"
 *      aunque el "de" no esté en la consulta.
 *   2. PUNTUAR — con la consulta completa, para que una coincidencia al inicio
 *      del título pese más que una mención suelta en el resumen.
 */
export function buscar(
  indice: TramiteIndexado[],
  consulta: string,
  limite = 8
): Resultado[] {
  const q = normalizar(consulta.trim());
  if (q.length < MINIMO_CARACTERES) return [];

  const palabras = q.split(/\s+/).filter(Boolean);
  const resultados: Resultado[] = [];

  for (const tramite of indice) {
    const titulo = normalizar(tramite.titulo);
    const sinonimos = tramite.sinonimos.map(normalizar);
    const resumen = normalizar(tramite.resumen);
    const categoria = normalizar(tramite.categoriaEtiqueta);

    const todo = [titulo, ...sinonimos, resumen, categoria].join(' ');

    /* Paso 1: todas las palabras tienen que estar presentes. */
    if (!palabras.every((palabra) => todo.includes(palabra))) continue;

    /* Paso 2: puntuación con la consulta completa. */
    let puntaje = 0;

    if (titulo.startsWith(q)) puntaje += PESOS.tituloEmpieza;
    else if (titulo.includes(q)) puntaje += PESOS.tituloContiene;

    if (sinonimos.some((s) => s.startsWith(q))) puntaje += PESOS.sinonimoEmpieza;
    else if (sinonimos.some((s) => s.includes(q))) puntaje += PESOS.sinonimoContiene;

    if (categoria.includes(q)) puntaje += PESOS.categoria;
    if (resumen.includes(q)) puntaje += PESOS.resumen;
    if (tramite.destacado) puntaje += PESOS.destacado;

    /*
     * Coincidió por palabras sueltas pero ninguna regla anterior sumó (p. ej.
     * "servicios constancia", en desorden). Sigue siendo un resultado válido,
     * solo que menos relevante.
     */
    if (puntaje === 0) puntaje = 1;

    /* Rango a resaltar: solo si la consulta completa aparece en el título. */
    const desde = titulo.indexOf(q);
    const coincidencia: [number, number] | null =
      desde === -1 ? null : [desde, desde + q.length];

    resultados.push({ tramite, puntaje, coincidencia });
  }

  return resultados
    .sort((a, b) => b.puntaje - a.puntaje || a.tramite.titulo.localeCompare(b.tramite.titulo, 'es'))
    .slice(0, limite);
}

/**
 * Filtra por texto libre, categoría y rol. Lo usa el listado de trámites.
 * Devuelve TODOS los que cumplen, sin límite ni corte por relevancia.
 */
export function filtrar(
  indice: TramiteIndexado[],
  { texto = '', categoria = '', rol = '' }: { texto?: string; categoria?: string; rol?: string }
): TramiteIndexado[] {
  const porTexto =
    texto.trim().length >= MINIMO_CARACTERES
      ? new Set(buscar(indice, texto, Number.MAX_SAFE_INTEGER).map((r) => r.tramite.slug))
      : null;

  return indice.filter((t) => {
    if (porTexto && !porTexto.has(t.slug)) return false;
    if (categoria && t.categoria !== categoria) return false;
    if (rol && !t.roles.includes(rol as TramiteIndexado['roles'][number])) return false;
    return true;
  });
}

/** "1 trámite" / "5 trámites" / "Ningún trámite". Se anuncia en la región viva. */
export function textoConteo(total: number): string {
  if (total === 0) return 'Ningún trámite coincide con tu búsqueda';
  if (total === 1) return '1 trámite encontrado';
  return `${total} trámites encontrados`;
}
