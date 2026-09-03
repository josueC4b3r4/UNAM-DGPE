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

## 3. Los banners del inicio

Son las tarjetas grandes que rotan en lo alto de la portada. Están en `src/content/banners/`, un archivo por banner.

A diferencia de los trámites, aquí **todo va en la ficha técnica**. Un banner no tiene texto largo, así que lo que escribas debajo del segundo `---` no se muestra en ningún lado.

```yaml
---
titulo: Programa mensual de cursos
texto: Los cursos que abren este mes, con horario, sede y cupo disponible.
etiquetaAccion: Ver el programa del mes
href: /perfil/administrativo/
imagen: programa-mensual.jpg
alt: ''
orden: 2
activo: true
---
```

| Campo | Qué es | Cuidado |
| --- | --- | --- |
| `titulo` | El titular grande | Entre 5 y 70 caracteres |
| `texto` | Una o dos frases | Entre 20 y 160 caracteres |
| `etiquetaAccion` | El texto del botón | Un verbo y su objeto: «Ver el video», no «Más información» |
| `href` | A dónde lleva | Una ruta del sitio que empiece con `/`, o una dirección completa con `https://` |
| `imagen` | Nombre del archivo de imagen | Opcional. Ver más abajo |
| `alt` | Qué se ve en la imagen, para quien no puede verla | Déjalo vacío si el título ya dice lo mismo |
| `orden` | En qué posición sale | Número entero. El más bajo sale primero |
| `activo` | Si se muestra o no | Solo `true` o `false` |

Si escribes algo fuera de esos límites, el sitio no arranca y la terminal te dice qué archivo y qué campo están mal.

### Apagar un banner sin borrarlo

Cambia `activo: true` por `activo: false`. El archivo se queda donde está, con su texto intacto, y el banner desaparece de la portada. Para encenderlo otra vez, `true`.

Es mejor que borrar el archivo: cuando la convocatoria vuelva el año que viene, solo hay que cambiarle la fecha.

### Reordenar

Manda el campo `orden`. Si quieres que «Cursos en línea» pase a ser el primero, ponle `orden: 1` y súbeles el número a los demás.

No tienen que ser 1, 2, 3, 4 seguidos. Numerarlos **10, 20, 30, 40** funciona igual y te deja meter uno en medio después sin tocar los otros.

### Agregar uno nuevo

1. Copia un archivo existente de `src/content/banners/`.
2. Renómbralo. Este nombre no aparece en ninguna dirección web, así que basta con que lo reconozcas tú.
3. Cambia los campos.
4. Guarda. Aparece solo, en la posición que le diga `orden`.

### Las imágenes

Van en `public/media/banners/`, y en `imagen:` se escribe **solo el nombre del archivo**, no la ruta completa.

**Mientras no haya imagen, el banner se dibuja con un degradado azul y se lee perfectamente.** No hace falta poner una para que la portada funcione, y si el archivo falta nadie ve un hueco roto.

Sobre la imagen va siempre un velo oscuro: es lo que hace que el texto blanco se lea encima de cualquier foto. Si aun así una imagen te parece demasiado clara, no aclares el texto — pídele a quien lleve el código que suba el velo.

### Dos cosas que conviene no hacer

- **No metas el texto dentro de la imagen.** El título y la frase van en el archivo `.md`. Escritos ahí se pueden buscar, ampliar, traducir y leer en voz alta; dentro de un `.jpg` no.
- **No dejes solo un banner activo si esperas que rote.** Con uno solo no hay nada que rotar, así que los controles y la rotación no aparecen. Es a propósito.

---

## 4. Cambiar colores, tipografía o espaciados

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

## 5. Trabajar con Figma (Tokens Studio)

`design/tokens.json` está en formato **W3C Design Tokens**, que es lo que exporta el plugin [Tokens Studio](https://tokens.studio/).

El flujo:

1. En Figma, ajustas los tokens con el plugin.
2. Exportas a JSON.
3. Reemplazas el contenido de `design/tokens.json`.
4. Corres `npm run dev` (o lo reinicias si ya estaba corriendo).
5. Corres `npm run a11y:contraste` para confirmar que nada se rompió.

Mantén la estructura de dos niveles: `primitivo` (la paleta) y `semantico` (dónde se usa cada color). Es lo que permite tener tema claro y oscuro sin duplicar componentes.

---

## 6. Cambiar el menú o el pie de página

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
