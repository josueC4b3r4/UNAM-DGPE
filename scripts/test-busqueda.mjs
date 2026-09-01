#!/usr/bin/env node
/**
 * Pruebas de la lógica de búsqueda.
 *
 *   npm run test:busqueda
 *
 * Sin framework de pruebas a propósito: Node 24 ejecuta TypeScript
 * directamente (borrado de tipos) y trae `node:assert`. Meter Vitest para
 * verificar una función pura sería más dependencia que valor.
 *
 * Verifica lo que el buscador PROMETE en la interfaz. Si alguna de estas
 * afirmaciones deja de cumplirse, el buscador falla en silencio: sigue
 * devolviendo resultados, solo que los equivocados.
 */

import assert from 'node:assert/strict';
import { buscar, filtrar, normalizar, textoConteo } from '../src/lib/busqueda.ts';

/** Índice mínimo que reproduce los casos interesantes del contenido real. */
const INDICE = [
  {
    slug: 'constancia-de-servicios',
    titulo: 'Constancia de servicios',
    resumen: 'Documento oficial que acredita tu antigüedad y adscripción vigente en la UNAM.',
    categoria: 'constancias',
    categoriaEtiqueta: 'Constancias y documentos',
    roles: ['academico', 'administrativo'],
    modalidad: 'linea',
    duracion: '3 días hábiles',
    sinonimos: ['carta laboral', 'comprobante de trabajo', 'carta de antigüedad'],
    destacado: true,
  },
  {
    slug: 'ano-sabatico',
    titulo: 'Solicitud de año sabático',
    resumen: 'Periodo de un año para dedicarte a un proyecto académico, con goce de sueldo.',
    categoria: 'licencias',
    categoriaEtiqueta: 'Licencias y permisos',
    roles: ['academico'],
    modalidad: 'mixta',
    duracion: '60 días hábiles',
    sinonimos: ['sabático', 'periodo sabático'],
    destacado: true,
  },
  {
    slug: 'licencia-medica',
    titulo: 'Registro de licencia médica',
    resumen: 'Reporta ante la DGPE la incapacidad expedida por el ISSSTE.',
    categoria: 'licencias',
    categoriaEtiqueta: 'Licencias y permisos',
    roles: ['academico', 'administrativo'],
    modalidad: 'linea',
    duracion: '5 días hábiles',
    sinonimos: ['incapacidad', 'me incapacitaron', 'justificante médico'],
    destacado: false,
  },
  {
    slug: 'nombramiento-interino',
    titulo: 'Nombramiento interino',
    resumen: 'Cubre temporalmente una plaza vacante o con titular en licencia.',
    categoria: 'nombramientos',
    categoriaEtiqueta: 'Nombramientos y contratación',
    roles: ['jefe'],
    modalidad: 'mixta',
    duracion: '20 días hábiles',
    sinonimos: ['contratar interino', 'suplencia'],
    destacado: false,
  },
];

let pasadas = 0;
const fallos = [];

function prueba(nombre, fn) {
  try {
    fn();
    pasadas++;
    console.log(`  ✓ ${nombre}`);
  } catch (error) {
    fallos.push({ nombre, error });
    console.log(`  ✗ ${nombre}`);
    console.log(`      ${error.message.split('\n')[0]}`);
  }
}

const slugs = (consulta) => buscar(INDICE, consulta).map((r) => r.tramite.slug);

console.log('\n  Normalización\n');

prueba('quita acentos', () => {
  assert.equal(normalizar('Año Sabático'), 'ano sabatico');
});

prueba('conserva la longitud — de esto depende el resaltado', () => {
  const original = 'Constancia de antigüedad académica';
  assert.equal(normalizar(original).length, original.length);
});

console.log('\n  Búsqueda\n');

prueba('encuentra por título exacto', () => {
  assert.equal(slugs('constancia de servicios')[0], 'constancia-de-servicios');
});

prueba('ignora acentos: "sabatico" encuentra "sabático"', () => {
  assert.ok(slugs('sabatico').includes('ano-sabatico'));
});

prueba('ignora mayúsculas', () => {
  assert.ok(slugs('CONSTANCIA').includes('constancia-de-servicios'));
});

prueba('encuentra por sinónimo: "carta laboral" → constancia', () => {
  assert.equal(slugs('carta laboral')[0], 'constancia-de-servicios');
});

prueba('encuentra por lenguaje coloquial: "me incapacitaron" → licencia médica', () => {
  assert.equal(slugs('me incapacitaron')[0], 'licencia-medica');
});

prueba('palabras en desorden: "servicios constancia"', () => {
  assert.ok(slugs('servicios constancia').includes('constancia-de-servicios'));
});

prueba('palabras salteadas: "constancia servicios" (sin el "de")', () => {
  assert.equal(slugs('constancia servicios')[0], 'constancia-de-servicios');
});

prueba('el título pesa más que el resumen', () => {
  const resultado = buscar(INDICE, 'licencia');
  assert.equal(
    resultado[0].tramite.slug,
    'licencia-medica',
    'el que lo tiene en el título debe ir primero'
  );
});

prueba('ignora consultas de menos de 2 caracteres', () => {
  assert.deepEqual(buscar(INDICE, 'a'), []);
  assert.deepEqual(buscar(INDICE, ' '), []);
});

prueba('sin coincidencias devuelve lista vacía, no todo el índice', () => {
  assert.deepEqual(slugs('zzzzz'), []);
});

prueba('respeta el límite de resultados', () => {
  assert.equal(buscar(INDICE, 'de', 2).length <= 2, true);
});

console.log('\n  Resaltado\n');

prueba('marca el rango correcto en el título', () => {
  const [resultado] = buscar(INDICE, 'servicios');
  assert.ok(resultado.coincidencia, 'debería haber rango');
  const [desde, hasta] = resultado.coincidencia;
  assert.equal(resultado.tramite.titulo.slice(desde, hasta), 'servicios');
});

prueba('el rango es válido incluso con acentos en el título', () => {
  const [resultado] = buscar(INDICE, 'sabatico');
  assert.ok(resultado.coincidencia, 'debería haber rango');
  const [desde, hasta] = resultado.coincidencia;
  /* La consulta va sin acento y el título CON acento: el rango tiene que
     apuntar al texto acentuado original. */
  assert.equal(resultado.tramite.titulo.slice(desde, hasta), 'sabático');
});

prueba('sin coincidencia en el título, no hay rango que resaltar', () => {
  const [resultado] = buscar(INDICE, 'carta laboral');
  assert.equal(resultado.coincidencia, null);
});

console.log('\n  Filtros del listado\n');

prueba('sin filtros devuelve todo', () => {
  assert.equal(filtrar(INDICE, {}).length, INDICE.length);
});

prueba('filtra por categoría', () => {
  const r = filtrar(INDICE, { categoria: 'licencias' });
  assert.equal(r.length, 2);
});

prueba('filtra por rol', () => {
  const r = filtrar(INDICE, { rol: 'jefe' });
  assert.deepEqual(
    r.map((t) => t.slug),
    ['nombramiento-interino']
  );
});

prueba('combina texto y categoría', () => {
  const r = filtrar(INDICE, { texto: 'licencia', categoria: 'licencias' });
  assert.ok(r.every((t) => t.categoria === 'licencias'));
  assert.ok(r.length > 0);
});

prueba('combinación imposible devuelve vacío', () => {
  assert.deepEqual(filtrar(INDICE, { categoria: 'licencias', rol: 'jefe' }), []);
});

prueba('un texto de una sola letra no filtra nada', () => {
  assert.equal(filtrar(INDICE, { texto: 'a' }).length, INDICE.length);
});

console.log('\n  Conteo anunciado\n');

prueba('singular, plural y cero', () => {
  assert.equal(textoConteo(0), 'Ningún trámite coincide con tu búsqueda');
  assert.equal(textoConteo(1), '1 trámite encontrado');
  assert.equal(textoConteo(5), '5 trámites encontrados');
});

/* --------------------------------------------------------------------- */

const total = pasadas + fallos.length;

if (fallos.length === 0) {
  console.log(`\n  ✓ ${pasadas}/${total} pruebas pasaron.\n`);
  process.exit(0);
}

console.error(`\n  ✗ ${fallos.length} de ${total} pruebas fallaron:\n`);
for (const { nombre, error } of fallos) {
  console.error(`  ${nombre}`);
  console.error(`  ${error.message}\n`);
}
process.exit(1);
