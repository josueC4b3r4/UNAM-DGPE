# Sistema de diseño

Referencia técnica de los tokens. Para *editarlos*, la [guía de edición](guia-de-edicion.md) es más práctica; esto explica **cómo está construido y por qué**.

---

## Arquitectura en dos capas

```
design/tokens.json                     ← fuente de verdad (formato W3C DTCG)
        │
        │  npm run tokens
        ▼
src/styles/tokens/
  ├─ primitivos.css     --p-color-azul-700: #0c4270;
  ├─ semanticos.css     --color-texto-enlace: var(--p-color-azul-700);
  └─ index.css
        │
        ▼
componentes .astro      color: var(--color-texto-enlace);
```

### Capa 1 — Primitivos (`--p-*`)

La paleta cruda. Valores literales sin significado de uso: `--p-color-azul-700` es un tono, no un rol.

**Los componentes no deben consumir esta capa.** Un componente que escribe `var(--p-color-azul-700)` fija un color que ya no puede cambiar con el tema.

### Capa 2 — Semánticos

El nombre describe el **uso**, no el color: `--color-texto-enlace`, `--color-accion-primaria-fondo`. Su valor cambia con el tema; su nombre, nunca.

Eso es lo que hace que un componente escrito una sola vez funcione en claro y en oscuro sin una línea condicional.

### Por qué dos capas y no una

Con una sola capa, soportar tema oscuro obliga a duplicar cada componente o a llenar el CSS de `@media (prefers-color-scheme)`. Con dos, el tema es un cambio de valores en un solo archivo.

El caso que lo demuestra mejor está en el borde de los mensajes de estado:

| | Tema claro | Tema oscuro |
| --- | --- | --- |
| `--color-exito-borde` | `exito.600` (oscuro) | `exito.300` (claro) |

Van en **direcciones opuestas**, porque uno se dibuja sobre fondo claro y otro sobre fondo oscuro. Un único token "verde de borde" no podría cumplir 3:1 en ambos.

---

## Convención de nombres

| Patrón | Ejemplo | Significa |
| --- | --- | --- |
| `--p-<grupo>-<nombre>` | `--p-color-azul-700` | Primitivo |
| `--color-<rol>` | `--color-texto-tenue` | Color semántico |
| `--espacio-<escala>` | `--espacio-bloque` | Espaciado semántico |
| `--tipo-<rol>-<prop>` | `--tipo-titulo-2-tamano` | Tipografía semántica |

En `tokens.json` se escribe en `camelCase` (`textoTenue`) y el generador lo convierte a `kebab-case` (`--color-texto-tenue`).

---

## Color

### Paletas

| Paleta | Pasos | Uso |
| --- | --- | --- |
| `azul` | 50–950 | Color institucional. Marca, acciones, enlaces |
| `oro` | 50–900 | Acento. Líneas, resaltados, estado activo. Nunca fondo de texto largo |
| `neutro` | 0–1000 | Texto, superficies, bordes |
| `exito` / `alerta` / `error` | 50–900 | Mensajes de estado |

Los neutros tienen un ligero sesgo azul para que convivan con el azul institucional sin verse sucios.

#### Anclaje en los colores oficiales

Las dos rampas de marca están ancladas en los colores institucionales exactos:

| Token | Valor | HSL | Es el oficial |
| --- | --- | --- | --- |
| `azul.800` | `#08245A` | 219° 84 % 19 % | ✅ exacto |
| `oro.500` | `#BD9500` | 47° 100 % 37 % | ✅ exacto |

El resto de cada rampa mantiene el tono (219° y 47°) y varía luminosidad y saturación. Si algún día cambian los colores institucionales, se re-ancla ahí y `npm run tokens && npm run a11y:contraste` dice de inmediato qué se rompió.

#### La regla del oro: acentúa sobre el azul, no sobre el blanco

Esto no es preferencia estética, es medición:

| Combinación | Contraste | Veredicto |
| --- | --- | --- |
| `#BD9500` sobre blanco | **2.81:1** | ❌ falla texto (4.5) **y** elementos de interfaz (3.0) |
| `#BD9500` sobre el azul `#08245A` | **5.29:1** | ✅ pasa incluso para texto normal |
| Texto oscuro sobre `#BD9500` | 7.46:1 | ✅ |
| `#08245A` sobre blanco | 14.89:1 | ✅ excelente |

Un amarillo saturado tiene demasiada luminancia para contrastar con blanco. No hay forma de rodearlo: o se oscurece, o no va sobre blanco.

En la práctica:

- **Sobre el azul** (encabezado, pie, cabeceras de marca): usa `acentoLineaSobreMarca`, que **es** el oro oficial.
- **Sobre superficies claras**: el oro oficial sólo puede ser **fondo** (con texto oscuro encima) o **adorno sin significado**. Si un borde dorado sobre blanco es la única señal de que algo está seleccionado, para mucha gente esa señal no existe.
- **Acentos con significado sobre blanco**: `acentoLinea` usa `oro.600` (`#947400`, 4.41:1) para bordes e iconos. Para texto hace falta `oro.700` (`#705800`, 6.81:1).

Por eso existen `acentoLinea` y `acentoLineaSobreMarca` por separado — mismo motivo que `textoTenueSobreMarca`.

### Roles semánticos

**Superficies** — `base`, `sutil`, `hundida`, `elevada`, `marca`, `marcaSutil`

En tema oscuro las superficies **suben de tono al elevarse** (`base` es más oscuro que `elevada`). En claro se elevan con sombra. Es la convención correcta: en oscuro las sombras no se ven.

**Texto** — `principal`, `secundario`, `tenue`, `sobreMarca`, `tenueSobreMarca`, `enlace`, `enlaceHover`

`tenueSobreMarca` existe por una razón medible: `textoTenue` sobre la superficie de marca da **1.95:1**. No se puede reutilizar.

**Bordes** — `sutil`, `medio`, `fuerte`, `foco`

`fuerte` es el único que garantiza 3:1 contra las superficies; es el que va en bordes de campos de formulario.

**Acciones** — `primaria`, `secundaria` (cada una con `fondo`, `fondoHover`, `texto`, `borde`)

---

## Tipografía

**Source Sans 3 Variable**, autohospedada con `@fontsource-variable`. Sin petición a un CDN externo: mejor LCP y ningún dato del usuario sale hacia Google.

### Escala

Modular ≈1.2, del paso 100 (0.75rem) al 900 (3rem). Los tamaños grandes usan `clamp()` para escalar con el viewport sin media queries.

**Todo en `rem`, sin excepción.** Es lo que hace funcionar el control de tamaño de texto del encabezado:

```css
html {
  font-size: calc(100% * var(--escala-texto, 1));
}
```

Un solo valor cambia y el sitio entero escala. Si un componente escribiera `font-size: 14px`, ese texto se quedaría chico para quien más lo necesita.

### Interlineado

El cuerpo nace en `1.65`. WCAG 1.4.12 exige que el texto siga siendo legible con interlineado forzado de 1.5; empezar arriba de ese valor evita reflujos rotos cuando alguien aplica una hoja de estilo propia.

---

## Espaciado

Escala de 4 px (`0.25rem`), del paso 0 al 12.

Roles semánticos: `--espacio-elemento` (dentro de un componente), `--espacio-componente` (entre componentes), `--espacio-bloque`, `--espacio-seccion` (fluido con `clamp`).

---

## Movimiento

`--movimiento-duracion-rapida` (150 ms), `media` (250 ms), y la curva `cubic-bezier(0.2, 0, 0, 1)`.

Toda animación va dentro de:

```css
@media (prefers-reduced-motion: no-preference) { … }
```

El reset además reduce cualquier animación a 1 ms cuando se pide menos movimiento. **1 ms y no 0**, para que los eventos `transitionend` que algún script pudiera esperar sigan disparándose.

---

## Cómo se aplica el tema

```css
:root                                   { /* claro: valores por defecto */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-tema='claro'])        { /* oscuro si el sistema lo pide… */ }
}

:root[data-tema='oscuro']               { /* …o si el usuario lo eligió */ }
```

La preferencia explícita del usuario gana sobre la del sistema. Se aplica con un script **bloqueante en el `<head>`**, antes del primer pintado: si se hiciera después, habría un destello blanco en cada navegación.

---

## Las dos reglas del sistema

### 1. Nada de valores literales fuera de los tokens

```bash
npm run a11y:tokens
```

Recorre `src/` y falla si encuentra un `#hex`, un `rgb()`, un `font-family` o un `font-size` literal.

Hay una salida de emergencia, deliberadamente incómoda: un comentario `tokens-ok: <razón>` en la línea. Se usa en cuatro lugares del proyecto, todos velos translúcidos (`rgb(255 255 255 / 0.12)`) donde lo que importa es la opacidad, no el tono.

### 2. Todo par de colores cumple AA

```bash
npm run a11y:contraste
```

36 pares × 2 temas = **72 combinaciones verificadas**, con los umbrales de WCAG 2.1 (4.5:1 texto, 3:1 elementos de interfaz). Resultado actual y detalle par por par: [`resultado-contraste.md`](resultado-contraste.md).

El generador además **falla el build si un token existe en un tema y no en el otro**. Sin esa comprobación, un token olvidado en `oscuro` se manifestaría como un color que simplemente no se aplica, sin ningún error.

---

## Agregar un token nuevo

1. Si es un valor nuevo de paleta, agrégalo en `primitivo`.
2. Agrega el token semántico **en los dos temas**, `claro` y `oscuro`.
3. Si es un color que va sobre otro, agrega el par en la lista `PARES` de `scripts/check-contraste.mjs`.
4. Corre `npm run verificar`.

El paso 3 es el que sostiene el sistema: un token de color sin par declarado es un token que nadie está verificando.
