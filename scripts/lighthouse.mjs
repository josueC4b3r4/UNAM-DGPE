#!/usr/bin/env node
/**
 * Mide el sitio con Lighthouse y falla si baja de los umbrales acordados.
 *
 *   npm run build && npm run preview   (en otra terminal, puerto 4322)
 *   npm run lighthouse
 *
 * Se mide contra el BUILD ESTÁTICO, nunca contra el servidor de desarrollo:
 * el dev server no minifica, no comprime y sirve los módulos sin empaquetar,
 * así que daría una nota de rendimiento que no se parece a la real.
 *
 * Escribe docs/resultado-lighthouse.md con las notas y las auditorías que no
 * pasaron, para que el resultado quede en el repositorio y no solo en una
 * terminal que se cierra.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const BASE = process.env.URL_BASE ?? 'http://localhost:4322';

/** Umbrales del proyecto. Rendimiento y accesibilidad son requisito. */
const UMBRALES = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
};

/** Categorías que hacen fallar el script si no llegan. */
const OBLIGATORIAS = ['performance', 'accessibility'];

const PAGINAS = [
  { ruta: '/', nombre: 'Inicio' },
  { ruta: '/tramites/', nombre: 'Listado de trámites' },
  { ruta: '/tramites/constancia-de-servicios/', nombre: 'Landing de trámite' },
  { ruta: '/perfil/academico/', nombre: 'Página de rol' },
];

/*
 * Móvil por defecto. Es lo que mide Lighthouse cuando no se le dice otra cosa,
 * y es el escenario duro: CPU y red simuladas más lentas. Si pasa en móvil,
 * pasa en escritorio.
 */
const CONFIG = {
  logLevel: 'error',
  output: 'json',
  onlyCategories: Object.keys(UMBRALES),
};

const nota = (c) => (c?.score == null ? null : Math.round(c.score * 100));

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

const resultados = [];

try {
  for (const pagina of PAGINAS) {
    const url = BASE + pagina.ruta;
    process.stdout.write(`  Midiendo ${pagina.nombre} …\n`);

    const { lhr } = await lighthouse(url, { ...CONFIG, port: chrome.port });

    const notas = Object.fromEntries(
      Object.keys(UMBRALES).map((k) => [k, nota(lhr.categories[k])])
    );

    /* Auditorías con puntuación < 1: lo que habría que arreglar. Se ignoran
       las informativas y las que no aplican. */
    const fallos = Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative')
      .map((a) => ({
        id: a.id,
        titulo: a.title,
        nota: Math.round(a.score * 100),
        detalle: (a.displayValue ?? '').toString().slice(0, 60),
        categorias: Object.entries(lhr.categories)
          .filter(([, c]) => c.auditRefs.some((r) => r.id === a.id && r.weight > 0))
          .map(([k]) => k),
      }))
      .filter((f) => f.categorias.length > 0)
      .sort((a, b) => a.nota - b.nota);

    resultados.push({ ...pagina, url, notas, fallos });
  }
} finally {
  await chrome.kill();
}

/* ---------------------------------------------------------------- */
/* Salida por consola                                                */
/* ---------------------------------------------------------------- */

const ETIQUETA = {
  performance: 'Rendimiento',
  accessibility: 'Accesibilidad',
  'best-practices': 'Buenas prácticas',
  seo: 'SEO',
};

console.log('');
let incumple = false;

for (const r of resultados) {
  console.log(`  ${r.nombre}  ${r.ruta}`);
  for (const [clave, umbral] of Object.entries(UMBRALES)) {
    const n = r.notas[clave];
    const pasa = n !== null && n >= umbral;
    if (!pasa && OBLIGATORIAS.includes(clave)) incumple = true;
    const marca = n === null ? '–' : pasa ? '✓' : '✗';
    console.log(
      `    ${marca} ${ETIQUETA[clave].padEnd(17)} ${String(n ?? 'n/d').padStart(3)}  (mín. ${umbral})`
    );
  }
  if (r.fallos.length) {
    console.log(`      ${r.fallos.length} auditoría(s) con margen de mejora:`);
    for (const f of r.fallos.slice(0, 6)) {
      console.log(`        · ${f.titulo}${f.detalle ? ` — ${f.detalle}` : ''}`);
    }
  }
  console.log('');
}

/* ---------------------------------------------------------------- */
/* Reporte en docs/                                                  */
/* ---------------------------------------------------------------- */

const lineas = [
  '# Resultado de Lighthouse',
  '',
  '> Generado por `npm run lighthouse`. **No editar a mano.**',
  '',
  `Medido sobre el build estático servido en \`${BASE}\`, con la configuración móvil por defecto de Lighthouse (CPU y red simuladas más lentas). Escritorio da notas iguales o mejores.`,
  '',
  '| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |',
  '| --- | --- | --- | --- | --- |',
];

for (const r of resultados) {
  const c = (k) => {
    const n = r.notas[k];
    if (n === null) return 'n/d';
    return n >= UMBRALES[k] ? `**${n}** ✓` : `**${n}** ✗`;
  };
  lineas.push(
    `| ${r.nombre} | ${c('performance')} | ${c('accessibility')} | ${c('best-practices')} | ${c('seo')} |`
  );
}

for (const r of resultados) {
  if (!r.fallos.length) continue;
  lineas.push('', `## ${r.nombre} — auditorías con margen de mejora`, '');
  lineas.push('| Auditoría | Nota | Detalle | Afecta a |');
  lineas.push('| --- | --- | --- | --- |');
  for (const f of r.fallos) {
    lineas.push(
      `| ${f.titulo} | ${f.nota} | ${f.detalle || '—'} | ${f.categorias.map((k) => ETIQUETA[k]).join(', ')} |`
    );
  }
}

if (resultados.every((r) => !r.fallos.length)) {
  lineas.push('', 'Ninguna auditoría puntuada quedó por debajo del máximo.');
}

lineas.push('');

mkdirSync(resolve(RAIZ, 'docs'), { recursive: true });
writeFileSync(resolve(RAIZ, 'docs/resultado-lighthouse.md'), lineas.join('\n'), 'utf8');

console.log('  Reporte escrito en docs/resultado-lighthouse.md\n');

if (incumple) {
  console.error('  ✗ Alguna página no llega al mínimo en Rendimiento o Accesibilidad.\n');
  process.exit(1);
}

console.log('  ✓ Todas las páginas cumplen los mínimos de Rendimiento y Accesibilidad.\n');
