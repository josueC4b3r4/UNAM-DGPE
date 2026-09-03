#!/usr/bin/env node
/**
 * Auditoría del HTML generado.
 *
 *   npm run build && npm run auditoria
 *
 * Revisa las páginas YA CONSTRUIDAS, no el código fuente. Esa es la diferencia
 * que importa: `astro check` valida tipos y los componentes se ven bien por
 * separado, pero un enlace roto o un `id` repetido solo existen en el HTML
 * final, cuando todo se junta.
 *
 * Lo que busca son fallos que NO se ven navegando:
 *
 * - Enlaces internos a páginas que no existen. Se descubren cuando alguien los
 *   pulsa, normalmente delante de quien menos conviene.
 * - `id` repetidos. `document.getElementById` devuelve el primero, así que un
 *   duplicado hace que una etiqueta apunte al control equivocado y que el
 *   enlace "saltar al contenido" salte a otra parte.
 * - Páginas sin <h1> o con varios. Quien navega con lector de pantalla usa los
 *   encabezados como índice; sin <h1> no hay título de página.
 * - Saltos en la jerarquía de encabezados (de h2 a h4). Suena a detalle y no lo
 *   es: al recorrer por niveles, un salto se percibe como contenido que falta.
 * - Imágenes sin `alt`. Sin el atributo, un lector de pantalla lee la ruta del
 *   archivo.
 * - Enlaces y botones sin texto accesible. Se anuncian como "enlace", sin más.
 *
 * Sin dependencias de análisis de HTML: las expresiones regulares bastan porque
 * el HTML lo genera Astro y es predecible. No serviría para HTML arbitrario.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/* fileURLToPath y no `.pathname`: en Windows este último da "/D:/UNAM-DGPE"
   con una barra de más, y `join` construye rutas que no existen. */
const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');

/* --- Utilidades ---------------------------------------------------------- */

async function paginas(dir) {
  const encontradas = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) encontradas.push(...(await paginas(ruta)));
    else if (entrada.name.endsWith('.html')) encontradas.push(ruta);
  }
  return encontradas;
}

/** Ruta de la página tal y como la ve el navegador: dist/a/index.html → /a/ */
function rutaPublica(archivo) {
  const rel = relative(DIST, archivo).split(/[\\/]/).join('/');
  return '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
}

/** Quita <script>, <style> y comentarios: su contenido no es marcado. */
function sinRuido(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

const atributo = (etiqueta, nombre) =>
  etiqueta.match(new RegExp(`\\b${nombre}\\s*=\\s*"([^"]*)"`, 'i'))?.[1] ?? null;

/* --- Comprobaciones ------------------------------------------------------ */

const problemas = [];
const anota = (pagina, tipo, detalle) => problemas.push({ pagina, tipo, detalle });

const archivos = await paginas(DIST);
const rutasExistentes = new Set(archivos.map(rutaPublica));

/* Anclas disponibles en cada página, para validar enlaces con #. */
const anclasPorRuta = new Map();
const contenidoPorArchivo = new Map();

for (const archivo of archivos) {
  const html = await readFile(archivo, 'utf8');
  contenidoPorArchivo.set(archivo, html);
  const ids = [...sinRuido(html).matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]);
  anclasPorRuta.set(rutaPublica(archivo), new Set(ids));
}

for (const archivo of archivos) {
  const pagina = rutaPublica(archivo);
  const html = contenidoPorArchivo.get(archivo);
  const limpio = sinRuido(html);

  /* 1. Un solo <h1>. */
  const h1 = [...limpio.matchAll(/<h1\b/gi)].length;
  if (h1 === 0) anota(pagina, 'sin h1', 'la página no tiene título principal');
  if (h1 > 1) anota(pagina, 'varios h1', `${h1} encabezados de nivel 1`);

  /* 2. Jerarquía de encabezados sin saltos. */
  const niveles = [...limpio.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < niveles.length; i++) {
    if (niveles[i] - niveles[i - 1] > 1) {
      anota(pagina, 'salto de encabezado', `de h${niveles[i - 1]} a h${niveles[i]}`);
    }
  }

  /* 3. `id` únicos. */
  const ids = [...limpio.matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]);
  const vistos = new Set();
  for (const id of ids) {
    if (vistos.has(id)) anota(pagina, 'id duplicado', `#${id}`);
    vistos.add(id);
  }

  /* 4. Idioma y metadatos. */
  if (!/<html[^>]+\blang\s*=\s*"[^"]+"/i.test(html)) anota(pagina, 'sin lang', '<html> sin idioma');
  if (!/<title>[^<]{3,}<\/title>/i.test(html)) anota(pagina, 'sin título', '<title> vacío o ausente');
  if (!/<meta[^>]+name="description"[^>]+content="[^"]{10,}"/i.test(html)) {
    anota(pagina, 'sin descripción', 'falta <meta name="description">');
  }

  /* 5. Imágenes con alt (aunque sea vacío, que significa "decorativa"). */
  for (const [etiqueta] of limpio.matchAll(/<img\b[^>]*>/gi)) {
    if (atributo(etiqueta, 'alt') === null) {
      anota(pagina, 'imagen sin alt', etiqueta.slice(0, 80));
    }
  }

  /* 6. Enlaces y botones con nombre accesible. */
  for (const m of limpio.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const [, etiqueta, atributos, interior] = m;
    if (etiqueta.toLowerCase() === 'a' && !/\bhref\s*=/.test(atributos)) continue;
    const texto = interior
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .trim();
    const etiquetado =
      /aria-label\s*=\s*"[^"]{2,}"/i.test(atributos) ||
      /aria-labelledby\s*=\s*"[^"]+"/i.test(atributos) ||
      /\btitle\s*=\s*"[^"]{2,}"/i.test(atributos);
    if (!texto && !etiquetado) {
      anota(pagina, 'sin nombre accesible', `<${etiqueta}> vacío: ${m[0].slice(0, 70)}`);
    }
  }

  /* 7. Enlaces internos que llevan a ninguna parte. */
  for (const [, href] of limpio.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"]+)"/gi)) {
    if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) {
      /* Ancla dentro de la misma página. */
      if (href.startsWith('#') && href.length > 1) {
        const id = decodeURIComponent(href.slice(1));
        if (!anclasPorRuta.get(pagina)?.has(id)) {
          anota(pagina, 'ancla rota', href);
        }
      }
      continue;
    }
    if (!href.startsWith('/')) {
      anota(pagina, 'enlace relativo', `"${href}" cambia de destino según la página`);
      continue;
    }

    /* Se separa primero el ancla y después la cadena de consulta. El orden
       importa: "/tramites/?categoria=pagos#lista" lleva las dos, y sin quitar
       el "?" se buscaría una página literalmente llamada "?categoria=pagos".
       Los parámetros son parte del destino, no de la ruta: el listado los lee
       con URLSearchParams para llegar ya filtrado. */
    const [sinAncla, ancla] = href.split('#');
    const ruta = sinAncla.split('?')[0];
    const normalizada = ruta.endsWith('/') ? ruta : `${ruta}/`;

    /* Puede ser una página o un archivo estático de public/. */
    const esArchivo = /\.[a-z0-9]{2,5}$/i.test(ruta);
    if (esArchivo) continue;

    if (!rutasExistentes.has(normalizada)) {
      anota(pagina, 'enlace roto', `${href} → no existe ${normalizada}`);
    } else if (ancla && !anclasPorRuta.get(normalizada)?.has(decodeURIComponent(ancla))) {
      anota(pagina, 'ancla rota', href);
    }
  }
}

/* --- Informe -------------------------------------------------------------- */

console.log(`\n  Auditoría del HTML generado — ${archivos.length} páginas\n`);

if (problemas.length === 0) {
  console.log(`  ✓ Sin enlaces rotos, id duplicados ni fallos de estructura.\n`);
  process.exit(0);
}

const porTipo = new Map();
for (const p of problemas) {
  if (!porTipo.has(p.tipo)) porTipo.set(p.tipo, []);
  porTipo.get(p.tipo).push(p);
}

for (const [tipo, lista] of [...porTipo].sort((a, b) => b[1].length - a[1].length)) {
  console.error(`  ✗ ${tipo} (${lista.length})`);
  for (const p of lista.slice(0, 8)) console.error(`      ${p.pagina}  ${p.detalle}`);
  if (lista.length > 8) console.error(`      … y ${lista.length - 8} más`);
  console.error('');
}

console.error(`  ✗ ${problemas.length} problemas en ${porTipo.size} categorías.\n`);
process.exit(1);
