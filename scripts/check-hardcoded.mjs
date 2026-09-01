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
  {
    nombre: 'font-family literal',
    patron: /font-family\s*:\s*(?!var\(|inherit\b)[^;}]+/g,
    sugerencia: 'Usa var(--tipo-familia-base) o var(--tipo-familia-mono).',
  },
  {
    nombre: 'font-size literal',
    patron: /font-size\s*:\s*(?!var\(|inherit|100%|1em\b)[^;}]*\d/g,
    sugerencia: 'Usa un token: var(--tipo-cuerpo-tamano), var(--tipo-titulo-2-tamano), etc.',
  },
];

function esExcluida(ruta) {
  return EXCLUIDAS.some((ex) => ruta.includes(ex));
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

  lineas.forEach((linea, i) => {
    // Escape hatch justificado, en esta línea o en la anterior.
    if (linea.includes('tokens-ok:') || (lineas[i - 1] ?? '').includes('tokens-ok:')) return;

    for (const regla of REGLAS) {
      regla.patron.lastIndex = 0;
      const coincidencias = linea.match(regla.patron);
      if (coincidencias) {
        hallazgos.push({
          archivo: rutaRelativa,
          linea: i + 1,
          regla: regla.nombre,
          fragmento: coincidencias[0].trim().slice(0, 60),
          sugerencia: regla.sugerencia,
        });
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
  '  Si una excepción es realmente necesaria, agrega un comentario con\n' +
    '  "tokens-ok: <razón>" en la misma línea o en la anterior.\n'
);
process.exit(1);
