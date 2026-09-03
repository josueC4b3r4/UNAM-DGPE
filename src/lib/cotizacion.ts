/**
 * Aritmética del cotizador de cursos.
 *
 * Vive aparte de la interfaz para poder probarla sin navegador, y porque una
 * calculadora sin pruebas es una calculadora en la que nadie debería confiar:
 * un total equivocado no se ve roto, se ve como un total.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * REGLA NÚMERO UNO: el dinero se guarda en CENTAVOS, como entero.
 *
 * En coma flotante `0.1 + 0.2` no da `0.3`, da `0.30000000000000004`. Una
 * tarifa de $1,250.10 por hora × 7 horas daría `8750.699999999999`, que al
 * redondear para mostrar puede quedar un centavo por debajo del total real.
 * Nadie lo nota en la demo y aparece cuando alguien suma a mano.
 *
 * Guardando centavos como enteros —125010, no 1250.10— toda la aritmética es
 * exacta hasta 90 billones de pesos, y el único punto donde aparece un decimal
 * es al formatear para mostrar. Las funciones de abajo RECHAZAN cualquier
 * número no entero en vez de redondearlo en silencio: si un precio decimal se
 * cuela desde el contenido, se quiere descubrir en el build y no en la caja.
 */

/*
 * `import type` y no un import normal, a propósito y por dos razones.
 *
 * La de diseño: este módulo hace aritmética. Traducir 'linea' a "En línea" es
 * presentación, y meterla aquí obligaría a tocar la calculadora cada vez que
 * cambie una etiqueta. La etiqueta la pone quien dibuja.
 *
 * La práctica: TypeScript borra los `import type` al compilar, así que Node no
 * intenta resolver la ruta al ejecutar las pruebas. Un import de valor exige la
 * extensión `.ts` explícita bajo el ESM de Node y rompe `npm run test`.
 */
import type { Modalidad } from './constantes';

/** Tarifa de un curso en una modalidad concreta. */
export interface TarifaModalidad {
  modalidad: Modalidad;
  /** Centavos por hora. Entero, siempre. */
  tarifaHora: number;
}

/** Una de las duraciones que ofrece un curso. */
export interface OpcionDuracion {
  horas: number;
  /** Cómo se le llama a esa duración: "Curso intensivo (12 h)". */
  etiqueta: string;
}

export interface Cotizacion {
  modalidad: Modalidad;
  horas: number;
  /** Centavos por hora. */
  tarifaHora: number;
  /** Centavos. */
  total: number;
}

/*
 * El formateador se crea UNA vez. `Intl.NumberFormat` es caro de construir
 * —tiene que cargar los datos de la configuración regional— y el cotizador lo
 * llama en cada tecla. Construirlo dentro de la función lo volvía el gasto
 * dominante del cálculo.
 */
const PESOS = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convierte centavos enteros a "$1,250.10".
 *
 * Es el ÚNICO lugar del proyecto donde los centavos se vuelven pesos. Si
 * aparece otro, hay dos formatos de moneda que se van a desincronizar.
 */
export function formatearPesos(centavos: number): string {
  exigirEntero(centavos, 'El importe en centavos');
  return PESOS.format(centavos / 100);
}

/** Convierte pesos a centavos para escribir contenido sin equivocarse. */
export function aPesos(centavos: number): number {
  exigirEntero(centavos, 'El importe en centavos');
  return centavos / 100;
}

/**
 * Calcula el costo de un curso.
 *
 * El modelo es deliberadamente simple —tarifa por hora × horas— porque es el
 * único que la persona puede verificar de cabeza. Un cotizador cuyo resultado
 * no se puede comprobar a mano es un cotizador en el que hay que creer, y para
 * un trámite público eso es peor que no tenerlo.
 */
export function cotizar(tarifa: TarifaModalidad, horas: number): Cotizacion {
  exigirEntero(tarifa.tarifaHora, 'La tarifa por hora');
  exigirEntero(horas, 'El número de horas');

  if (tarifa.tarifaHora < 0) {
    throw new RangeError(`La tarifa por hora no puede ser negativa: ${tarifa.tarifaHora}`);
  }
  if (horas <= 0) {
    throw new RangeError(`El número de horas debe ser mayor que cero: ${horas}`);
  }

  const total = tarifa.tarifaHora * horas;

  /*
   * Por encima de Number.MAX_SAFE_INTEGER los enteros de JavaScript dejan de
   * ser exactos y empiezan a saltarse valores, sin aviso. Con tarifas reales
   * es inalcanzable, pero un cero de más en el contenido llegaría aquí, y es
   * mejor que reviente el build a que muestre un total silenciosamente falso.
   */
  if (!Number.isSafeInteger(total)) {
    throw new RangeError(
      `El total supera el entero seguro de JavaScript: ${tarifa.tarifaHora} × ${horas}`
    );
  }

  return {
    modalidad: tarifa.modalidad,
    horas,
    tarifaHora: tarifa.tarifaHora,
    total,
  };
}

/**
 * Frase que muestra la operación, no solo el resultado.
 *
 * "20 h × $350.00 por hora" al lado del total deja que cualquiera compruebe la
 * cuenta. Es la diferencia entre un cotizador y una caja negra.
 */
export function desglose(cotizacion: Cotizacion): string {
  return `${cotizacion.horas} h × ${formatearPesos(cotizacion.tarifaHora)} por hora`;
}

/**
 * Busca la tarifa de una modalidad dentro de las que ofrece un curso.
 *
 * Devuelve `undefined` en vez de lanzar: que alguien pida una modalidad que el
 * curso no imparte es un estado normal de la interfaz —se acaba de cambiar el
 * selector—, no un error de programación.
 */
export function tarifaDe(
  tarifas: readonly TarifaModalidad[],
  modalidad: string
): TarifaModalidad | undefined {
  return tarifas.find((t) => t.modalidad === modalidad);
}

function exigirEntero(valor: number, que: string): void {
  if (!Number.isInteger(valor)) {
    throw new TypeError(
      `${que} debe ser un entero en centavos, no ${valor}. ` +
        'Los importes con decimales pierden precisión al multiplicarse.'
    );
  }
}
