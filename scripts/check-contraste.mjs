#!/usr/bin/env node
/**
 * Verifica el contraste WCAG 2.1 de cada par de tokens que realmente se usa
 * junto en la interfaz, en los DOS temas.
 *
 *   npm run a11y:contraste
 *
 * Sale con código 1 si algún par no cumple, así que puede correr en CI o como
 * pre-commit. Además escribe docs/resultado-contraste.md para que el reporte
 * de accesibilidad nunca quede desactualizado respecto a los tokens.
 *
 * Umbrales (WCAG 2.1 AA):
 *   4.5:1  texto normal                        (1.4.3)
 *   3.0:1  texto grande (>=24px o >=18.66px negrita) (1.4.3)
 *   3.0:1  componentes de UI y gráficos        (1.4.11)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  RAIZ,
  TEMAS,
  leerTokens,
  construirIndice,
  resolverAliasAValor,
  razonContraste,
} from './lib/tokens.mjs';

const AA_TEXTO = 4.5;
const AA_TEXTO_GRANDE = 3.0;
const AA_UI = 3.0;

/**
 * Los pares se declaran una sola vez: como los tokens semánticos tienen el
 * mismo nombre en claro y en oscuro, la misma lista se evalúa en ambos temas.
 */
const PARES = [
  // --- Texto sobre superficies -------------------------------------------
  ['color.textoPrincipal', 'color.superficieBase', AA_TEXTO, 'Cuerpo sobre fondo de página'],
  ['color.textoPrincipal', 'color.superficieSutil', AA_TEXTO, 'Cuerpo sobre sección alterna'],
  ['color.textoPrincipal', 'color.superficieElevada', AA_TEXTO, 'Cuerpo dentro de tarjeta'],
  ['color.textoPrincipal', 'color.superficieMarcaSutil', AA_TEXTO, 'Cuerpo sobre bloque de marca'],
  ['color.textoSecundario', 'color.superficieBase', AA_TEXTO, 'Texto de apoyo'],
  ['color.textoSecundario', 'color.superficieElevada', AA_TEXTO, 'Texto de apoyo en tarjeta'],
  ['color.textoTenue', 'color.superficieBase', AA_TEXTO, 'Metadatos (fechas, conteos)'],
  ['color.textoTenue', 'color.superficieSutil', AA_TEXTO, 'Metadatos sobre sección alterna'],
  ['color.textoTenue', 'color.superficieElevada', AA_TEXTO, 'Metadatos en tarjeta'],
  ['color.textoSobreMarca', 'color.superficieMarca', AA_TEXTO, 'Texto del header y del footer'],
  [
    'color.textoTenueSobreMarca',
    'color.superficieMarca',
    AA_TEXTO,
    'Texto secundario del header/footer',
  ],

  // --- Enlaces ------------------------------------------------------------
  ['color.textoEnlace', 'color.superficieBase', AA_TEXTO, 'Enlace en línea'],
  ['color.textoEnlace', 'color.superficieSutil', AA_TEXTO, 'Enlace sobre sección alterna'],
  ['color.textoEnlace', 'color.superficieElevada', AA_TEXTO, 'Enlace dentro de tarjeta'],
  ['color.textoEnlaceHover', 'color.superficieBase', AA_TEXTO, 'Enlace en hover'],

  // --- Botones ------------------------------------------------------------
  ['color.accionPrimariaTexto', 'color.accionPrimariaFondo', AA_TEXTO, 'Etiqueta de botón primario'],
  [
    'color.accionPrimariaTexto',
    'color.accionPrimariaFondoHover',
    AA_TEXTO,
    'Botón primario en hover',
  ],
  [
    'color.accionSecundariaTexto',
    'color.accionSecundariaFondo',
    AA_TEXTO,
    'Etiqueta de botón secundario',
  ],
  [
    'color.accionSecundariaTexto',
    'color.accionSecundariaFondoHover',
    AA_TEXTO,
    'Botón secundario en hover',
  ],

  // --- Acento y resaltado -------------------------------------------------
  ['color.acentoTexto', 'color.acentoFondo', AA_TEXTO, 'Texto sobre acento oro'],
  ['color.resaltadoTexto', 'color.resaltadoFondo', AA_TEXTO, 'Coincidencia resaltada en buscador'],

  // --- Mensajes de estado -------------------------------------------------
  ['color.exitoTexto', 'color.exitoFondo', AA_TEXTO, 'Mensaje de éxito'],
  ['color.alertaTexto', 'color.alertaFondo', AA_TEXTO, 'Mensaje de advertencia'],
  ['color.errorTexto', 'color.errorFondo', AA_TEXTO, 'Mensaje de error'],

  // --- No textual: WCAG 1.4.11 (3:1) --------------------------------------
  ['color.bordeFuerte', 'color.superficieBase', AA_UI, 'Borde de campo de formulario'],
  ['color.bordeFuerte', 'color.superficieElevada', AA_UI, 'Borde de campo dentro de tarjeta'],
  ['color.bordeFoco', 'color.superficieBase', AA_UI, 'Anillo de foco de teclado'],
  ['color.bordeFoco', 'color.superficieSutil', AA_UI, 'Anillo de foco sobre sección alterna'],
  ['color.bordeFoco', 'color.superficieElevada', AA_UI, 'Anillo de foco dentro de tarjeta'],
  /* Faltaba, y el hueco costó caro: el anillo se comprobaba contra las tres
     superficies claras pero nunca contra la de marca. Sobre el azul del
     encabezado y del pie daba 1.2:1 — invisible — y la verificación pasaba. */
  ['color.bordeFocoSobreMarca', 'color.superficieMarca', AA_UI, 'Anillo de foco sobre la marca'],
  /* La isla clara: el campo del buscador vive dentro del hero azul pero su
     propio fondo es claro, y ahí el anillo tiene que volver al valor oscuro. */
  ['color.bordeFocoEnClaro', 'color.superficieElevada', AA_UI, 'Anillo de foco en isla clara'],
  ['color.accionPrimariaFondo', 'color.superficieBase', AA_UI, 'Silueta del botón primario'],
  ['color.accionSecundariaBorde', 'color.superficieBase', AA_UI, 'Borde del botón secundario'],
  ['color.acentoLinea', 'color.superficieBase', AA_UI, 'Línea de acento decorativa-informativa'],
  ['color.exitoBorde', 'color.exitoFondo', AA_UI, 'Borde del mensaje de éxito'],
  ['color.alertaBorde', 'color.alertaFondo', AA_UI, 'Borde del mensaje de advertencia'],
  ['color.errorBorde', 'color.errorFondo', AA_UI, 'Borde del mensaje de error'],

  // --- Títulos grandes: umbral relajado a 3:1 (WCAG 1.4.3 "large text") ----
  ['color.acentoLineaSobreMarca', 'color.superficieMarca', AA_TEXTO_GRANDE, 'Acento oro sobre marca'],

  /*
   * Iconos dentro de su pastilla, en los encabezados de sección y en las
   * tarjetas de categoría.
   *
   * Este par existe porque su ausencia costó un fallo real: los componentes
   * usaban `acentoTexto` sobre este mismo fondo y daba 1.02:1 en tema oscuro
   * —seis iconos invisibles— sin que este script dijera nada. El token no
   * estaba mal: `acentoTexto` SÍ está verificado, pero contra `acentoFondo`,
   * que es el oro. Nadie había declarado la combinación que los componentes
   * usaban de verdad.
   *
   * La lección, y el motivo de esta nota: este verificador solo sabe de los
   * pares que alguien escribe aquí. Cada vez que un componente ponga un color
   * sobre un fondo nuevo, el par se declara aquí o no está comprobado.
   */
  ['color.textoEnlace', 'color.superficieMarcaSutil', AA_UI, 'Icono sobre su pastilla de marca'],
];

const tokens = leerTokens();
const indice = construirIndice(tokens);

/** Resuelve `color.textoPrincipal` dentro de un tema hasta su hex final. */
function hexDe(tema, rutaCorta) {
  const rutaCompleta = `semantico.${tema}.${rutaCorta}`;
  const crudo = indice.get(rutaCompleta);
  if (crudo === undefined) {
    throw new Error(`El token "${rutaCompleta}" no existe en design/tokens.json`);
  }
  return resolverAliasAValor(crudo, indice);
}

const resultados = [];
let fallos = 0;

for (const tema of TEMAS) {
  for (const [frente, fondo, minimo, uso] of PARES) {
    const hexFrente = hexDe(tema, frente);
    const hexFondo = hexDe(tema, fondo);
    const razon = razonContraste(hexFrente, hexFondo);
    const pasa = razon >= minimo;
    if (!pasa) fallos++;

    resultados.push({ tema, frente, fondo, uso, minimo, razon, pasa, hexFrente, hexFondo });
  }
}

/* ---------------------------- salida en consola --------------------------- */

const ANCHO_USO = Math.max(...resultados.map((r) => r.uso.length));

for (const tema of TEMAS) {
  const delTema = resultados.filter((r) => r.tema === tema);
  const fallosTema = delTema.filter((r) => !r.pasa).length;

  console.log(`\n  TEMA ${tema.toUpperCase()}  —  ${delTema.length - fallosTema}/${delTema.length} pares cumplen`);
  console.log('  ' + '─'.repeat(ANCHO_USO + 30));

  for (const r of delTema) {
    const marca = r.pasa ? '✓' : '✗';
    const razon = r.razon.toFixed(2).padStart(5);
    console.log(
      `  ${marca} ${r.uso.padEnd(ANCHO_USO)}  ${razon}:1  (mín. ${r.minimo.toFixed(1)})` +
        (r.pasa ? '' : `  ← ${r.hexFrente} sobre ${r.hexFondo}`)
    );
  }
}

/* -------------------------- reporte para docs/ ---------------------------- */

const filas = resultados
  .map(
    (r) =>
      `| ${r.tema} | ${r.uso} | \`${r.frente.replace('color.', '')}\` sobre \`${r.fondo.replace('color.', '')}\` | ${r.hexFrente} / ${r.hexFondo} | **${r.razon.toFixed(2)}:1** | ${r.minimo.toFixed(1)}:1 | ${r.pasa ? '✅' : '❌'} |`
  )
  .join('\n');

const peor = resultados.reduce((a, b) => (a.razon < b.razon ? a : b));

const reporte = `<!-- ARCHIVO GENERADO por \`npm run a11y:contraste\`. No editar a mano. -->

# Resultado de la verificación de contraste

Generado automáticamente a partir de \`design/tokens.json\`. Para volver a correrlo:

\`\`\`bash
npm run a11y:contraste
\`\`\`

## Resumen

- **Pares evaluados:** ${resultados.length} (${PARES.length} combinaciones × ${TEMAS.length} temas)
- **Cumplen WCAG 2.1 AA:** ${resultados.length - fallos}
- **No cumplen:** ${fallos}
- **Par con menor margen:** ${peor.uso} en tema ${peor.tema} — ${peor.razon.toFixed(2)}:1 (mínimo ${peor.minimo.toFixed(1)}:1)

${fallos === 0 ? '> ✅ **Todos los pares de color del sistema cumplen WCAG 2.1 nivel AA en ambos temas.**' : `> ❌ **${fallos} par(es) no cumplen.** Ajustar \`design/tokens.json\` y volver a correr.`}

## Criterios aplicados

| Umbral | Criterio WCAG | Se aplica a |
| --- | --- | --- |
| 4.5:1 | 1.4.3 Contraste (mínimo) | Texto normal |
| 3.0:1 | 1.4.3 Contraste (mínimo) | Texto grande (≥ 24 px, o ≥ 18.66 px en negrita) |
| 3.0:1 | 1.4.11 Contraste no textual | Bordes de controles, anillo de foco, líneas informativas |

## Detalle

| Tema | Uso | Tokens | Colores | Contraste | Mínimo | |
| --- | --- | --- | --- | --- | --- | --- |
${filas}

## Qué NO cubre esta verificación

Esta herramienta mide pares de tokens. **No** sustituye a:

- La revisión con axe DevTools sobre las páginas ya renderizadas (detecta combinaciones que el sistema de tokens no previó).
- El texto sobre imágenes o video del hero, cuyo contraste depende del asset. Ver la capa de oscurecimiento en \`HeroMedia.astro\`.
- El contraste de los estados \`:hover\`/\`:active\` generados con \`color-mix()\`, si se llegara a usar.
`;

mkdirSync(resolve(RAIZ, 'docs'), { recursive: true });
writeFileSync(resolve(RAIZ, 'docs', 'resultado-contraste.md'), reporte, 'utf8');

console.log(
  `\n  ${fallos === 0 ? '✓' : '✗'} ${resultados.length - fallos}/${resultados.length} pares cumplen WCAG 2.1 AA.`
);
console.log('  Reporte escrito en docs/resultado-contraste.md\n');

process.exit(fallos === 0 ? 0 : 1);
