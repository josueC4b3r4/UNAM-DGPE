# Guía de edición

Para cambiar contenido, colores o tipografía **sin tocar código**. Ningún paso de esta guía requiere saber programar.

---

## Antes de empezar

1. Abre la carpeta del proyecto en VS Code.
2. Abre la terminal integrada: menú **Terminal → Nueva terminal**.
3. Escribe `npm run dev` y presiona Enter.
4. Abre <http://localhost:4321> en el navegador.

Deja la terminal abierta mientras trabajas. **Cada vez que guardes un archivo, el navegador se actualiza solo.**

Para terminar, presiona `Ctrl + C` en la terminal.

---

## 1. Cambiar el texto de un trámite

Los trámites están en `src/content/tramites/`. Un archivo `.md` por trámite.

Abre por ejemplo `constancia-de-servicios.md`. Verás dos partes:

### La ficha técnica (arriba, entre las líneas `---`)

```yaml
---
titulo: Constancia de servicios
resumen: Documento oficial que acredita tu antigüedad…
duracion: 3 días hábiles
costo: Gratuito
---
```

Cambia el texto a la derecha de los dos puntos. **Respeta la sangría** (los espacios al inicio de cada línea): en este formato los espacios significan algo.

Campos que puedes cambiar libremente:

| Campo | Qué es | Cuidado |
| --- | --- | --- |
| `titulo` | El nombre del trámite | — |
| `resumen` | Una o dos frases. Aparece en las tarjetas y en el buscador | Entre 20 y 220 caracteres |
| `duracion` | Cuánto tarda | Texto libre |
| `costo` | Cuánto cuesta | Texto libre |
| `destacado` | `true` lo pone en el home | Solo `true` o `false` |
| `sinonimos` | Cómo lo busca la gente | Ver abajo |
| `actualizado` | Fecha de última revisión | Formato `2026-08-14` |

Campos que tienen valores fijos (si escribes otro, el sitio no arranca y la terminal te dice cuál está mal):

- `roles`: `academico`, `administrativo`, `jefe`
- `categoria`: `constancias`, `nombramientos`, `prestaciones`, `pagos`, `licencias`, `jubilacion`
- `modalidad`: `linea`, `presencial`, `mixta`

### El contenido (abajo)

Todo lo que va después del segundo `---` es texto normal con formato Markdown:

```markdown
## Un título de sección

Un párrafo normal. Para poner algo en **negritas**, se rodea con dos asteriscos.

- Una lista
- Otro punto

1. Una lista numerada
2. Segundo paso
```

Para poner un enlace a otro trámite:

```markdown
Consulta la [constancia de servicios](/tramites/constancia-de-servicios/).
```

La dirección es `/tramites/` seguido del **nombre del archivo sin `.md`**, con una barra al final.

---

## 2. Agregar un trámite nuevo

1. Copia un archivo existente de `src/content/tramites/`.
2. Renómbralo. El nombre del archivo será su dirección web:
   `pago-de-marcha.md` → `misitio.com/tramites/pago-de-marcha/`
   Usa **solo minúsculas, sin acentos y con guiones** en lugar de espacios.
3. Cambia el contenido.
4. Guarda. El trámite aparece solo en el listado, en el buscador y en la página de su perfil. **No hay que registrarlo en ningún otro lado.**

### Los sinónimos son lo más valioso que puedes aportar

```yaml
sinonimos:
  - carta laboral
  - comprobante de trabajo
  - carta de antigüedad
```

Aquí va **cómo la gente busca el trámite de verdad**, no cómo se llama en el reglamento. Alguien escribe "me incapacitaron", no "registro de licencia médica".

Cada sinónimo que agregues es una persona que encuentra lo que busca. Es la parte del contenido donde más se nota tu criterio.

---

## 3. Cambiar colores, tipografía o espaciados

Todo vive en **un solo archivo**: `design/tokens.json`.

### Cambiar un color de la paleta

Busca la sección `primitivo` → `color`:

```json
"azul": {
  "600": { "$value": "#14528a" },
  "700": { "$value": "#0c4270" }
}
```

Cambia el valor hexadecimal y guarda. **El sitio entero se actualiza**, porque ningún componente tiene colores escritos a mano.

### Cambiar dónde se usa un color

La sección `semantico` decide qué color va en cada lugar. Por ejemplo:

```json
"accionPrimariaFondo": { "$value": "{primitivo.color.azul.700}" }
```

Eso dice: "el fondo de los botones principales usa el azul 700". Para que los botones sean más oscuros, cambia `azul.700` por `azul.800`.

Fíjate que hay **dos bloques**: `claro` y `oscuro`. Si cambias uno, revisa el otro.

### Después de cambiar colores, verifica el contraste

```bash
npm run a11y:contraste
```

Te dice, par por par, si los colores siguen siendo legibles. Si algo falla, aparece con una ✗ y el color exacto que hay que ajustar. El reporte completo queda en [`docs/resultado-contraste.md`](resultado-contraste.md).

**Este paso no es opcional.** Un color bonito que nadie con baja visión puede leer no sirve.

### Cambiar la tipografía

En `primitivo` → `tipografia` → `familia` → `base`. Para usar otra fuente hay que instalarla primero — pídeme ayuda con eso, es el único cambio de esta guía que sí toca código.

Los **tamaños** sí los puedes cambiar libremente, en `tipografia` → `tamano`. Están en `rem`: `1rem` = 16 px, `1.5rem` = 24 px.

---

## 4. Trabajar con Figma (Tokens Studio)

`design/tokens.json` está en formato **W3C Design Tokens**, que es lo que exporta el plugin [Tokens Studio](https://tokens.studio/).

El flujo:

1. En Figma, ajustas los tokens con el plugin.
2. Exportas a JSON.
3. Reemplazas el contenido de `design/tokens.json`.
4. Corres `npm run dev` (o lo reinicias si ya estaba corriendo).
5. Corres `npm run a11y:contraste` para confirmar que nada se rompió.

Mantén la estructura de dos niveles: `primitivo` (la paleta) y `semantico` (dónde se usa cada color). Es lo que permite tener tema claro y oscuro sin duplicar componentes.

---

## 5. Cambiar el menú o el pie de página

Son las dos únicas cosas de esta guía que están dentro de un archivo de código, pero el cambio es sencillo: **están hasta arriba del archivo, en una lista clara.**

**Menú:** `src/components/layout/Encabezado.astro`

```js
const ENLACES = [
  { href: '/tramites/', texto: 'Trámites' },
  { href: '/perfil/academico/', texto: 'Personal académico' },
];
```

**Pie:** `src/components/layout/PieDePagina.astro`, en la lista `COLUMNAS`.

Copia una línea existente, cambia el texto y la dirección, y respeta las comas y las llaves.

---

## Si algo se rompe

**Regla de oro: lee el mensaje de la terminal.** Casi siempre dice el archivo y la línea exacta.

| Mensaje | Qué pasó |
| --- | --- |
| `Invalid enum value. Expected 'academico' \| …` | Escribiste un valor que no existe en `roles`, `categoria` o `modalidad` |
| `String must contain at least 20 character(s)` | El `resumen` es demasiado corto |
| `Expected date, received string` | La fecha de `actualizado` va como `2026-08-14` |
| `Reference ... does not exist` | En `relacionados` pusiste un trámite que no existe. Revisa el nombre del archivo |
| La página se ve sin estilos | Reinicia con `Ctrl + C` y `npm run dev` |

Si nada de esto ayuda, **no borres nada**: guarda el mensaje de error completo y avísame.

---

## Antes de mostrarle el sitio a alguien

```bash
npm run verificar
```

Corre todas las comprobaciones de golpe: tokens, contraste, tipos y contenido. Si termina sin errores, el sitio está listo.
