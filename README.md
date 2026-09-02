# Prototipo de rediseño — DGPE UNAM

Propuesta de rediseño del sitio de la **Dirección General de Personal** de la UNAM, hecha como parte de un servicio social.

> **Esto no es el sitio oficial.** Es un prototipo navegable para discutir ideas concretas con nuestro responsable. Los trámites, plazos, correos y teléfonos son **ejemplos inventados** y no tienen validez alguna.

---

## Arrancar el proyecto

Necesitas [Node.js 20 o superior](https://nodejs.org/) (viene con `npm`). Verifica que lo tengas:

```bash
node --version
```

Después, dentro de la carpeta del proyecto:

```bash
npm install     # solo la primera vez, o cuando cambien las dependencias
npm run dev     # arranca el sitio
```

Abre <http://localhost:4321> en tu navegador. **Los cambios que guardes aparecen solos**, sin recargar.

Para detenerlo: `Ctrl + C` en la terminal.

### Todos los comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca el sitio en modo desarrollo. **Este es el que usas a diario.** |
| `npm run build` | Genera el sitio final en `dist/`. Falla si hay errores. |
| `npm run preview` | Muestra el sitio ya construido, tal como se vería publicado. |
| `npm run tokens` | Regenera el CSS a partir de `design/tokens.json`. Ya corre solo dentro de `dev` y `build`. |
| `npm run test` | Prueba la lógica del buscador (23 casos: sinónimos, acentos, filtros). |
| `npm run check` | Revisa tipos y plantillas. |
| `npm run verificar` | Corre todas las comprobaciones de una: tokens, pruebas, contraste, tipos. |
| `npm run a11y:contraste` | Verifica el contraste WCAG de todos los colores. |
| `npm run a11y:tokens` | Revisa que no haya colores ni tipografías escritos a mano. |
| `npm run format` | Ordena el formato de todos los archivos. |

---

## Qué demuestra el prototipo

| | Cómo se resolvió |
| --- | --- |
| **Navegación por rol** | El home pregunta *quién eres* antes que *qué área lo atiende*. Cuatro accesos grandes, no un submenú escondido. |
| **Buscador de trámites** | Autocompletado sobre 14 trámites. Cada uno guarda sus sinónimos, así que "carta laboral" encuentra "Constancia de servicios". |
| **Sistema de diseño** | 225 tokens en `design/tokens.json`, en formato compatible con Tokens Studio de Figma. Ningún color escrito a mano en el código. |
| **Accesibilidad** | WCAG 2.1 AA con verificación automatizada de contraste, navegación completa por teclado y control de tamaño de texto. |
| **Responsive** | Diseñado primero para 375 px. Sin menús rotos ni desbordamientos horizontales. |
| **Rendimiento** | Sitio estático, cero JavaScript de framework, tipografía autohospedada. |
| **Hero con video** | Componente listo para recibir el asset, con fallback a imagen y respeto a `prefers-reduced-motion`. |

---

## Cómo editar el sitio

**No necesitas saber programar para cambiar el contenido ni los colores.** Todo lo editable vive en dos lugares:

| Quiero cambiar… | Voy a… |
| --- | --- |
| El texto de un trámite | `src/content/tramites/<nombre>.md` |
| El texto de una página de perfil | `src/content/roles/<nombre>.md` |
| Un color, un tamaño de letra, un espaciado | `design/tokens.json` |
| El menú principal | `src/components/layout/Encabezado.astro` (arriba, la lista `ENLACES`) |
| El pie de página | `src/components/layout/PieDePagina.astro` (arriba, la lista `COLUMNAS`) |

Hay una **[guía paso a paso con ejemplos](docs/guia-de-edicion.md)**. Empieza por ahí.

---

## El video del hero

El componente ya está listo. Solo deja los archivos en `public/media/hero/` con estos nombres exactos:

```
public/media/hero/
├─ hero.webm     ← el video (formato preferido, pesa menos)
├─ hero.mp4      ← el mismo video en mp4, para Safari viejo
└─ poster.jpg    ← una imagen fija del video
```

**No hay que tocar código.** El componente detecta los archivos al arrancar y los usa. Si no existen, dibuja un degradado con los colores de la marca — la página nunca se ve rota.

Recomendaciones para el asset:

- **Sin audio** y de menos de 10 segundos, en bucle.
- **Menos de 2 MB.** Un video pesado tira la calificación de rendimiento.
- **Que funcione oscurecido**: encima va una capa azul translúcida para garantizar que el texto blanco se lea. Evita videos donde el detalle importante quede en las sombras.
- **Sin texto dentro del video.** Un texto quemado en el video no lo puede leer un lector de pantalla ni se puede traducir.

---

## Estructura del proyecto

```
├─ design/
│  └─ tokens.json          ← COLORES, TIPOGRAFÍA Y ESPACIADO. La fuente de verdad.
├─ docs/                   ← Documentación (guía de edición, accesibilidad)
├─ public/
│  ├─ favicon.svg
│  └─ media/hero/          ← Aquí va el video del hero
├─ scripts/                ← Utilidades de build y verificación
└─ src/
   ├─ components/
   │  ├─ a11y/             ← Control de tamaño de texto, cambio de tema
   │  ├─ base/             ← Botón, tarjeta, pastilla, iconos
   │  ├─ home/             ← Hero, rejilla de roles, buscador
   │  └─ layout/           ← Encabezado, pie, migas de pan
   ├─ content/
   │  ├─ tramites/         ← UN ARCHIVO POR TRÁMITE. Edítalos libremente.
   │  └─ roles/            ← Uno por perfil
   ├─ layouts/             ← Plantillas de página
   ├─ lib/                 ← Lógica de búsqueda y utilidades
   ├─ pages/               ← Cada archivo aquí es una URL del sitio
   ├─ scripts/             ← JavaScript del navegador
   └─ styles/
      ├─ tokens/           ← GENERADO. No editar: se sobreescribe.
      ├─ reset.css
      ├─ base.css
      └─ utilities.css
```

---

## Extensiones de VS Code

Al abrir el proyecto, VS Code sugiere las extensiones necesarias — acepta la sugerencia. Si no aparece, abre la pestaña de extensiones y escribe `@recommended`.

Las importantes:

| Extensión | Para qué |
| --- | --- |
| **Astro** | Colorea y autocompleta los archivos `.astro`. Imprescindible. |
| **Prettier** | Ordena el formato al guardar. Ya está configurado. |
| **ESLint** | Marca errores de código y de accesibilidad mientras escribes. |
| **axe Accessibility Linter** | Subraya problemas de accesibilidad en el marcado, en vivo. |
| **Error Lens** | Muestra los errores en la misma línea, sin tener que pasar el cursor. |
| **Color Highlight** | Pinta los colores hexadecimales en `tokens.json`. |

---

## Decisiones técnicas

**¿Por qué Astro?** Genera HTML estático con cero JavaScript por defecto, lo que da buen rendimiento casi gratis. El contenido vive en archivos Markdown legibles, así que se puede editar sin tocar código. Y valida el contenido en el build: si a un trámite le falta un campo, el error aparece en la terminal, no en la demo.

**¿Por qué CSS puro y no Tailwind?** Los custom properties son estándar del navegador y se conectan directamente con Figma vía Tokens Studio. Con Tailwind, cambiar la marca implicaría reescribir clases en cada componente; aquí basta con reapuntar un token.

**¿Por qué sin librería de componentes?** Cuatro componentes propios y bien hechos pesan menos y son más accesibles que una librería genérica adaptada a medias.

---

## Publicar el sitio

`netlify.toml` ya trae la configuración: comando de build, versión de Node, cabeceras de caché y de no indexación. Al conectar el repositorio, Netlify lo lee solo y no hay que rellenar nada en su panel.

```bash
npm run verificar   # que esté todo en verde antes de publicar
git push
```

El CSS de `src/styles/tokens/` no se versiona, pero eso no rompe nada: `npm run build` lo regenera desde `design/tokens.json` antes de compilar. Comprobado borrando la carpeta y compilando desde cero.

### Antes de publicar, léete esto

El sitio lleva identidad de la UNAM y describe trámites de una dependencia que existe, **pero todo su contenido es inventado**. Eso obliga a dos cosas:

**No se indexa, y es a propósito.** Hay tres capas: `public/robots.txt`, la metaetiqueta `robots` en `BaseLayout.astro`, y la cabecera `X-Robots-Tag` en `netlify.toml`. Si el sitio saliera en resultados de búsqueda, alguien que busca un trámite real podría llegar aquí y tomar por buenos unos requisitos y plazos que no lo son. **No quites ninguna de las tres** mientras el contenido sea ficticio.

**Ningún dato de contacto apunta a la UNAM.** Los correos usan el dominio `.example`, reservado por la RFC 2606 y garantizado a no resolver nunca; los teléfonos son de relleno. Lo vigila un script:

```bash
npm run check:ficticios
```

Falla si aparece un buzón sobre `unam.mx` o un conmutador real de CU. Ya pasó una vez —el pie mostraba el conmutador real en las 23 páginas— y por eso es un script y no una nota. Corre dentro de `npm run verificar`.

**Al compartir el enlace, di que es una maqueta con datos de ejemplo.** El sitio lo advierte en el encabezado, el pie y cada ficha, pero un enlace reenviado llega sin ese contexto.

---

## Estado actual

- ✅ Sistema de diseño con temas claro y oscuro, contraste AA verificado por script (76/76 pares).
- ✅ Home con navegación por rol y buscador con autocompletado.
- ✅ Página de perfil, listado filtrable y landing de trámite.
- ✅ 14 trámites de ejemplo con sinónimos de búsqueda.
- ✅ Lighthouse 100 en Rendimiento, Accesibilidad, Buenas prácticas y SEO, en las cuatro plantillas.
- ✅ Recorrido con teclado: 104 paradas entre tres plantillas, sin ninguna sin indicador de foco ni por debajo de 3:1.
- ⏳ Video del hero: pendiente del asset.
- ⏳ Contenido real: los trámites son inventados.
- ⏳ Prueba con lector de pantalla.
