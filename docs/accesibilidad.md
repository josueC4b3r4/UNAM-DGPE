# Checklist de accesibilidad

Estado de conformidad con **WCAG 2.1 nivel AA**.

Cada punto lleva su estado real. Se distingue entre lo **verificado** (con evidencia reproducible), lo **implementado** (construido según la norma, pero sin prueba formal) y lo **pendiente**. Mezclar las tres cosas es lo que hace que una declaración de accesibilidad deje de servir.

| Símbolo | Significa |
| --- | --- |
| ✅ | Verificado con evidencia reproducible |
| 🔧 | Implementado según la norma, sin prueba formal ejecutada |
| ⏳ | Pendiente |

---

## 1. Perceptible

### 1.1.1 Contenido no textual (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Iconos decorativos | `Icono.astro` pone `aria-hidden="true"` por defecto. Un icono solo se anuncia si se le pasa `etiqueta`. |
| 🔧 | Video del hero | Marcado `aria-hidden`, sin audio y puramente decorativo. El texto del hero está en HTML, no dentro del video. |
| 🔧 | Imagen de respaldo | `alt=""` porque es decorativa y su contenido no aporta información. |
| 🔧 | Separadores de migas | El `/` se dibuja con `::before` en CSS, no como texto. Sin él, un lector de pantalla leería "diagonal" entre cada nivel. |
| 🔧 | Código 404 | El "404" gigante lleva `aria-hidden`: el `<h1>` ya comunica el error. |

### 1.3.1 Información y relaciones (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Jerarquía de encabezados | Un solo `<h1>` por página, sin saltos de nivel. `TarjetaTramite` recibe el nivel como prop en vez de fijarlo. |
| 🔧 | Puntos de referencia | `header`, `nav`, `main`, `footer`, `search`, `aside`. Cada `<nav>` con su propio `aria-label`. |
| 🔧 | Listas | Las listas sin marcador conservan `role="list"`, que Safari elimina al quitar `list-style`. |
| 🔧 | Formularios | Todo control tiene `<label>` asociado por `for`/`id`. El control de tamaño de texto usa `<fieldset>` con `<legend>`. |
| 🔧 | Tablas | `<th>` en encabezados. Envueltas en una región desplazable con nombre accesible. |

### 1.4.1 Uso del color (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Enlaces | Subrayados por defecto, no solo distinguidos por color. |
| 🔧 | Página actual en el menú | `aria-current="page"` **y** una barra de acento inferior **y** negrita. |
| 🔧 | Opción activa del buscador | Fondo **y** barra lateral de 3 px. |
| 🔧 | Nivel de texto activo | Fondo, borde y negrita, además del tamaño creciente de la "A". |

### 1.4.3 Contraste mínimo (AA) — ✅ VERIFICADO

**72 de 72 pares cumplen.** Ver el reporte completo en [`resultado-contraste.md`](resultado-contraste.md).

```bash
npm run a11y:contraste
```

36 combinaciones × 2 temas, con los umbrales de 4.5:1 (texto), 3:1 (texto grande) y 3:1 (elementos de interfaz, criterio 1.4.11).

Tres hallazgos reales que la verificación obligó a corregir:

1. `textoTenue` sobre la superficie de marca daba **1.95:1**. Se creó el token `textoTenueSobreMarca` (8.29:1).
2. `bordeFuerte` sobre una tarjeta elevada en tema oscuro daba **2.90:1**. Se aclaró un paso (5.09:1).
3. Al adoptar el oro institucional exacto (`#BD9500`), `acentoLinea` cayó a **2.81:1** sobre blanco. Ver la nota sobre el oro más abajo.

Ambos habrían pasado desapercibidos en una revisión visual.

#### Por qué 72 pares de tokens no bastan

El verificador compara **pares de tokens**. Eso no cubre la **composición**: qué color hereda un elemento cuando se renderiza dentro de otro.

Un barrido en el navegador —recorriendo cada elemento de texto, subiendo por el DOM hasta el primer fondo no transparente y midiendo contra el umbral que le toca por tamaño y peso— encontró un fallo que los 72 pares daban por bueno:

> **Las sugerencias del buscador eran blanco sobre blanco en tema claro. Contraste 1.00:1. Invisibles.**

Causa: Astro encapsula el CSS de cada componente añadiendo `[data-astro-cid-…]` a los selectores y a los elementos del archivo `.astro`. Las opciones del desplegable las crea el controlador con `document.createElement`, así que **nunca reciben ese atributo** y ninguna regla encapsulada les aplicaba. Sin `color` propio heredaban el blanco del hero.

En tema oscuro no se notaba, porque ahí el texto heredado sí contrasta con el panel. Sólo fallaba en el tema por defecto.

Corregido moviendo esas reglas a un bloque `<style is:global>` acotado bajo `.buscador__lista`. Tras el arreglo: título **14.88:1**, metadatos **6.11:1**, resaltado **14.37:1**.

**Resultado del barrido completo:** 76 elementos de texto medidos por tema, **0 fallos en claro y 0 en oscuro**, con el desplegable abierto.

> **Cuidado al medir.** Cambiar el esquema de color con la herramienta del navegador, o alternar `data-tema` por JavaScript, deja estilos calculados obsoletos: aparecen fallos fantasma (el botón "Buscar" dio 2.51:1 y luego 1.5:1). **Recarga la página antes de medir.** Tras recargar, ese botón da 12.44:1 en claro y 7.42:1 en oscuro.

### 1.4.4 Cambio de tamaño del texto (AA) — ✅ VERIFICADO

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Escala hasta 200 % | Toda la tipografía en `rem`. El control del encabezado multiplica `--escala-texto` sobre el `<html>`. |
| ✅ | Prueba con texto al 200 % | Medido en navegador sobre la landing de trámite a 1280 px con `html { font-size: 200% }`: `scrollWidth` = ancho del viewport, **sin scroll horizontal** y sin bloques desbordados. |
| ✅ | Control propio del sitio al máximo | Con `--escala-texto: 1.3` tampoco aparece scroll horizontal, ni a 1280 px ni a 320 px. |

### 1.4.10 Reflujo (AA) — ✅ VERIFICADO

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Sin scroll horizontal a 320 px | Diseño mobile-first. Rejillas con `minmax(min(20rem, 100%), 1fr)`. |
| 🔧 | Tablas anchas | Scroll propio dentro de un contenedor enfocable, no scroll de página. |
| ✅ | Prueba a 320 px y 375 px | Medido en navegador en el home y en la landing de trámite: `document.body.scrollWidth` igual al ancho del viewport en ambos anchos, y cero elementos con el borde derecho fuera de la ventana. |
| ✅ | La tabla no arrastra la página | A 320 px la tabla mide 480 px, pero el `scrollWidth` del `body` sigue en 320: el desbordamiento queda contenido en `.tabla-envoltura`, como estaba previsto. |

> **Nota de método.** Una primera medición combinó 320 px de ancho *con* texto al 200 % y dio scroll horizontal. Esa prueba estaba mal planteada: equivale a meter contenido de 640 px en una ventana de 320, y es más estricta que lo que pide cualquiera de los dos criterios (1.4.10 pide reflujo a 320 px con texto normal; 1.4.4 pide texto al 200 % en un viewport normal). Medidos por separado, ambos pasan.

### 1.4.11 Contraste no textual (AA) — ✅ VERIFICADO

Incluido en los 72 pares: bordes de campos, anillo de foco, siluetas de botones y bordes de mensajes de estado.

### 1.4.12 Espaciado del texto (AA)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Interlineado ≥ 1.5 | El cuerpo nace en 1.65, por encima del mínimo exigido. |
| 🔧 | Sin alturas fijas | Ningún contenedor de texto tiene `height` fijo que pudiera recortar contenido. |

---

## 2. Operable

### 2.1.1 Teclado (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Sin elementos falsos | Todo lo interactivo es `<button>`, `<a>` o `<input>` nativo. Cero `<div onclick>`. |
| ✅ | Buscador | Ejercitado en navegador: `ArrowDown` fija `aria-activedescendant="dgpe-opcion-0"` y marca `aria-selected="true"`, **y `document.activeElement` sigue siendo el campo** — el foco nunca salta a la lista. |
| ✅ | Escape de dos niveles | Primer `Escape`: `aria-expanded="false"` conservando el texto escrito. Segundo `Escape`: el campo queda vacío. |
| 🔧 | Tablas desplazables | `tabindex="0"` sobre la región, para poder desplazarlas con teclado. |
| ⏳ | Recorrido completo de la página con Tab | Pendiente. Falta comprobar el orden de tabulación de principio a fin en cada plantilla. Lo verificado hasta ahora es el buscador, no la página entera. |

### 2.1.2 Sin trampas de teclado (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Menú móvil | Escape cierra **y devuelve el foco al botón**. |
| 🔧 | Buscador | El foco nunca sale del campo: la opción activa se señala con `aria-activedescendant`. Tab siempre sale. |

### 2.2.2 Poner en pausa, detener, ocultar (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Video en bucle | Botón de pausa/reproducción siempre visible sobre el hero. Es un requisito, no un extra: cualquier movimiento automático de más de 5 segundos debe poder detenerse. |
| 🔧 | `prefers-reduced-motion` | Con la preferencia activa el video **no se reproduce**. El `autoplay` no está en el HTML precisamente para poder decidirlo antes de que empiece. |

### 2.4.1 Evitar bloques (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Saltar al contenido | Primer elemento enfocable. `main` tiene `tabindex="-1"` para que el foco llegue de verdad, no solo el scroll. |

### 2.4.3 Orden del foco (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Orden visual = orden DOM | En la landing de trámite, la ficha lateral va después del contenido en el DOM y aparece al final en móvil. No se reordena con CSS. |
| 🔧 | Sin `tabindex` positivos | No se usa ninguno en todo el proyecto. |

### 2.4.7 Foco visible (AA)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Anillo de 3 px | Con `:focus-visible`, con desplazamiento de 2 px. |
| ✅ | Contraste del anillo | Verificado contra las tres superficies, en ambos temas (7.46:1 el peor caso). |
| 🔧 | Sin recortes | Ningún contenedor con `overflow: hidden` alrededor de elementos enfocables. |
| 🔧 | Tarjetas | El anillo se dibuja sobre la tarjeta completa con `:has()`, no sobre el texto del título. |

### 2.5.5 Tamaño del objetivo (AAA, adoptado)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | 44 × 44 px mínimo | Token `--objetivo-tactil-min`. Aplicado a botones, campos y controles del encabezado. Se adopta el nivel AAA porque el sitio se consume mucho desde el teléfono. |

---

## 3. Comprensible

### 3.1.1 Idioma de la página (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | `lang="es-MX"` | Declarado en `<html>` desde el layout base. |

### 3.2.3 / 3.2.4 Navegación y identificación coherentes (AA)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Menú idéntico en todas las páginas | Un solo componente `Encabezado`. |
| 🔧 | Componentes reutilizados | Botón, tarjeta y pastilla se comportan igual en todo el sitio. |

### 3.3.2 Etiquetas o instrucciones (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Ayuda del buscador | Texto asociado con `aria-describedby`, con un ejemplo concreto. |
| 🔧 | Estado del listado | El conteo de resultados es visible **y** se anuncia en una región viva. |

---

## 4. Robusto

### 4.1.2 Nombre, función, valor (A)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Combobox | `role`, `aria-expanded`, `aria-controls`, `aria-autocomplete`, `aria-activedescendant`, `aria-selected`. |
| 🔧 | Menú móvil | `aria-expanded` y `aria-controls`, sincronizados con el estado real. |
| 🔧 | Cambio de tema | El nombre accesible describe la acción ("Tema oscuro" = pulsa para cambiar a oscuro). |
| 🔧 | Tamaño de texto | Radios nativos: el lector anuncia "1 de 3" y las flechas navegan sin JavaScript propio. |

### 4.1.3 Mensajes de estado (AA)

| | Criterio | Cómo se resolvió |
| --- | --- | --- |
| 🔧 | Resultados del buscador | `role="status"` (educado, no interrumpe en cada tecla). |
| 🔧 | Conteo del listado | Misma región viva, presente en el DOM desde la carga. |

---

## Más allá de la norma

- **Funciona sin JavaScript.** El contenido, la navegación y los enlaces siguen operativos. Sin JS se pierden el autocompletado y los filtros, pero **ningún control aparece muerto**: el menú móvil se muestra desplegado y el botón se oculta; los filtros y los controles de tema y tamaño solo aparecen cuando hay JS para hacerlos funcionar.
- **Modo de alto contraste de Windows** (`forced-colors`): bordes explícitos donde el color por sí solo desaparecería.
- **`color-scheme`** declarado, para que los controles nativos y las barras de scroll sigan al tema.
- **Sin recursos de terceros.** La tipografía se autohospeda: no se filtra la IP del usuario a un CDN.

---

## Lo que falta

1. **Recorrido completo con teclado** en las cinco plantillas, documentando el resultado.
2. **Prueba con lector de pantalla** (NVDA y Narrador), idealmente con personas que los usen a diario.
3. **Zoom al 200 % y ancho de 320 px**, verificando que nada se desborde.
4. **axe DevTools** sobre las páginas ya renderizadas: detecta combinaciones que el sistema de tokens no previó.
5. **Lighthouse** en la home, con el video definitivo cargado.
6. **Revisión del contraste sobre el video** cuando llegue el asset. Hoy el velo garantiza el fondo; con un video muy claro habría que subir su opacidad.

---

## Cómo volver a verificar

```bash
npm run verificar        # tokens + contraste + tipos, todo de una
npm run a11y:contraste   # solo contraste, con reporte a docs/
npm run a11y:tokens      # colores o tipografías fuera del sistema
```
