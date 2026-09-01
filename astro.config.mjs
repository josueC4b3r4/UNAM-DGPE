// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Cambiar cuando se publique (p. ej. 'https://dgpe-prototipo.netlify.app').
  // Con deploy local no afecta a nada más que a los enlaces canónicos.
  site: 'http://localhost:4321',

  // Sitio 100 % estático: cada página se pre-renderiza a HTML en el build.
  output: 'static',

  compressHTML: true,

  build: {
    // Un solo archivo CSS en vez de <style> por página: menos peticiones,
    // mejor cache entre navegaciones.
    inlineStylesheets: 'auto',
  },

  image: {
    // astro:assets genera AVIF/WebP y calcula width/height automáticamente,
    // lo que evita el "layout shift" que penaliza Lighthouse.
    responsiveStyles: true,
  },

  devToolbar: {
    // La barra de dev de Astro incluye una auditoría de accesibilidad en vivo.
    enabled: true,
  },
});
