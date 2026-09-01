#!/usr/bin/env node
/**
 * design/tokens.json  ──►  src/styles/tokens/*.css
 *
 * Corre solo con `npm run dev` y `npm run build`, así que en la práctica nunca
 * hay que invocarlo a mano. Si tu compañera exporta tokens nuevos desde Tokens
 * Studio, basta con reiniciar el servidor.
 *
 * Los CSS generados NO se versionan (ver .gitignore): la fuente de verdad es
 * el JSON.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  RAIZ,
  TEMAS,
  leerTokens,
  aplanar,
  aNombreCss,
  resolverAliasACss,
} from './lib/tokens.mjs';

const DIR_SALIDA = resolve(RAIZ, 'src', 'styles', 'tokens');

const AVISO = `/*
 * ARCHIVO GENERADO — NO EDITAR A MANO.
 *
 * Se regenera desde design/tokens.json con \`npm run tokens\`
 * (que ya corre automáticamente en \`npm run dev\` y \`npm run build\`).
 *
 * Cualquier cambio hecho aquí se pierde en el siguiente arranque.
 */
`;

/** Convierte una lista de tokens en líneas `  --nombre: valor;` */
function aDeclaraciones(tokens, sangria = '  ') {
  return tokens
    .map(({ ruta, valor, descripcion }) => {
      const linea = `${sangria}${aNombreCss(ruta)}: ${resolverAliasACss(valor)};`;
      return descripcion ? `${sangria}/* ${descripcion} */\n${linea}` : linea;
    })
    .join('\n');
}

const tokens = leerTokens();

/* ------------------------------------------------------------------ */
/* 1. Primitivos — una sola capa, sin variantes de tema                */
/* ------------------------------------------------------------------ */

const primitivos = aplanar(tokens.primitivo, 'primitivo');

const cssPrimitivos = `${AVISO}
/*
 * CAPA 1 — PRIMITIVOS
 *
 * La paleta cruda. No usar estos tokens directamente en un componente:
 * usar los semánticos de semanticos.css. Si escribes \`var(--p-color-azul-600)\`
 * en un componente, ese color no podrá cambiar con el tema.
 */
:root {
${aDeclaraciones(primitivos)}
}
`;

/* ------------------------------------------------------------------ */
/* 2. Semánticos — comunes + un bloque por tema                        */
/* ------------------------------------------------------------------ */

const comunes = aplanar(tokens.semantico.comun, 'semantico.comun');

const porTema = Object.fromEntries(
  TEMAS.map((tema) => {
    if (!tokens.semantico[tema]) {
      throw new Error(`Falta el tema "${tema}" en design/tokens.json`);
    }
    return [tema, aplanar(tokens.semantico[tema], `semantico.${tema}`)];
  })
);

// Comprobación de simetría: si un token existe en claro pero no en oscuro,
// el componente se rompería solo en uno de los temas. Mejor fallar en build.
const nombresClaro = new Set(porTema.claro.map((t) => aNombreCss(t.ruta)));
const nombresOscuro = new Set(porTema.oscuro.map((t) => aNombreCss(t.ruta)));

const soloEnClaro = [...nombresClaro].filter((n) => !nombresOscuro.has(n));
const soloEnOscuro = [...nombresOscuro].filter((n) => !nombresClaro.has(n));

if (soloEnClaro.length || soloEnOscuro.length) {
  console.error('\n✗ Los temas claro y oscuro no están sincronizados:\n');
  for (const n of soloEnClaro) console.error(`  ${n} — falta en "oscuro"`);
  for (const n of soloEnOscuro) console.error(`  ${n} — falta en "claro"`);
  console.error('\nAgrega el token que falta en design/tokens.json.\n');
  process.exit(1);
}

const cssSemanticos = `${AVISO}
/*
 * CAPA 2 — SEMÁNTICOS
 *
 * Estos son los tokens que consumen los componentes. El nombre describe el USO
 * (--color-texto-principal), no el color (--azul-oscuro), y su valor cambia
 * solo con el tema. Un componente escrito contra esta capa funciona en claro y
 * en oscuro sin una sola línea condicional.
 *
 * Estrategia de tema:
 *   1. :root                                   -> claro (valor por defecto)
 *   2. @media (prefers-color-scheme: dark)     -> oscuro si el sistema lo pide
 *      ... salvo que el usuario haya forzado claro con [data-tema="claro"]
 *   3. [data-tema="oscuro"]                    -> oscuro forzado por el usuario
 */

:root {
  color-scheme: light;

${aDeclaraciones(comunes)}

${aDeclaraciones(porTema.claro)}
}

/* El sistema pide oscuro y el usuario no ha forzado el claro. */
@media (prefers-color-scheme: dark) {
  :root:not([data-tema='claro']) {
    color-scheme: dark;

${aDeclaraciones(porTema.oscuro, '    ')}
  }
}

/* El usuario eligió oscuro explícitamente en el header. */
:root[data-tema='oscuro'] {
  color-scheme: dark;

${aDeclaraciones(porTema.oscuro)}
}

/* El usuario eligió claro explícitamente: los valores de :root ya son los
   correctos, solo hay que reafirmar color-scheme por si el SO pide oscuro. */
:root[data-tema='claro'] {
  color-scheme: light;
}
`;

const cssIndice = `${AVISO}
@import './primitivos.css';
@import './semanticos.css';
`;

mkdirSync(DIR_SALIDA, { recursive: true });
writeFileSync(resolve(DIR_SALIDA, 'primitivos.css'), cssPrimitivos, 'utf8');
writeFileSync(resolve(DIR_SALIDA, 'semanticos.css'), cssSemanticos, 'utf8');
writeFileSync(resolve(DIR_SALIDA, 'index.css'), cssIndice, 'utf8');

const total = primitivos.length + comunes.length + porTema.claro.length + porTema.oscuro.length;
console.log(
  `✓ Tokens generados: ${primitivos.length} primitivos, ${comunes.length} semánticos comunes, ` +
    `${porTema.claro.length} por tema (×${TEMAS.length}) — ${total} custom properties en total.`
);
