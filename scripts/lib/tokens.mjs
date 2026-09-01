/**
 * Utilidades compartidas para leer y resolver design/tokens.json (formato W3C DTCG).
 *
 * Las usan tanto `build-tokens.mjs` (genera CSS) como `check-contraste.mjs`
 * (verifica WCAG). Vivir en un solo lugar evita que la lógica de resolución de
 * alias se desincronice entre los dos.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, '..', '..');
export const RUTA_TOKENS = resolve(RAIZ, 'design', 'tokens.json');

/** Los temas que genera el sistema. `comun` no es un tema: no depende de claro/oscuro. */
export const TEMAS = ['claro', 'oscuro'];

export function leerTokens() {
  return JSON.parse(readFileSync(RUTA_TOKENS, 'utf8'));
}

/** `superficieBase` -> `superficie-base`; `600` -> `600`. */
export function aKebab(segmento) {
  return String(segmento)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Traduce una ruta de token a su nombre de custom property.
 *
 *   primitivo.color.azul.600        -> --p-color-azul-600
 *   semantico.comun.espacio.bloque  -> --espacio-bloque
 *   semantico.claro.color.textoTenue -> --color-texto-tenue
 *
 * Los semánticos pierden el segmento de tema a propósito: `--color-texto-tenue`
 * es el MISMO nombre en claro y en oscuro, solo cambia su valor. Eso es lo que
 * permite que un componente nunca sepa en qué tema está.
 */
export function aNombreCss(ruta) {
  const segmentos = ruta.split('.');
  let partes;

  if (segmentos[0] === 'primitivo') {
    partes = ['p', ...segmentos.slice(1)];
  } else if (segmentos[0] === 'semantico') {
    partes = segmentos.slice(2); // descarta 'semantico' y el tema/'comun'
  } else {
    partes = segmentos;
  }

  return '--' + partes.map(aKebab).join('-');
}

/** ¿Este nodo del JSON es un token (tiene $value) o un grupo? */
function esToken(nodo) {
  return nodo !== null && typeof nodo === 'object' && '$value' in nodo;
}

/**
 * Recorre un subárbol y devuelve [{ ruta, valor, descripcion }] en orden.
 * `prefijo` es la ruta completa desde la raíz del JSON, para poder resolver alias.
 */
export function aplanar(nodo, prefijo = '') {
  const salida = [];

  for (const [clave, valor] of Object.entries(nodo)) {
    if (clave.startsWith('$')) continue; // metadatos DTCG

    const ruta = prefijo ? `${prefijo}.${clave}` : clave;

    if (esToken(valor)) {
      salida.push({
        ruta,
        valor: valor.$value,
        descripcion: valor.$description ?? null,
      });
    } else if (valor !== null && typeof valor === 'object') {
      salida.push(...aplanar(valor, ruta));
    }
  }

  return salida;
}

const PATRON_ALIAS = /\{([^}]+)\}/g;

/** ¿El valor es exactamente un alias, como "{primitivo.color.azul.600}"? */
export function esAliasPuro(valor) {
  return typeof valor === 'string' && /^\{[^}]+\}$/.test(valor.trim());
}

/**
 * Convierte alias a referencias `var(...)` en vez de sustituir el valor literal.
 * Ventaja: en DevTools se ve la cadena completa
 * (--color-texto-enlace -> --p-color-azul-700 -> #0c4270), lo que hace
 * mucho más fácil rastrear de dónde sale un color.
 */
export function resolverAliasACss(valor) {
  if (typeof valor !== 'string') return String(valor);
  return valor.replace(PATRON_ALIAS, (_, ruta) => `var(${aNombreCss(ruta.trim())})`);
}

/**
 * Resuelve un alias hasta su valor literal final, siguiendo la cadena.
 * Necesario para calcular contraste: no se puede medir un `var()`.
 */
export function resolverAliasAValor(valor, indicePorRuta, saltos = 0) {
  if (saltos > 10) throw new Error(`Cadena de alias demasiado profunda o circular: ${valor}`);
  if (!esAliasPuro(valor)) return valor;

  const ruta = valor.trim().slice(1, -1);
  const destino = indicePorRuta.get(ruta);
  if (destino === undefined) {
    throw new Error(`Alias roto: {${ruta}} no existe en design/tokens.json`);
  }
  return resolverAliasAValor(destino, indicePorRuta, saltos + 1);
}

/** Índice ruta -> valor crudo de TODOS los tokens, para resolver alias. */
export function construirIndice(tokens) {
  const indice = new Map();
  for (const { ruta, valor } of aplanar(tokens)) {
    indice.set(ruta, valor);
  }
  return indice;
}

/* ------------------------------------------------------------------ */
/* Contraste WCAG 2.1                                                  */
/* ------------------------------------------------------------------ */

export function hexARgb(hex) {
  const limpio = hex.trim().replace('#', '');
  const completo =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;

  if (!/^[0-9a-fA-F]{6}$/.test(completo)) {
    throw new Error(`No es un color hexadecimal válido: "${hex}"`);
  }

  return [
    parseInt(completo.slice(0, 2), 16),
    parseInt(completo.slice(2, 4), 16),
    parseInt(completo.slice(4, 6), 16),
  ];
}

/** Luminancia relativa — https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
export function luminanciaRelativa(hex) {
  const [r, g, b] = hexARgb(hex).map((canal) => {
    const c = canal / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste entre dos colores, de 1 a 21. */
export function razonContraste(hexA, hexB) {
  const a = luminanciaRelativa(hexA);
  const b = luminanciaRelativa(hexB);
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}
