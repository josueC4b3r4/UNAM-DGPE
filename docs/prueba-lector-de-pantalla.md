# Prueba con lector de pantalla

Guion para la única verificación de accesibilidad que ninguna herramienta
automática cubre, y la única del proyecto que sigue sin hacerse.

Lleva unos veinte minutos. No hace falta saber usar un lector de pantalla: el
truco del **visor de voz** (paso 2) convierte lo que NVDA dice en texto que se
lee en pantalla, así que se puede hacer en una oficina, sin auriculares y sin
haber oído nunca un lector.

> **Por qué hace falta.** `npm run lighthouse` da 100 en accesibilidad en las
> cinco plantillas, y aun así en este proyecto han aparecido cuatro fallos
> reales que ese 100 no veía: cajas de un diagrama con 1:1 de contraste, un
> precio equivocado junto a las opciones correctas, tres páginas que
> desbordaban a 320 px y un título de banner que se anunciaba antes que el
> título de la página. `axe` —el motor que usa Lighthouse— cubre alrededor de
> un tercio de los criterios WCAG. El resto se comprueba usando el sitio.

---

## 1. Instalar NVDA

Es gratuito y solo para Windows. <https://www.nvaccess.org/download/>

Durante la instalación acepta que cree el acceso directo. Después:

| Acción | Atajo |
| --- | --- |
| Arrancar NVDA | `Ctrl` + `Alt` + `N` |
| **Salir de NVDA** | `NVDA` + `Q` |
| **Callar lo que está diciendo** | `Ctrl` |

La tecla `NVDA` es **`Insert`** por defecto (durante la instalación se puede
elegir `Bloq Mayús`). Donde abajo se lea `NVDA + algo`, es `Insert + algo`.

> Apunta `NVDA + Q` antes de empezar. Es lo primero que se busca con nervios.

Usa **Firefox o Chrome**. NVDA se lleva bien con los dos.

---

## 2. Encender el visor de voz, y quitar la voz

Este paso es el que hace la prueba cómoda, y el que permite pegar resultados en
un informe.

1. `NVDA` + `N` abre el menú de NVDA.
2. **Herramientas → Visor de voz** (*Tools → Speech Viewer*). Se abre una
   ventana que va escribiendo todo lo que NVDA dice.
3. Marca dentro de esa ventana la casilla de **mostrar al arrancar**, para que
   no haya que repetirlo.

Y si no quieres que hable en voz alta:

4. `NVDA` + `Ctrl` + `S` abre el selector de sintetizador.
5. Elige **«Sin voz»** (*No speech*) y acepta.

A partir de aquí NVDA es silencioso y todo lo que «diría» aparece como texto en
el visor. Se puede copiar, pegar y capturar.

---

## 3. Los dos modos, que es lo único confuso

NVDA tiene dos modos y cambia entre ellos **solo**:

- **Modo exploración** (*browse mode*): para leer. Las letras del teclado son
  atajos de navegación — `H` salta al siguiente encabezado, no escribe una «h».
- **Modo formulario** (*focus mode*): al entrar en un campo de texto, las
  teclas vuelven a escribir.

`NVDA` + `Espacio` alterna entre los dos a mano. Si escribes en un buscador y no
aparece nada, estás en modo exploración: pulsa `NVDA` + `Espacio`.

### Teclas que vas a usar

| Tecla | Qué hace |
| --- | --- |
| `H` | Siguiente encabezado (`Mayús` + `H`, el anterior) |
| `1` … `6` | Siguiente encabezado de ese nivel |
| `D` | Siguiente región (landmark) |
| `K` | Siguiente enlace |
| `B` | Siguiente botón |
| `F` | Siguiente campo de formulario |
| `T` | Siguiente tabla |
| `Tab` | Siguiente elemento enfocable |
| `NVDA` + `F7` | **Lista de elementos**: todos los encabezados, enlaces y regiones de la página, en una ventana |
| `NVDA` + `↓` | Leer desde aquí hasta el final |

`NVDA + F7` es la más útil de todas para esta prueba.

---

## 4. Las cuatro comprobaciones

Ábrelas en <https://dgpe-prototipo.netlify.app>. Para cada una está lo que
**debería** pasar: si no coincide, es un hallazgo y hay que anotarlo.

### 4.1 · El índice de encabezados del inicio

Ve al inicio y pulsa `NVDA` + `F7`. Elige **Encabezados**.

- ✅ **Esperado:** el primero de la lista es el `h1` **«Tus trámites de personal,
  sin adivinar a qué área le tocan»**.
- ❌ **Fallo:** aparece antes el título de un banner («Programa mensual de
  cursos», «Consulta de necesidades…»).

> Esto se corrigió hace poco. Los títulos de los banners eran encabezados y se
> anunciaban antes que el título de la página. Esta comprobación confirma que
> la corrección funciona con un lector de verdad, no solo en el árbol.

Después cierra la lista y pulsa `H` varias veces seguidas: debería recorrerse un
índice con sentido —«Empieza por quién eres», «Los que más se consultan»,
«Cualquier trámite sigue los mismos cuatro pasos»…— sin saltos raros.

### 4.2 · El carrusel de avisos

En el inicio, pulsa `D` hasta llegar a la región **«Avisos destacados»**.

- ✅ **Esperado:** al entrar se anuncia algo parecido a *«Avisos destacados,
  región»*, y dentro, *«diapositiva, 1 de 4»*.
- ✅ Con `Tab` se llega al botón de la diapositiva visible, a las flechas
  «Banner anterior» / «Banner siguiente», a los cuatro puntos y a «Pausar
  rotación».
- ❌ **Fallo:** se anuncian las cuatro diapositivas a la vez, o se llega con
  `Tab` a botones de diapositivas que no se ven.

> Solo la diapositiva activa debería existir para el lector; las otras tres
> están marcadas con `inert`. Verificado en el árbol de accesibilidad, pendiente
> de confirmar al oído.

### 4.3 · El conteo del listado de trámites

Ve a **Trámites**, llega al campo «Buscar» con `F`, entra en modo formulario
(`NVDA` + `Espacio` si hiciera falta) y escribe **licencia**, a velocidad
normal.

- ✅ **Esperado:** mientras escribes no se anuncia nada, y al parar se oye
  **una sola vez** *«4 trámites encontrados»*.
- ❌ **Fallo:** se anuncian conteos intermedios («13 encontrados», «9
  encontrados»…) mientras todavía escribes.

> Antes anunciaba en cada tecla. Ahora el número visible se actualiza al
> instante y el anuncio espera 600 ms sin teclear. Si 600 ms se queda corto o
> largo, es un número que se cambia en una línea.

Prueba también a borrar el texto y a usar los selectores de **Categoría** y
**Perfil**: cada cambio debería anunciar el conteo nuevo.

### 4.4 · El cotizador de cursos

Ve a **Cursos**, llega a los selectores con `F` y cambia **Modalidad**.

- ✅ **Esperado:** al cambiar se anuncia el bloque completo: *«Costo estimado,
  $5,040.00, 12 h por $420.00 por hora»*. Se lee entero, no solo la cifra.
- ✅ Elige el curso **«Igualdad de género y prevención del acoso»**: el total
  debe anunciarse como **$0.00**, no como un hueco ni un silencio.
- ❌ **Fallo:** solo se oye el número sin el «Costo estimado», o se oyen las dos
  partes por separado y desordenadas.

Baja después a las tablas de precios y pulsa `T`.

- ✅ **Esperado:** al recorrer las celdas con `Ctrl` + `Alt` + flechas se
  anuncia la cabecera de fila y de columna: *«Presencial, Estándar 20 h,
  $8,400.00»*.

> **Y lo más importante de esta pantalla:** comprueba que el aviso de precios
> inventados se anuncia junto al total, no solo al principio de la página. Está
> puesto dentro del mismo recuadro precisamente para eso.

---

## 5. Extra: la prueba de los 30 segundos

Cierra los ojos —o apaga la pantalla— y trata de **encontrar la constancia de
servicios** desde el inicio usando solo NVDA.

No hay una respuesta correcta que medir. Lo que se busca es si el recorrido se
siente como una ruta o como un laberinto. Es la comprobación más subjetiva de
todas y suele ser la que más dice.

---

## 6. Anotar lo que salga

Para cada hallazgo:

1. **Qué página y qué elemento.**
2. **Qué dijo NVDA** — cópialo del visor de voz, literal.
3. **Qué esperabas que dijera.**

Con esas tres cosas el arreglo suele ser directo. Sin la segunda, casi nunca.

---

## Qué NO cubre esta prueba

Un solo lector, en un solo navegador, con una sola persona. NVDA, JAWS y el
Narrador de Windows no siempre coinciden, y quien usa un lector a diario navega
de formas que alguien que lo abre por primera vez no reproduce.

Es muchísimo mejor que nada —y es lo que falta— pero conviene decirlo si esto
se presenta como «verificado con lector de pantalla».
