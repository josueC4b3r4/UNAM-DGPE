/**
 * Vocabulario controlado del sitio: roles y categorías.
 *
 * Vive aparte de `content.config.ts` a propósito. Ese archivo importa
 * `astro:content` y define colecciones; importarlo desde una página solo para
 * leer una lista de etiquetas arrastraría todo ese peso. Aquí no hay
 * dependencias, así que lo puede importar cualquiera.
 */

export const ROLES = ['academico', 'administrativo', 'jefe'] as const;
export type Rol = (typeof ROLES)[number];

export const CATEGORIAS = [
  'constancias',
  'nombramientos',
  'prestaciones',
  'pagos',
  'licencias',
  'jubilacion',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/*
 * Áreas de la dirección: la segunda vía de entrada, no la principal.
 *
 * Son las que el sitio actual pone como accesos grandes en su portada. Aquí van
 * DEBAJO de los perfiles y a propósito: la tesis del prototipo es que la
 * primera pregunta sea "quién eres" y no "de qué área depende esto", porque lo
 * segundo la institución sí lo sabe y la persona no.
 *
 * Pero quien ya trabaja en la Universidad y conoce las áreas tiene derecho a
 * entrar por donde le resulta natural. Ofrecerlo como alternativa no contradice
 * el argumento; obligar a usarlo, sí.
 *
 * ⚠ La ASIGNACIÓN de cada trámite a un área está inventada. Los nombres de las
 * áreas son públicos, pero qué trámite resuelve cada una es algo que habría que
 * confirmar con la dependencia.
 */
export const AREAS = [
  'administracion',
  'relaciones-laborales',
  'personal-academico',
  'sistemas-nomina',
  'cendi',
] as const;
export type Area = (typeof AREAS)[number];

export const ETIQUETAS_AREA: Record<Area, string> = {
  administracion: 'Administración de Personal',
  'relaciones-laborales': 'Relaciones Laborales',
  'personal-academico': 'Personal Académico',
  'sistemas-nomina': 'Sistemas y Nómina',
  cendi: 'CENDI y Jardín de Niños',
};

export const MODALIDADES = ['linea', 'presencial', 'mixta'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

/*
 * Lo que publica una dirección de personal, y que el sitio real muestra en tres
 * columnas en su portada: circulares con folio, avisos operativos y
 * convocatorias de capacitación.
 *
 * Es contenido VIVO —cambia cada semana— y por eso vive en una colección con
 * fecha, y no escrito dentro de una página.
 */
export const TIPOS_PUBLICACION = ['circular', 'aviso', 'curso'] as const;
export type TipoPublicacion = (typeof TIPOS_PUBLICACION)[number];

export const ETIQUETAS_TIPO_PUBLICACION: Record<TipoPublicacion, string> = {
  circular: 'Circulares',
  aviso: 'Avisos',
  curso: 'Cursos',
};

/** Singular, para la página de detalle y las migas. */
export const ETIQUETA_TIPO_SINGULAR: Record<TipoPublicacion, string> = {
  circular: 'Circular',
  aviso: 'Aviso',
  curso: 'Curso',
};

/*
 * Artículo plural de cada tipo.
 *
 * Existe porque el género no se puede deducir de la etiqueta, y componer la
 * frase con un artículo fijo produce "las 4 avisos". Es exactamente el fallo
 * que tenía la primera versión de la portada: acertaba con "las circulares" y
 * fallaba con los otros dos tipos, que son masculinos.
 *
 * Si algún día se añade un tipo nuevo, TypeScript obliga a declarar su
 * artículo aquí; no se puede olvidar.
 */
export const ARTICULO_TIPO_PUBLICACION: Record<TipoPublicacion, 'las' | 'los'> = {
  circular: 'las',
  aviso: 'los',
  curso: 'los',
};

/** "Otras circulares" / "Otros avisos". Se deriva del artículo. */
export const otrasUOtros = (tipo: TipoPublicacion): string =>
  ARTICULO_TIPO_PUBLICACION[tipo] === 'las' ? 'Otras' : 'Otros';

/** Icono de cada tipo en la portada. Las claves existen en base/iconos.ts. */
export const ICONO_TIPO_PUBLICACION: Record<TipoPublicacion, string> = {
  circular: 'documento',
  aviso: 'aviso',
  curso: 'birrete',
};

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  constancias: 'Constancias y documentos',
  nombramientos: 'Nombramientos y contratación',
  prestaciones: 'Prestaciones y seguridad social',
  pagos: 'Pagos y nómina',
  licencias: 'Licencias y permisos',
  jubilacion: 'Jubilación y retiro',
};

export const ETIQUETAS_ROL: Record<Rol, string> = {
  academico: 'Personal académico',
  administrativo: 'Personal administrativo',
  jefe: 'Jefaturas de dependencia',
};

export const ETIQUETAS_MODALIDAD: Record<Modalidad, string> = {
  linea: 'En línea',
  presencial: 'Presencial',
  mixta: 'En línea y presencial',
};
