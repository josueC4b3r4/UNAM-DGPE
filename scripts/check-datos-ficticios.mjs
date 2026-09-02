#!/usr/bin/env node
/**
 * Impide que datos de contacto REALES entren en el prototipo.
 *
 *   npm run check:ficticios
 *
 * Este sitio lleva la identidad de la UNAM y describe trámites de una
 * dependencia que existe, pero todo su contenido es inventado. Mientras se
 * sirva en localhost eso da igual. Publicado, deja de darlo: alguien que busca
 * un trámite de verdad puede llegar aquí, escribir a un buzón que no existe
 * —y concluir que la UNAM no le contesta— o llamar a un número real de la
 * Universidad preguntando por una extensión inventada.
 *
 * Ya pasó una vez: el pie de página mostraba 55 5622 0000, que es el
 * conmutador real, en las 23 páginas. Por eso esto es un script y no una nota
 * en el README.
 *
 * Si algún día el proyecto recibe datos oficiales de la DGPE y deja de ser una
 * maqueta, este script hay que retirarlo a conciencia, no silenciarlo.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { RAIZ } from './lib/tokens.mjs';

/** Dónde se busca. dist/ no: es generado, y fallaría por duplicado. */
const DIRECTORIOS = ['src', 'public'];

const EXTENSIONES = ['.astro', '.md', '.ts', '.js', '.mjs', '.css', '.json', '.txt', '.html'];

const PROHIBIDOS = [
  {
    nombre: 'dominio real de la UNAM en un dato de contacto',
    /* Se persigue el correo, no la palabra: la prosa sí puede mencionar
       "tu cuenta @unam.mx", que es un hecho cierto sobre el lector y no un
       buzón al que vaya a escribir nadie. */
    patron: /[\w.+-]+@[\w.-]*unam\.mx\b/gi,
    alternativa: 'Usa un dominio .example (RFC 2606: reservado, nunca resuelve).',
  },
  {
    nombre: 'conmutador real de la UNAM',
    patron: /\b55[\s-]?5622[\s-]?\d{4}\b/g,
    alternativa: 'Usa 55 0000 0000.',
  },
  {
    nombre: 'otros conmutadores reales de CU',
    patron: /\b55[\s-]?56(?:22|16|23)[\s-]?\d{4}\b/g,
    alternativa: 'Usa un número evidentemente de relleno.',
  },
];

function archivos(dir) {
  const salida = [];
  let entradas;
  try {
    entradas = readdirSync(dir);
  } catch {
    return salida;
  }
  for (const entrada of entradas) {
    const completa = join(dir, entrada);
    if (statSync(completa).isDirectory()) salida.push(...archivos(completa));
    else if (EXTENSIONES.some((e) => entrada.endsWith(e))) salida.push(completa);
  }
  return salida;
}

const hallazgos = [];

for (const base of DIRECTORIOS) {
  for (const archivo of archivos(join(RAIZ, base))) {
    const ruta = relative(RAIZ, archivo).split(sep).join('/');

    /* El propio verificador contiene los patrones que persigue. */
    if (ruta.endsWith('scripts/check-datos-ficticios.mjs')) continue;

    const lineas = readFileSync(archivo, 'utf8').split('\n');
    lineas.forEach((linea, i) => {
      /* Una línea puede explicar por qué el dato real se quitó. */
      if (linea.includes('dato-real-ok:')) return;

      for (const regla of PROHIBIDOS) {
        regla.patron.lastIndex = 0;
        const m = linea.match(regla.patron);
        if (m) {
          hallazgos.push({
            archivo: ruta,
            linea: i + 1,
            regla: regla.nombre,
            fragmento: m[0],
            alternativa: regla.alternativa,
          });
          /* Un aviso por línea: los patrones de teléfono se solapan y el mismo
             número salía reportado dos veces. */
          break;
        }
      }
    });
  }
}

if (hallazgos.length === 0) {
  console.log(
    '\n  ✓ Sin datos de contacto reales: ningún buzón ni teléfono del prototipo apunta a la UNAM.\n'
  );
  process.exit(0);
}

console.error(`\n  ✗ ${hallazgos.length} dato(s) de contacto REAL en un prototipo con contenido ficticio:\n`);
for (const h of hallazgos) {
  console.error(`  ${h.archivo}:${h.linea}`);
  console.error(`    ${h.regla}: ${h.fragmento}`);
  console.error(`    → ${h.alternativa}\n`);
}
console.error(
  '  Publicado así, alguien que busque un trámite real puede escribir o llamar\n' +
    '  a un contacto de la UNAM esperando un servicio que este sitio no presta.\n'
);
process.exit(1);
