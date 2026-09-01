import { buscar, textoConteo, type Resultado } from '../lib/busqueda';
import type { TramiteIndexado } from '../lib/tramites';

/**
 * Controlador del buscador con autocompletado.
 *
 * Implementa el patrón "Combobox con listbox" de la WAI-ARIA Authoring
 * Practices. Los cuatro puntos donde estos widgets suelen fallar y que aquí
 * están resueltos a propósito:
 *
 * 1. El foco NUNCA se mueve a la lista. Se queda en el input y se señala la
 *    opción activa con aria-activedescendant. Si el foco saltara a la lista,
 *    el usuario no podría seguir escribiendo para refinar la búsqueda.
 *
 * 2. Escape tiene dos niveles: la primera vez cierra la lista, la segunda
 *    limpia el campo. Es lo que espera quien usa teclado.
 *
 * 3. El conteo de resultados se anuncia en una región viva con `role="status"`
 *    (educado, no interrumpe). Sin eso, quien usa lector de pantalla escribe y
 *    no recibe ninguna señal de que aparecieron sugerencias.
 *
 * 4. Sin JavaScript el formulario sigue funcionando: es un <form> real que hace
 *    GET a /tramites/?q=..., y esa página filtra sobre el listado completo.
 */

interface Opciones {
  formulario: HTMLFormElement;
  campo: HTMLInputElement;
  lista: HTMLElement;
  estado: HTMLElement;
  indice: TramiteIndexado[];
  /** Página a la que se navega al elegir una opción. */
  ruta: (slug: string) => string;
}

const ID_OPCION = (i: number) => `dgpe-opcion-${i}`;

export function iniciarBuscador({
  formulario,
  campo,
  lista,
  estado,
  indice,
  ruta,
}: Opciones): void {
  let resultados: Resultado[] = [];
  let activo = -1;

  const abierta = () => campo.getAttribute('aria-expanded') === 'true';

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Construye la opción con nodos del DOM en vez de innerHTML.
   * Los títulos vienen de contenido nuestro, pero el fragmento resaltado se
   * arma con lo que el usuario escribió: montarlo como HTML sería una
   * inyección esperando a ocurrir.
   */
  function crearOpcion({ tramite, coincidencia }: Resultado, i: number): HTMLLIElement {
    const li = document.createElement('li');
    li.id = ID_OPCION(i);
    li.className = 'buscador__opcion';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.dataset.slug = tramite.slug;

    const titulo = document.createElement('span');
    titulo.className = 'buscador__opcion-titulo';

    if (coincidencia) {
      const [desde, hasta] = coincidencia;
      titulo.append(document.createTextNode(tramite.titulo.slice(0, desde)));

      const resaltado = document.createElement('mark');
      resaltado.textContent = tramite.titulo.slice(desde, hasta);
      titulo.append(resaltado);

      titulo.append(document.createTextNode(tramite.titulo.slice(hasta)));
    } else {
      titulo.textContent = tramite.titulo;
    }

    const meta = document.createElement('span');
    meta.className = 'buscador__opcion-meta';
    meta.textContent = tramite.categoriaEtiqueta;

    li.append(titulo, meta);
    return li;
  }

  function renderizar() {
    lista.textContent = '';

    if (resultados.length === 0) {
      cerrar();
      return;
    }

    for (const [i, resultado] of resultados.entries()) {
      lista.append(crearOpcion(resultado, i));
    }

    lista.hidden = false;
    campo.setAttribute('aria-expanded', 'true');
    marcarActivo(-1);
  }

  function cerrar() {
    lista.hidden = true;
    lista.textContent = '';
    campo.setAttribute('aria-expanded', 'false');
    campo.removeAttribute('aria-activedescendant');
    activo = -1;
  }

  /* ------------------------------------------------------------------ */
  /* Opción activa                                                       */
  /* ------------------------------------------------------------------ */

  function marcarActivo(indiceNuevo: number) {
    const opciones = Array.from(lista.children) as HTMLLIElement[];

    opciones.forEach((opcion, i) => {
      opcion.setAttribute('aria-selected', String(i === indiceNuevo));
    });

    activo = indiceNuevo;

    if (indiceNuevo < 0) {
      campo.removeAttribute('aria-activedescendant');
      return;
    }

    campo.setAttribute('aria-activedescendant', ID_OPCION(indiceNuevo));
    /* `nearest` en vez de `center`: no mueve la lista si la opción ya se ve. */
    opciones[indiceNuevo]?.scrollIntoView({ block: 'nearest' });
  }

  function mover(delta: number) {
    if (!abierta() || resultados.length === 0) return;

    const total = resultados.length;
    /* Ciclo circular: desde la última, hacia abajo vuelve a la primera. */
    const siguiente = activo < 0 && delta < 0 ? total - 1 : (activo + delta + total) % total;

    marcarActivo(siguiente);
  }

  function irA(indiceOpcion: number) {
    const resultado = resultados[indiceOpcion];
    if (resultado) window.location.href = ruta(resultado.tramite.slug);
  }

  /* ------------------------------------------------------------------ */
  /* Eventos                                                             */
  /* ------------------------------------------------------------------ */

  campo.addEventListener('input', () => {
    resultados = buscar(indice, campo.value);
    renderizar();

    /*
     * Solo se anuncia si hay algo escrito. Anunciar "ningún resultado" cuando
     * el campo está vacío sería ruido en cada borrado.
     */
    estado.textContent = campo.value.trim().length >= 2 ? textoConteo(resultados.length) : '';
  });

  campo.addEventListener('keydown', (evento) => {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        mover(1);
        break;

      case 'ArrowUp':
        evento.preventDefault();
        mover(-1);
        break;

      case 'Home':
        if (abierta()) {
          evento.preventDefault();
          marcarActivo(0);
        }
        break;

      case 'End':
        if (abierta()) {
          evento.preventDefault();
          marcarActivo(resultados.length - 1);
        }
        break;

      case 'Enter':
        /* Con una opción activa, Enter la abre; si no, deja que el <form>
           se envíe normalmente hacia el listado completo. */
        if (abierta() && activo >= 0) {
          evento.preventDefault();
          irA(activo);
        }
        break;

      case 'Escape':
        if (abierta()) {
          cerrar();
        } else if (campo.value !== '') {
          campo.value = '';
          estado.textContent = '';
        }
        break;

      case 'Tab':
        /* Salir del campo cierra la lista: dejarla abierta taparía el
           elemento al que el foco acaba de llegar. */
        cerrar();
        break;
    }
  });

  /* Clic en una opción. Delegado, porque las opciones se recrean en cada tecla. */
  lista.addEventListener('click', (evento) => {
    const opcion = (evento.target as HTMLElement).closest('[role="option"]');
    if (!opcion) return;

    const posicion = Array.from(lista.children).indexOf(opcion);
    if (posicion >= 0) irA(posicion);
  });

  /* Resalta al pasar el ratón, sin robarle el foco al campo. */
  lista.addEventListener('mousemove', (evento) => {
    const opcion = (evento.target as HTMLElement).closest('[role="option"]');
    if (!opcion) return;

    const posicion = Array.from(lista.children).indexOf(opcion);
    if (posicion >= 0 && posicion !== activo) marcarActivo(posicion);
  });

  /* Clic fuera del buscador: cerrar. */
  document.addEventListener('click', (evento) => {
    if (!formulario.contains(evento.target as Node)) cerrar();
  });

  /* Al volver el foco al campo con texto, se reabren las sugerencias. */
  campo.addEventListener('focus', () => {
    if (campo.value.trim().length >= 2 && !abierta()) {
      resultados = buscar(indice, campo.value);
      renderizar();
    }
  });

  /*
   * Con JS activo, enviar el formulario con una opción activa navega directo
   * al trámite en vez de ir al listado. Sin JS este handler no existe y el
   * <form> hace su GET normal.
   */
  formulario.addEventListener('submit', (evento) => {
    if (abierta() && activo >= 0) {
      evento.preventDefault();
      irA(activo);
    }
  });
}

/** Lee el índice serializado en un <script type="application/json">. */
export function leerIndice(id: string): TramiteIndexado[] {
  const nodo = document.getElementById(id);
  if (!nodo?.textContent) return [];

  try {
    return JSON.parse(nodo.textContent) as TramiteIndexado[];
  } catch {
    console.error('No se pudo leer el índice de trámites.');
    return [];
  }
}
