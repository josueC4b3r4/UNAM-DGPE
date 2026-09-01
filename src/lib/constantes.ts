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

export const MODALIDADES = ['linea', 'presencial', 'mixta'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

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
