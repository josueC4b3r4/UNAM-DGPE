#!/usr/bin/env node
/**
 * Pruebas de la aritmética del cotizador.
 *
 *   npm run test:cotizacion
 *
 * Sin framework, igual que test-busqueda.mjs: Node 24 ejecuta TypeScript
 * directamente y `node:assert` alcanza de sobra para funciones puras.
 *
 * Por qué existen estas pruebas. Un buscador que falla devuelve resultados
 * raros y alguien lo reporta. Un cotizador que falla devuelve un número, y un
 * número siempre parece correcto. La única forma de saber que la cuenta está
 * bien es comprobarla contra valores calculados a mano.
 */

import assert from 'node:assert/strict';
import {
  aPesos,
  cotizar,
  desglose,
  formatearPesos,
  tarifaDe,
} from '../src/lib/cotizacion.ts';

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
  }
}

const LINEA = { modalidad: 'linea', tarifaHora: 35000 }; // $350.00
const PRESENCIAL = { modalidad: 'presencial', tarifaHora: 52500 }; // $525.00
const TARIFAS = [LINEA, PRESENCIAL];

console.log('\n  Cálculo\n');

prueba('multiplica tarifa por horas', () => {
  assert.equal(cotizar(LINEA, 20).total, 700000); // $7,000.00
});

prueba('una hora cuesta la tarifa', () => {
  assert.equal(cotizar(PRESENCIAL, 1).total, 52500);
});

prueba('una tarifa gratuita da total cero', () => {
  assert.equal(cotizar({ modalidad: 'mixta', tarifaHora: 0 }, 40).total, 0);
});

prueba('conserva la modalidad para que quien dibuje la etiquete', () => {
  const c = cotizar(LINEA, 12);
  assert.equal(c.modalidad, 'linea');
  assert.equal(c.horas, 12);
  assert.equal(c.tarifaHora, 35000);
});

console.log('\n  La trampa de la coma flotante\n');

/*
 * Estas dos pruebas son el motivo por el que todo el módulo trabaja en
 * centavos. La primera demuestra que el problema es real; la segunda, que la
 * implementación no lo tiene. Si alguien "simplifica" el módulo a pesos con
 * decimales, la segunda falla y explica por qué.
 */
prueba('en pesos con decimales la cuenta se desvía (demostración)', () => {
  const enPesos = 1250.1 * 7;
  assert.notEqual(enPesos, 8750.7);
  assert.ok(Math.abs(enPesos - 8750.7) > 0, 'la coma flotante ya no falla; revisar el módulo');
});

prueba('en centavos enteros la cuenta es exacta', () => {
  const c = cotizar({ modalidad: 'linea', tarifaHora: 125010 }, 7);
  assert.equal(c.total, 875070); // exactamente $8,750.70
  assert.equal(aPesos(c.total), 8750.7);
});

console.log('\n  Rechazo de datos malos\n');

prueba('rechaza una tarifa con decimales', () => {
  assert.throws(() => cotizar({ modalidad: 'linea', tarifaHora: 350.5 }, 10), TypeError);
});

prueba('rechaza horas con decimales', () => {
  assert.throws(() => cotizar(LINEA, 2.5), TypeError);
});

prueba('rechaza una tarifa negativa', () => {
  assert.throws(() => cotizar({ modalidad: 'linea', tarifaHora: -100 }, 10), RangeError);
});

prueba('rechaza cero horas y horas negativas', () => {
  assert.throws(() => cotizar(LINEA, 0), RangeError);
  assert.throws(() => cotizar(LINEA, -5), RangeError);
});

prueba('rechaza un total que perdería precisión', () => {
  // Un cero de más en el contenido llegaría hasta aquí.
  assert.throws(() => cotizar({ modalidad: 'linea', tarifaHora: 2 ** 52 }, 1000), RangeError);
});

prueba('el mensaje de error explica el porqué, no solo el qué', () => {
  try {
    cotizar({ modalidad: 'linea', tarifaHora: 350.5 }, 10);
    assert.fail('debió lanzar');
  } catch (e) {
    assert.match(e.message, /centavos/);
    assert.match(e.message, /precisión/);
  }
});

console.log('\n  Formato\n');

prueba('formatea centavos como pesos mexicanos', () => {
  assert.match(formatearPesos(700000), /7[,.\s]000\.00/);
  assert.ok(formatearPesos(700000).includes('$'));
});

prueba('conserva los centavos que no son cero', () => {
  assert.match(formatearPesos(875070), /8[,.\s]750\.70/);
});

prueba('formatea el cero sin caso especial', () => {
  assert.match(formatearPesos(0), /0\.00/);
});

prueba('rechaza formatear un importe con decimales', () => {
  assert.throws(() => formatearPesos(1250.5), TypeError);
});

console.log('\n  Desglose y búsqueda de tarifa\n');

prueba('el desglose muestra la operación, no solo el total', () => {
  const texto = desglose(cotizar(LINEA, 20));
  assert.ok(texto.includes('20 h'));
  assert.ok(texto.includes('350.00'));
});

prueba('encuentra la tarifa de una modalidad que el curso ofrece', () => {
  assert.equal(tarifaDe(TARIFAS, 'presencial'), PRESENCIAL);
});

prueba('devuelve undefined —no lanza— si el curso no da esa modalidad', () => {
  assert.equal(tarifaDe(TARIFAS, 'mixta'), undefined);
});

/* --------------------------------------------------------------------- */

const total = pasadas + fallos.length;

if (fallos.length === 0) {
  console.log(`\n  ✓ ${pasadas}/${total} pruebas del cotizador pasaron.\n`);
  process.exit(0);
}

console.error(`\n  ✗ ${fallos.length} de ${total} pruebas del cotizador fallaron:\n`);
for (const { nombre, error } of fallos) {
  console.error(`  ${nombre}`);
  console.error(`  ${error.message}\n`);
}
process.exit(1);
