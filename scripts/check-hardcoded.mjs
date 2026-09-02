#!/usr/bin/env node
/**
 * Hace verificable el criterio de aceptación:
 * "ningún color ni tipografía hardcodeado fuera de los tokens".
 *
 *   npm run a11y:tokens
 *
 * Recorre src/ y falla si encuentra un color literal (#hex, rgb(), hsl()) o un
 * font-family / font-size literal fuera de src/styles/tokens/.
 *
 * Escape hatch: agregar `tokens-ok:` con una razón en la misma línea o en la
 * anterior. Es deliberadamente incómodo — obliga a justificar la excepción.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { RAIZ } from './lib/tokens.mjs';

const DIR_FUENTE = join(RAIZ, 'src');

/** Rutas que quedan fuera del análisis (con separador del sistema). */
const EXCLUIDAS = [join('styles', 'tokens')];

const EXTENSIONES = ['.astro', '.css', '.ts', '.js'];

const REGLAS = [
  {
    nombre: 'color hexadecimal',
    patron: /#[0-9a-fA-F]{3,8}\b/g,
    sugerencia: 'Usa un token semántico, p. ej. var(--color-texto-principal).',
  },
  {
    nombre: 'color rgb()/rgba()',
    patron: /\brgba?\s*\(/g,
    sugerencia: 'Define el color en design/tokens.json y consúmelo con var().',
  },
  {
    nombre: 'color hsl()/hsla()',
    patron: /\bhsla?\s*\(/g,
    sugerencia: 'Define el color en design/tokens.json y consúmelo con var().',
  },
  {
    nombre: 'color con nombre',
    // Solo dentro de una declaración de color, para no marcar la palabra
    // "white" dentro de un texto en español o un nombre de clase.
    patron:
      /(?:^|[\s:;{])(?:color|background|background-color|border-color|fill|stroke|outline-color)\s*:\s*(white|black|red|blue|green|gray|grey|silver|navy|gold|yellow|orange|purple)\b/gi,
    sugerencia: 'Usa un token semántico en vez de un color con nombre.',
  },
  /*
   * Las dos reglas de tipografía no se pueden expresar solo con un patrón: hay
   * que mirar el VALOR de la declaración y decidir. Se capturan con un grupo y
   * se juzgan con `aceptable`.
   *
   * Antes iban con un lookahead negativo — `font-size\s*:\s*(?!var\()...` — y
   * era incorrecto: `\s*` puede retroceder a cero espacios, así que el
   * lookahead se evaluaba sobre " var(" (con el espacio delante), no coincidía
   * con "var(", y daba por literal toda declaración que usara un token con un
   * espacio tras los dos puntos. Marcaba 23 falsos positivos.
   */
  {
    nombre: 'font-family literal',
    patron: /font-family\s*:\s*([^;}]+)/g,
    aceptable: (valor) => /^(?:var\(|inherit\b)/.test(valor.trim()),
    sugerencia: 'Usa var(--tipo-familia-base) o var(--tipo-familia-mono).',
  },
  {
    nombre: 'font-size literal',
    patron: /font-size\s*:\s*([^;}]+)/g,
    /* Se borran las referencias a tokens y las palabras clave permitidas; si
       lo que queda todavía tiene un número, es un valor escrito a mano. */
    aceptable: (valor) =>
      !/\d/.test(
        valor
          .replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
          /* `100%` no puede llevar `\b` al final: `%` ya es un carácter que no
             es de palabra, así que la frontera nunca coincidiría. */
          .replace(/\binherit\b|100%|\b1em\b/g, '')
      ),
    sugerencia: 'Usa un token: var(--tipo-cuerpo-tamano), var(--tipo-titulo-2-tamano), etc.',
  },
];

function esExcluida(ruta) {
  return EXCLUIDAS.some((ex) => ruta.includes(ex));
}

/**
 * Marca qué líneas forman parte de un comentario.
 *
 * Hace falta para que el escape hatch funcione de verdad: antes se miraba solo
 * la línea anterior, así que un `tokens-ok:` escrito en el primer renglón de un
 * bloque de varias líneas quedaba fuera de alcance — la línea de encima de la
 * declaración era el cierre `*​/` o el final de una frase. En la práctica solo
 * se podían justificar excepciones con razones de un renglón, que son
 * precisamente las que menos falta hace explicar.
 */
function marcarComentarios(lineas) {
  const esComentario = new Array(lineas.length).fill(false);
  let dentroDeBloque = false;

  lineas.forEach((linea, i) => {
    if (dentroDeBloque) {
      esComentario[i] = true;
      if (linea.includes('*/')) dentroDeBloque = false;
      return;
    }

    const abre = linea.indexOf('/*');
    if (abre !== -1) {
      esComentario[i] = true;
      const cierra = linea.indexOf('*/', abre + 2);
      if (cierra === -1) dentroDeBloque = true;
      return;
    }

    esComentario[i] = linea.trimStart().startsWith('//');
  });

  return esComentario;
}

/**
 * Marca qué líneas caen dentro de un bloque `@font-face`.
 *
 * Ahí `font-family` **declara** el nombre de la familia; no lo consume. Es
 * imposible escribirlo con un token, así que la regla no aplica. Sin esto,
 * cada fuente nueva del proyecto produciría un error que sólo se puede callar
 * con un `tokens-ok:`, y un verificador que obliga a silenciarlo en el caso
 * normal acaba ignorándose entero.
 */
function marcarFontFace(lineas) {
  const dentro = new Array(lineas.length).fill(false);
  let profundidad = 0;
  let activo = false;

  lineas.forEach((linea, i) => {
    if (!activo && /@font-face\b/.test(linea)) {
      activo = true;
      profundidad = 0;
    }
    if (!activo) return;

    dentro[i] = true;
    profundidad += (linea.match(/\{/g) ?? []).length;
    profundidad -= (linea.match(/\}/g) ?? []).length;
    if (profundidad <= 0 && linea.includes('}')) activo = false;
  });

  return dentro;
}

/** ¿Hay un `tokens-ok:` en la línea o en el comentario que la precede? */
function justificada(lineas, esComentario, i) {
  if (lineas[i].includes('tokens-ok:')) return true;

  for (let j = i - 1; j >= 0 && esComentario[j]; j--) {
    if (lineas[j].includes('tokens-ok:')) return true;
  }
  return false;
}

function archivos(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir)) {
    const completa = join(dir, entrada);
    if (statSync(completa).isDirectory()) {
      if (!esExcluida(relative(DIR_FUENTE, completa))) salida.push(...archivos(completa));
    } else if (EXTENSIONES.some((e) => entrada.endsWith(e))) {
      salida.push(completa);
    }
  }
  return salida;
}

const hallazgos = [];

for (const archivo of archivos(DIR_FUENTE)) {
  const rutaRelativa = relative(RAIZ, archivo).split(sep).join('/');
  const lineas = readFileSync(archivo, 'utf8').split('\n');
  const esComentario = marcarComentarios(lineas);
  const enFontFace = marcarFontFace(lineas);

  lineas.forEach((linea, i) => {
    if (justificada(lineas, esComentario, i)) return;

    for (const regla of REGLAS) {
      /* Dentro de @font-face, font-family declara el nombre de la fuente. */
      if (enFontFace[i] && regla.nombre === 'font-family literal') continue;
      regla.patron.lastIndex = 0;
      for (const coincidencia of linea.matchAll(regla.patron)) {
        /* Reglas con grupo de captura: el veredicto lo da `aceptable` sobre el
           valor, no la mera presencia del patrón. */
        const valor = coincidencia[1];
        if (regla.aceptable && valor !== undefined && regla.aceptable(valor)) continue;

        hallazgos.push({
          archivo: rutaRelativa,
          linea: i + 1,
          regla: regla.nombre,
          fragmento: coincidencia[0].trim().slice(0, 60),
          sugerencia: regla.sugerencia,
        });
        break; // Un aviso por regla y línea es suficiente.
      }
    }
  });
}

if (hallazgos.length === 0) {
  console.log('\n  ✓ Sistema de diseño centralizado: cero colores o tipografías literales en src/.\n');
  process.exit(0);
}

console.error(`\n  ✗ ${hallazgos.length} valor(es) fuera del sistema de diseño:\n`);
for (const h of hallazgos) {
  console.error(`  ${h.archivo}:${h.linea}`);
  console.error(`    ${h.regla}: ${h.fragmento}`);
  console.error(`    → ${h.sugerencia}\n`);
}
console.error(
  '  Si una excepción es realmente necesaria, agrega "tokens-ok: <razón>"\n' +
    '  en la MISMA línea de la declaración, o en el comentario justo encima\n' +
    '  de ella (el bloque puede ocupar varias líneas).\n\n' +
    '  Ojo: el comentario va pegado a la declaración, no encima del selector.\n' +
    '  Una regla puede tener muchas declaraciones y cada excepción se justifica\n' +
    '  por separado.\n'
);
process.exit(1);
