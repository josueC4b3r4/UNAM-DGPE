# Resultado de Lighthouse

> Generado por `npm run lighthouse`. **No editar a mano.**

Medido en `http://localhost:4322` con la configuración móvil por defecto de Lighthouse (CPU y red simuladas más lentas). Escritorio da notas iguales o mejores.

**El SEO no lleva umbral.** El sitio es `noindex` a propósito mientras su contenido sea ficticio, y Lighthouse penaliza eso sin saber que es intencional: la nota se queda en torno a 66 haga lo que haga el resto. Se informa el número, no se juzga.

**Si mides contra un despliegue recién publicado**, la primera pasada puede salir baja: la caché del CDN está fría y la cabecera de respuesta lo delata con `Cache-Status: fwd=miss`. Vuelve a medir antes de dar por buena una caída.

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Inicio | **100** ✓ | **100** ✓ | **100** ✓ | 66 — |
| Listado de trámites | **100** ✓ | **100** ✓ | **100** ✓ | 66 — |
| Landing de trámite | **100** ✓ | **100** ✓ | **100** ✓ | 66 — |
| Página de rol | **100** ✓ | **100** ✓ | **100** ✓ | 66 — |
| Cursos y cotizador | **100** ✓ | **100** ✓ | **100** ✓ | 66 — |

## Inicio — auditorías con margen de mejora

| Auditoría | Nota | Detalle | Afecta a |
| --- | --- | --- | --- |
| First Contentful Paint | 99 | 1.2 s | Rendimiento |
| Speed Index | 99 | 2.3 s | Rendimiento |

## Listado de trámites — auditorías con margen de mejora

| Auditoría | Nota | Detalle | Afecta a |
| --- | --- | --- | --- |
| First Contentful Paint | 99 | 1.1 s | Rendimiento |
