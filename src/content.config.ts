import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { AREAS, CATEGORIAS, MODALIDADES, ROLES, TIPOS_PUBLICACION } from './lib/constantes';

/*
 * Esquemas de contenido.
 *
 * Todo lo que se puede escribir mal, se valida aquí. Si alguien crea un trámite
 * sin `resumen`, o pone un rol que no existe, el build falla con un mensaje
 * claro señalando el archivo y el campo — no se descubre el error en la demo
 * frente al responsable.
 *
 * Regla de oro para editar contenido: los datos ESTRUCTURADOS (los que el
 * buscador y los filtros necesitan) van en el frontmatter; la PROSA va en el
 * cuerpo del Markdown.
 */

const tramites = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/tramites' }),
  schema: z.object({
    titulo: z.string().min(5),

    /** Una o dos frases. Se muestra en los resultados del buscador y en las tarjetas. */
    resumen: z.string().min(20).max(220),

    /** Quién puede iniciar este trámite. Alimenta los filtros y las páginas de rol. */
    roles: z.array(z.enum(ROLES)).min(1),

    categoria: z.enum(CATEGORIAS),

    /**
     * Área de la dirección que lo resuelve.
     *
     * Es la SEGUNDA vía de entrada, no la principal: sirve a quien ya conoce la
     * estructura de la dependencia. La categoría —el lenguaje de quien busca—
     * sigue mandando en el listado y en el buscador.
     *
     * ⚠ La asignación está inventada. Ver la nota en lib/constantes.ts.
     */
    area: z.enum(AREAS),

    modalidad: z.enum(MODALIDADES),

    /** Texto libre y honesto: "3 días hábiles", no un número que finja precisión. */
    duracion: z.string(),

    costo: z.string().default('Gratuito'),

    /**
     * Cómo lo busca la gente de verdad, no cómo se llama en el organigrama.
     * Este campo es la razón por la que buscar "renuncia" encuentra "baja".
     */
    sinonimos: z.array(z.string()).default([]),

    /** Aparece en la sección de trámites frecuentes del home. */
    destacado: z.boolean().default(false),

    actualizado: z.coerce.date(),

    contacto: z.object({
      area: z.string(),
      correo: z.string().email(),
      telefono: z.string().optional(),
      horario: z.string().optional(),
    }),

    /** Trámites relacionados. `reference` valida que el slug exista de verdad. */
    relacionados: z.array(reference('tramites')).default([]),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/roles' }),
  schema: z.object({
    /** Debe coincidir con un valor de ROLES. */
    clave: z.enum(ROLES),

    /** Título de la página de rol: "Personal académico". */
    titulo: z.string(),

    /**
     * Texto del acceso en el home. Va en primera persona a propósito
     * ("Soy personal académico"): el usuario se identifica antes de navegar.
     */
    etiquetaHome: z.string(),

    /** Frase de apoyo bajo la etiqueta en el home. */
    descripcionHome: z.string().max(140),

    /** Clave del icono en RejillaRoles.astro. */
    icono: z.enum(['birrete', 'engrane', 'personas', 'lupa']),

    orden: z.number().int(),

    /** Entradilla de la página de rol. */
    entradilla: z.string(),

    /** Trámites que se muestran arriba en la página de rol, en este orden. */
    destacados: z.array(reference('tramites')).default([]),
  }),
});

const banners = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/banners' }),
  schema: z.object({
    /** Va en HTML, no dentro de la imagen: se puede buscar, traducir y ampliar. */
    titulo: z.string().min(5).max(70),

    /** Una o dos frases. Cabe sobre la imagen sin empujar el resto del banner. */
    texto: z.string().min(20).max(160),

    /** Texto del botón. Un verbo y su objeto: "Ver el video", no "Más información". */
    etiquetaAccion: z.string().min(3).max(30),

    /**
     * Destino: ruta interna que empieza con "/" o URL completa con esquema.
     * Un "tramites/" suelto apuntaría a una ruta relativa distinta en cada
     * página, así que se rechaza en el build en vez de descubrirse navegando.
     */
    href: z
      .string()
      .refine(
        (valor) => valor.startsWith('/') || /^https?:\/\//.test(valor),
        'Debe ser una ruta interna que empiece con "/" o una URL con http(s)://'
      ),

    /** Nombre del archivo dentro de public/media/banners/. Sin imagen se dibuja
        un degradado de marca y el banner sigue siendo legible. */
    imagen: z.string().optional(),

    /** Vacío si la imagen es decorativa y el título ya dice lo mismo. */
    alt: z.string().default(''),

    orden: z.number().int(),

    /** Apaga el banner sin borrar el archivo. */
    activo: z.boolean().default(true),
  }),
});

/*
 * Cursos con precio. Es la única colección que maneja dinero, y por eso es la
 * que más valida: un trámite mal escrito confunde, un precio mal escrito cuesta.
 */
const cursos = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/cursos' }),
  schema: z.object({
    titulo: z.string().min(5),

    resumen: z.string().min(20).max(220),

    /** A quién va dirigido. Reutiliza los roles del resto del sitio. */
    dirigidoA: z.array(z.enum(ROLES)).min(1),

    /**
     * Tarifas por modalidad, en CENTAVOS enteros.
     *
     * Centavos y no pesos porque la aritmética del cotizador trabaja en enteros
     * para no perder precisión (ver src/lib/cotizacion.ts). `z.number().int()`
     * es lo que impide que alguien escriba 350.50 aquí y lo descubra la persona
     * que reciba un total con un centavo de menos.
     *
     * Para escribirlo: $525.00 por hora se anota 52500.
     */
    tarifas: z
      .array(
        z.object({
          modalidad: z.enum(MODALIDADES),
          tarifaHora: z
            .number()
            .int('La tarifa va en centavos enteros: $525.00 se escribe 52500.')
            .nonnegative(),
        })
      )
      .min(1)
      /*
       * Sin esto, dos tarifas para la misma modalidad compilarían y el
       * cotizador usaría la primera en silencio: el precio mostrado dependería
       * del orden de las líneas del archivo.
       */
      .refine(
        (t) => new Set(t.map((x) => x.modalidad)).size === t.length,
        'Hay dos tarifas para la misma modalidad; el cotizador usaría una de las dos sin avisar.'
      ),

    /** Duraciones que ofrece el curso. La persona elige una. */
    duraciones: z
      .array(
        z.object({
          horas: z.number().int().positive(),
          /** Cómo se le llama: "Intensivo". El "(12 h)" lo pone la interfaz. */
          etiqueta: z.string().min(3).max(40),
        })
      )
      .min(1)
      .refine(
        (d) => new Set(d.map((x) => x.horas)).size === d.length,
        'Hay dos duraciones con las mismas horas: el selector mostraría opciones idénticas.'
      ),

    orden: z.number().int(),

    /** Apaga el curso sin borrar el archivo. */
    activo: z.boolean().default(true),
  }),
});

/*
 * Circulares, avisos y convocatorias: lo que la dirección publica cada semana.
 *
 * Es la única colección de contenido CADUCO. Un trámite se describe una vez y
 * dura años; una circular nace con fecha y envejece. Por eso `fecha` es
 * obligatoria y el orden por defecto es del más reciente al más viejo: una
 * portada que muestra la circular de hace ocho meses arriba es una portada
 * que nadie está manteniendo.
 */
const publicaciones = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/publicaciones' }),
  schema: z
    .object({
      tipo: z.enum(TIPOS_PUBLICACION),

      titulo: z.string().min(8),

      /**
       * Folio oficial, del estilo "DGPE/031/2026".
       *
       * Solo lo llevan las circulares, y para ellas es obligatorio: es como las
       * citan las dependencias entre sí. Un aviso o un curso no tienen folio, y
       * ponerles uno inventado sería darles una formalidad que no tienen.
       */
      folio: z.string().optional(),

      fecha: z.coerce.date(),

      /** Una frase de contexto bajo el título. */
      resumen: z.string().min(15).max(200).optional(),

      /** Baja una publicación de la portada sin borrar el archivo. */
      vigente: z.boolean().default(true),
    })
    .refine((d) => d.tipo !== 'circular' || Boolean(d.folio), {
      message: 'Una circular necesita folio: es como la citan las dependencias entre sí.',
      path: ['folio'],
    })
    .refine((d) => d.tipo === 'circular' || !d.folio, {
      message: 'Solo las circulares llevan folio; un aviso con folio finge una formalidad que no tiene.',
      path: ['folio'],
    }),
});

export const collections = { tramites, roles, banners, cursos, publicaciones };
