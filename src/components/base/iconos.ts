/**
 * Trazos de los iconos SVG.
 *
 * En un `.ts` y no dentro de `Icono.astro` porque otros componentes necesitan
 * el tipo `NombreIcono` para tipar sus props, y los archivos `.astro` no son
 * una fuente fiable de exportaciones con nombre.
 *
 * Todos comparten viewBox 24×24 y grosor de trazo 1.75, para que se vean como
 * un mismo juego y no como iconos sueltos de distintas fuentes.
 */

export const TRAZOS = {
  birrete:
    '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 9v6"/>',
  engrane:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/>',
  personas:
    '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.6"/>',
  lupa: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m21 21-5.9-5.9"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8M19.1 19.1l-1.8-1.8M6.7 6.7 4.9 4.9"/>',
  luna: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/>',
  pausa:
    '<rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/>',
  reproducir: '<path d="M8 5.5v13l11-6.5-11-6.5Z"/>',
  flecha: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
  ubicacion:
    '<path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  documento:
    '<path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5l-5-5Z"/><path d="M14 2.5v5h5"/><path d="M9 13h6M9 17h6"/>',
  correo: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6.5 9 6 9-6"/>',
  telefono:
    '<path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L21 14.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/>',
  aviso: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.3h.01"/>',

  /*
   * Los siguientes existen para encabezar SECCIONES, no para etiquetar datos.
   *
   * Todos son de trazo y comparten el viewBox de 24×24 y el grosor de 1.75, así
   * que se ven como el mismo juego. Ninguno lleva relleno: el `fill="none"` está
   * en el <svg> del componente, y un icono con relleno cantaría al lado del
   * resto.
   *
   * El punto suelto de `pregunta` (`h.01`) se dibuja porque el trazo lleva
   * `stroke-linecap: round`. Es el mismo truco que ya usa `aviso`.
   */
  campana:
    '<path d="M18 8.5a6 6 0 1 0-12 0c0 5.5-2.5 7-2.5 7h17S18 14 18 8.5Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
  estrella:
    '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z"/>',
  brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5 5.5-2Z"/>',
  calendario:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/>',
  pregunta:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.8"/><path d="M12 17.2h.01"/>',
  grafica: '<path d="M3.5 20.5h17"/><path d="M7 20.5v-6M12 20.5V9M17 20.5v-9.5"/>',
  escudo:
    '<path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.8 7.5 10 4.3-1.2 7.5-5.4 7.5-10v-6L12 2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  bombilla:
    '<path d="M9.5 18h5"/><path d="M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
} as const;

export type NombreIcono = keyof typeof TRAZOS;
