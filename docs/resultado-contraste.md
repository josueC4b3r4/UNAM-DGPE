<!-- ARCHIVO GENERADO por `npm run a11y:contraste`. No editar a mano. -->

# Resultado de la verificación de contraste

Generado automáticamente a partir de `design/tokens.json`. Para volver a correrlo:

```bash
npm run a11y:contraste
```

## Resumen

- **Pares evaluados:** 78 (39 combinaciones × 2 temas)
- **Cumplen WCAG 2.1 AA:** 78
- **No cumplen:** 0
- **Par con menor margen:** Línea de acento decorativa-informativa en tema claro — 4.41:1 (mínimo 3.0:1)

> ✅ **Todos los pares de color del sistema cumplen WCAG 2.1 nivel AA en ambos temas.**

## Criterios aplicados

| Umbral | Criterio WCAG | Se aplica a |
| --- | --- | --- |
| 4.5:1 | 1.4.3 Contraste (mínimo) | Texto normal |
| 3.0:1 | 1.4.3 Contraste (mínimo) | Texto grande (≥ 24 px, o ≥ 18.66 px en negrita) |
| 3.0:1 | 1.4.11 Contraste no textual | Bordes de controles, anillo de foco, líneas informativas |

## Detalle

| Tema | Uso | Tokens | Colores | Contraste | Mínimo | |
| --- | --- | --- | --- | --- | --- | --- |
| claro | Cuerpo sobre fondo de página | `textoPrincipal` sobre `superficieBase` | #1a1f27 / #ffffff | **16.55:1** | 4.5:1 | ✅ |
| claro | Cuerpo sobre sección alterna | `textoPrincipal` sobre `superficieSutil` | #1a1f27 / #f7f8fa | **15.57:1** | 4.5:1 | ✅ |
| claro | Cuerpo dentro de tarjeta | `textoPrincipal` sobre `superficieElevada` | #1a1f27 / #ffffff | **16.55:1** | 4.5:1 | ✅ |
| claro | Cuerpo sobre bloque de marca | `textoPrincipal` sobre `superficieMarcaSutil` | #1a1f27 / #eff3fb | **14.88:1** | 4.5:1 | ✅ |
| claro | Texto de apoyo | `textoSecundario` sobre `superficieBase` | #3b4552 / #ffffff | **9.73:1** | 4.5:1 | ✅ |
| claro | Texto de apoyo en tarjeta | `textoSecundario` sobre `superficieElevada` | #3b4552 / #ffffff | **9.73:1** | 4.5:1 | ✅ |
| claro | Metadatos (fechas, conteos) | `textoTenue` sobre `superficieBase` | #515c6b / #ffffff | **6.79:1** | 4.5:1 | ✅ |
| claro | Metadatos sobre sección alterna | `textoTenue` sobre `superficieSutil` | #515c6b / #f7f8fa | **6.39:1** | 4.5:1 | ✅ |
| claro | Metadatos en tarjeta | `textoTenue` sobre `superficieElevada` | #515c6b / #ffffff | **6.79:1** | 4.5:1 | ✅ |
| claro | Texto del header y del footer | `textoSobreMarca` sobre `superficieMarca` | #ffffff / #08245a | **14.89:1** | 4.5:1 | ✅ |
| claro | Texto secundario del header/footer | `textoTenueSobreMarca` sobre `superficieMarca` | #c6cdd7 / #08245a | **9.30:1** | 4.5:1 | ✅ |
| claro | Enlace en línea | `textoEnlace` sobre `superficieBase` | #0d3073 / #ffffff | **12.44:1** | 4.5:1 | ✅ |
| claro | Enlace sobre sección alterna | `textoEnlace` sobre `superficieSutil` | #0d3073 / #f7f8fa | **11.71:1** | 4.5:1 | ✅ |
| claro | Enlace dentro de tarjeta | `textoEnlace` sobre `superficieElevada` | #0d3073 / #ffffff | **12.44:1** | 4.5:1 | ✅ |
| claro | Enlace en hover | `textoEnlaceHover` sobre `superficieBase` | #05193d / #ffffff | **17.31:1** | 4.5:1 | ✅ |
| claro | Etiqueta de botón primario | `accionPrimariaTexto` sobre `accionPrimariaFondo` | #ffffff / #0d3073 | **12.44:1** | 4.5:1 | ✅ |
| claro | Botón primario en hover | `accionPrimariaTexto` sobre `accionPrimariaFondoHover` | #ffffff / #08245a | **14.89:1** | 4.5:1 | ✅ |
| claro | Etiqueta de botón secundario | `accionSecundariaTexto` sobre `accionSecundariaFondo` | #0d3073 / #ffffff | **12.44:1** | 4.5:1 | ✅ |
| claro | Botón secundario en hover | `accionSecundariaTexto` sobre `accionSecundariaFondoHover` | #0d3073 / #eff3fb | **11.19:1** | 4.5:1 | ✅ |
| claro | Texto sobre acento oro | `acentoTexto` sobre `acentoFondo` | #1a1f27 / #efcc4d | **10.57:1** | 4.5:1 | ✅ |
| claro | Coincidencia resaltada en buscador | `resaltadoTexto` sobre `resaltadoFondo` | #1a1f27 / #faefc7 | **14.37:1** | 4.5:1 | ✅ |
| claro | Mensaje de éxito | `exitoTexto` sobre `exitoFondo` | #125231 / #e9f7ef | **8.35:1** | 4.5:1 | ✅ |
| claro | Mensaje de advertencia | `alertaTexto` sobre `alertaFondo` | #6b4508 / #fdf3e3 | **7.70:1** | 4.5:1 | ✅ |
| claro | Mensaje de error | `errorTexto` sobre `errorFondo` | #a12119 / #fdeceb | **6.69:1** | 4.5:1 | ✅ |
| claro | Borde de campo de formulario | `bordeFuerte` sobre `superficieBase` | #6c7787 / #ffffff | **4.54:1** | 3.0:1 | ✅ |
| claro | Borde de campo dentro de tarjeta | `bordeFuerte` sobre `superficieElevada` | #6c7787 / #ffffff | **4.54:1** | 3.0:1 | ✅ |
| claro | Anillo de foco de teclado | `bordeFoco` sobre `superficieBase` | #0d3073 / #ffffff | **12.44:1** | 3.0:1 | ✅ |
| claro | Anillo de foco sobre sección alterna | `bordeFoco` sobre `superficieSutil` | #0d3073 / #f7f8fa | **11.71:1** | 3.0:1 | ✅ |
| claro | Anillo de foco dentro de tarjeta | `bordeFoco` sobre `superficieElevada` | #0d3073 / #ffffff | **12.44:1** | 3.0:1 | ✅ |
| claro | Anillo de foco sobre la marca | `bordeFocoSobreMarca` sobre `superficieMarca` | #ffffff / #08245a | **14.89:1** | 3.0:1 | ✅ |
| claro | Anillo de foco en isla clara | `bordeFocoEnClaro` sobre `superficieElevada` | #0d3073 / #ffffff | **12.44:1** | 3.0:1 | ✅ |
| claro | Silueta del botón primario | `accionPrimariaFondo` sobre `superficieBase` | #0d3073 / #ffffff | **12.44:1** | 3.0:1 | ✅ |
| claro | Borde del botón secundario | `accionSecundariaBorde` sobre `superficieBase` | #0d3073 / #ffffff | **12.44:1** | 3.0:1 | ✅ |
| claro | Línea de acento decorativa-informativa | `acentoLinea` sobre `superficieBase` | #947400 / #ffffff | **4.41:1** | 3.0:1 | ✅ |
| claro | Borde del mensaje de éxito | `exitoBorde` sobre `exitoFondo` | #1a6b41 / #e9f7ef | **5.90:1** | 3.0:1 | ✅ |
| claro | Borde del mensaje de advertencia | `alertaBorde` sobre `alertaFondo` | #8a5a0b / #fdf3e3 | **5.39:1** | 3.0:1 | ✅ |
| claro | Borde del mensaje de error | `errorBorde` sobre `errorFondo` | #a12119 / #fdeceb | **6.69:1** | 3.0:1 | ✅ |
| claro | Acento oro sobre marca | `acentoLineaSobreMarca` sobre `superficieMarca` | #bd9500 / #08245a | **5.29:1** | 3.0:1 | ✅ |
| claro | Icono sobre su pastilla de marca | `textoEnlace` sobre `superficieMarcaSutil` | #0d3073 / #eff3fb | **11.19:1** | 3.0:1 | ✅ |
| oscuro | Cuerpo sobre fondo de página | `textoPrincipal` sobre `superficieBase` | #eef0f4 / #0f1319 | **16.32:1** | 4.5:1 | ✅ |
| oscuro | Cuerpo sobre sección alterna | `textoPrincipal` sobre `superficieSutil` | #eef0f4 / #1a1f27 | **14.50:1** | 4.5:1 | ✅ |
| oscuro | Cuerpo dentro de tarjeta | `textoPrincipal` sobre `superficieElevada` | #eef0f4 / #29313b | **11.53:1** | 4.5:1 | ✅ |
| oscuro | Cuerpo sobre bloque de marca | `textoPrincipal` sobre `superficieMarcaSutil` | #eef0f4 / #030f26 | **16.73:1** | 4.5:1 | ✅ |
| oscuro | Texto de apoyo | `textoSecundario` sobre `superficieBase` | #c6cdd7 / #0f1319 | **11.63:1** | 4.5:1 | ✅ |
| oscuro | Texto de apoyo en tarjeta | `textoSecundario` sobre `superficieElevada` | #c6cdd7 / #29313b | **8.21:1** | 4.5:1 | ✅ |
| oscuro | Metadatos (fechas, conteos) | `textoTenue` sobre `superficieBase` | #98a2b0 / #0f1319 | **7.21:1** | 4.5:1 | ✅ |
| oscuro | Metadatos sobre sección alterna | `textoTenue` sobre `superficieSutil` | #98a2b0 / #1a1f27 | **6.41:1** | 4.5:1 | ✅ |
| oscuro | Metadatos en tarjeta | `textoTenue` sobre `superficieElevada` | #98a2b0 / #29313b | **5.09:1** | 4.5:1 | ✅ |
| oscuro | Texto del header y del footer | `textoSobreMarca` sobre `superficieMarca` | #ffffff / #05193d | **17.31:1** | 4.5:1 | ✅ |
| oscuro | Texto secundario del header/footer | `textoTenueSobreMarca` sobre `superficieMarca` | #98a2b0 / #05193d | **6.70:1** | 4.5:1 | ✅ |
| oscuro | Enlace en línea | `textoEnlace` sobre `superficieBase` | #82a4e3 / #0f1319 | **7.42:1** | 4.5:1 | ✅ |
| oscuro | Enlace sobre sección alterna | `textoEnlace` sobre `superficieSutil` | #82a4e3 / #1a1f27 | **6.59:1** | 4.5:1 | ✅ |
| oscuro | Enlace dentro de tarjeta | `textoEnlace` sobre `superficieElevada` | #82a4e3 / #29313b | **5.24:1** | 4.5:1 | ✅ |
| oscuro | Enlace en hover | `textoEnlaceHover` sobre `superficieBase` | #b2c8f0 / #0f1319 | **11.01:1** | 4.5:1 | ✅ |
| oscuro | Etiqueta de botón primario | `accionPrimariaTexto` sobre `accionPrimariaFondo` | #0f1319 / #82a4e3 | **7.42:1** | 4.5:1 | ✅ |
| oscuro | Botón primario en hover | `accionPrimariaTexto` sobre `accionPrimariaFondoHover` | #0f1319 / #b2c8f0 | **11.01:1** | 4.5:1 | ✅ |
| oscuro | Etiqueta de botón secundario | `accionSecundariaTexto` sobre `accionSecundariaFondo` | #82a4e3 / #1a1f27 | **6.59:1** | 4.5:1 | ✅ |
| oscuro | Botón secundario en hover | `accionSecundariaTexto` sobre `accionSecundariaFondoHover` | #82a4e3 / #29313b | **5.24:1** | 4.5:1 | ✅ |
| oscuro | Texto sobre acento oro | `acentoTexto` sobre `acentoFondo` | #0f1319 / #efcc4d | **11.90:1** | 4.5:1 | ✅ |
| oscuro | Coincidencia resaltada en buscador | `resaltadoTexto` sobre `resaltadoFondo` | #ffffff / #705800 | **6.81:1** | 4.5:1 | ✅ |
| oscuro | Mensaje de éxito | `exitoTexto` sobre `exitoFondo` | #c7ead6 / #0a2c1b | **11.64:1** | 4.5:1 | ✅ |
| oscuro | Mensaje de advertencia | `alertaTexto` sobre `alertaFondo` | #f9e2bc / #3a2504 | **11.50:1** | 4.5:1 | ✅ |
| oscuro | Mensaje de error | `errorTexto` sobre `errorFondo` | #f9cdca / #450e0a | **11.07:1** | 4.5:1 | ✅ |
| oscuro | Borde de campo de formulario | `bordeFuerte` sobre `superficieBase` | #98a2b0 / #0f1319 | **7.21:1** | 3.0:1 | ✅ |
| oscuro | Borde de campo dentro de tarjeta | `bordeFuerte` sobre `superficieElevada` | #98a2b0 / #29313b | **5.09:1** | 3.0:1 | ✅ |
| oscuro | Anillo de foco de teclado | `bordeFoco` sobre `superficieBase` | #efcc4d / #0f1319 | **11.90:1** | 3.0:1 | ✅ |
| oscuro | Anillo de foco sobre sección alterna | `bordeFoco` sobre `superficieSutil` | #efcc4d / #1a1f27 | **10.57:1** | 3.0:1 | ✅ |
| oscuro | Anillo de foco dentro de tarjeta | `bordeFoco` sobre `superficieElevada` | #efcc4d / #29313b | **8.40:1** | 3.0:1 | ✅ |
| oscuro | Anillo de foco sobre la marca | `bordeFocoSobreMarca` sobre `superficieMarca` | #ffffff / #05193d | **17.31:1** | 3.0:1 | ✅ |
| oscuro | Anillo de foco en isla clara | `bordeFocoEnClaro` sobre `superficieElevada` | #efcc4d / #29313b | **8.40:1** | 3.0:1 | ✅ |
| oscuro | Silueta del botón primario | `accionPrimariaFondo` sobre `superficieBase` | #82a4e3 / #0f1319 | **7.42:1** | 3.0:1 | ✅ |
| oscuro | Borde del botón secundario | `accionSecundariaBorde` sobre `superficieBase` | #82a4e3 / #0f1319 | **7.42:1** | 3.0:1 | ✅ |
| oscuro | Línea de acento decorativa-informativa | `acentoLinea` sobre `superficieBase` | #efcc4d / #0f1319 | **11.90:1** | 3.0:1 | ✅ |
| oscuro | Borde del mensaje de éxito | `exitoBorde` sobre `exitoFondo` | #5fbc89 / #0a2c1b | **6.51:1** | 3.0:1 | ✅ |
| oscuro | Borde del mensaje de advertencia | `alertaBorde` sobre `alertaFondo` | #d8a23f / #3a2504 | **6.33:1** | 3.0:1 | ✅ |
| oscuro | Borde del mensaje de error | `errorBorde` sobre `errorFondo` | #e8756c / #450e0a | **5.45:1** | 3.0:1 | ✅ |
| oscuro | Acento oro sobre marca | `acentoLineaSobreMarca` sobre `superficieMarca` | #efcc4d / #05193d | **11.06:1** | 3.0:1 | ✅ |
| oscuro | Icono sobre su pastilla de marca | `textoEnlace` sobre `superficieMarcaSutil` | #82a4e3 / #030f26 | **7.61:1** | 3.0:1 | ✅ |

## Qué NO cubre esta verificación

Esta herramienta mide pares de tokens. **No** sustituye a:

- La revisión con axe DevTools sobre las páginas ya renderizadas (detecta combinaciones que el sistema de tokens no previó).
- El texto sobre imágenes o video del hero, cuyo contraste depende del asset. Ver la capa de oscurecimiento en `HeroMedia.astro`.
- El contraste de los estados `:hover`/`:active` generados con `color-mix()`, si se llegara a usar.
