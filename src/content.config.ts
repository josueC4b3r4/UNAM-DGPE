import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIAS, MODALIDADES, ROLES } from './lib/constantes';

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

export const collections = { tramites, roles };
