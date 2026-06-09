/* ============================================================
   sopa.js — Motor de Sopa de Letras Interactiva
   Colegio San Luis · Grado Sexto
   ============================================================
   Función principal:
     crearSopa(contenedorId, palabras, tamanoGrilla, nombresVisibles)
   
   - contenedorId: ID del div donde se renderiza la sopa
   - palabras: array de strings (sin espacios) con las palabras a buscar en la grilla
   - tamanoGrilla: número (ej: 12 para grilla 12×12)
   - nombresVisibles: (opcional) array con cómo mostrar cada palabra en la lista.
                      Si no se provee, se usa el array 'palabras' tal cual.
   ============================================================ */

function crearSopa(contenedorId, palabras, tamanoGrilla, nombresVisibles) {
  // --- Referencia al contenedor ---
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) {
    console.error('Error: No se encontró el contenedor con ID "' + contenedorId + '"');
    return;
  }

  // --- Limpiar contenedor ---
  contenedor.innerHTML = '';

  // --- Normalizar palabras (mayúsculas, sin tildes) ---
  const palabrasNormalizadas = palabras.map(p => normalizar(p));

  // --- Nombres para mostrar (si no se proveen, usar las palabras originales) ---
  const palabrasMostrar = nombresVisibles ? nombresVisibles : palabras.slice();

  // --- Estado interno ---
  const estado = {
    grilla: [],              // matriz con las letras
    solucion: [],            // matriz con índices de palabra o -1
    tamano: tamanoGrilla,
    palabras: palabrasNormalizadas,
    palabrasOriginales: palabrasMostrar,  // lo que se muestra al alumno
    encontradas: new Array(palabras.length).fill(false),
    seleccion: [],           // celdas seleccionadas actualmente [{f, c}]
    seleccionando: false,    // si el usuario está seleccionando
    resuelto: false          // si se mostró la solución
  };

  // --- 1. Generar la grilla con las palabras colocadas ---
  function generarGrilla() {
    // Inicializar grilla vacía
    const grilla = [];
    const solucion = [];
    for (let f = 0; f < estado.tamano; f++) {
      grilla[f] = [];
      solucion[f] = [];
      for (let c = 0; c < estado.tamano; c++) {
        grilla[f][c] = '';
        solucion[f][c] = -1;
      }
    }

    // Direcciones: horizontal, vertical, diagonal (8 direcciones)
    const direcciones = [
      { df: 0, dc: 1 },   // derecha
      { df: 1, dc: 0 },   // abajo
      { df: 1, dc: 1 },   // diagonal abajo-derecha
      { df: 1, dc: -1 },  // diagonal abajo-izquierda
      { df: -1, dc: 0 },  // arriba
      { df: 0, dc: -1 },  // izquierda
      { df: -1, dc: -1 }, // diagonal arriba-izquierda
      { df: -1, dc: 1 }   // diagonal arriba-derecha
    ];

    // Colocar cada palabra
    for (let p = 0; p < estado.palabras.length; p++) {
      const palabra = estado.palabras[p];
      let colocada = false;
      let intentos = 0;
      const maxIntentos = 500;

      while (!colocada && intentos < maxIntentos) {
        intentos++;
        const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
        const filaInicio = Math.floor(Math.random() * estado.tamano);
        const colInicio = Math.floor(Math.random() * estado.tamano);
        let puedeColocar = true;

        // Verificar que la palabra cabe en la dirección
        const filaFin = filaInicio + dir.df * (palabra.length - 1);
        const colFin = colInicio + dir.dc * (palabra.length - 1);

        if (filaFin < 0 || filaFin >= estado.tamano ||
            colFin < 0 || colFin >= estado.tamano) {
          puedeColocar = false;
        }

        // Verificar que las celdas estén libres o tengan la misma letra
        if (puedeColocar) {
          for (let i = 0; i < palabra.length; i++) {
            const f = filaInicio + dir.df * i;
            const c = colInicio + dir.dc * i;
            if (grilla[f][c] !== '' && grilla[f][c] !== palabra[i]) {
              puedeColocar = false;
              break;
            }
          }
        }

        // Colocar la palabra
        if (puedeColocar) {
          for (let i = 0; i < palabra.length; i++) {
            const f = filaInicio + dir.df * i;
            const c = colInicio + dir.dc * i;
            grilla[f][c] = palabra[i];
            solucion[f][c] = p;
          }
          colocada = true;
        }
      }

      if (!colocada) {
        console.warn('No se pudo colocar la palabra: "' + estado.palabrasOriginales[p] + '"');
      }
    }

    // Rellenar celdas vacías con letras aleatorias
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let f = 0; f < estado.tamano; f++) {
      for (let c = 0; c < estado.tamano; c++) {
        if (grilla[f][c] === '') {
          grilla[f][c] = letras[Math.floor(Math.random() * letras.length)];
        }
      }
    }

    estado.grilla = grilla;
    estado.solucion = solucion;
  }

  // --- 2. Normalizar texto (mayúsculas, sin tildes, sin ñ) ---
  function normalizar(texto) {
    return texto
      .toUpperCase()
      .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
      .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ü/g, 'U')
      .replace(/Ñ/g, 'N')
      .replace(/[^A-Z]/g, '');
  }

  // --- 3. Renderizar la sopa ---
  function renderizar() {
    const grilla = estado.grilla;
    const tamano = estado.tamano;

    // Crear estructura del HTML
    contenedor.innerHTML = `
      <div class="contador-palabras">
        <span id="contador-${contenedorId}">0/${estado.palabras.length}</span>
      </div>
      <div class="sopa-container">
        <div id="grilla-${contenedorId}" class="sopa-grilla" style="grid-template-columns: repeat(${tamano}, auto);"></div>
        <div class="sopa-palabras">
          <h3>📝 Palabras a encontrar</h3>
          <ul id="lista-${contenedorId}"></ul>
        </div>
      </div>
      <div class="sopa-botones">
        <button class="btn btn-exito" id="validar-${contenedorId}">✅ Validar palabra</button>
        <button class="btn btn-secundario" id="solucionar-${contenedorId}">🔍 Solucionar</button>
        <button class="btn btn-peligro" id="reiniciar-${contenedorId}">🔄 Reiniciar</button>
      </div>
    `;

    const grillaDiv = document.getElementById('grilla-' + contenedorId);
    const listaUl = document.getElementById('lista-' + contenedorId);

    // Renderizar grilla
    for (let f = 0; f < tamano; f++) {
      for (let c = 0; c < tamano; c++) {
        const celda = document.createElement('div');
        celda.className = 'sopa-celda';
        celda.dataset.fila = f;
        celda.dataset.col = c;
        celda.dataset.indice = f * tamano + c;
        celda.textContent = grilla[f][c];
        grillaDiv.appendChild(celda);
      }
    }

    // Renderizar lista de palabras
    for (let i = 0; i < estado.palabrasOriginales.length; i++) {
      const li = document.createElement('li');
      li.id = 'palabra-' + contenedorId + '-' + i;
      li.textContent = estado.palabrasOriginales[i];
      listaUl.appendChild(li);
    }

    // Conectar eventos
    conectarEventos();
    actualizarContador();
  }

  // --- 4. Eventos de interacción ---
  function conectarEventos() {
    const grillaDiv = document.getElementById('grilla-' + contenedorId);
    const celdas = grillaDiv.querySelectorAll('.sopa-celda');

    // --- Eventos de mouse ---
    celdas.forEach(celda => {
      // Iniciar selección
      celda.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const f = parseInt(this.dataset.fila);
        const c = parseInt(this.dataset.col);
        iniciarSeleccion(f, c);
      });

      // Extender selección al arrastrar
      celda.addEventListener('mouseenter', function() {
        if (estado.seleccionando) {
          const f = parseInt(this.dataset.fila);
          const c = parseInt(this.dataset.col);
          extenderSeleccion(f, c);
        }
      });
    });

    // Terminar selección al soltar el mouse
    document.addEventListener('mouseup', function() {
      if (estado.seleccionando) {
        estado.seleccionando = false;
        validarSeleccion();
      }
    });

    // --- Eventos táctiles (móviles) ---
    let toqueActivo = null;
    celdas.forEach(celda => {
      celda.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        toqueActivo = touch.identifier;
        const f = parseInt(this.dataset.fila);
        const c = parseInt(this.dataset.col);
        iniciarSeleccion(f, c);
      }, { passive: false });

      celda.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = buscarToque(e.changedTouches);
        if (!touch) return;
        // Encontrar la celda bajo el dedo
        const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elemento && elemento.classList.contains('sopa-celda')) {
          const f = parseInt(elemento.dataset.fila);
          const c = parseInt(elemento.dataset.col);
          extenderSeleccion(f, c);
        }
      }, { passive: false });

      celda.addEventListener('touchend', function(e) {
        const touch = buscarToque(e.changedTouches);
        if (touch && touch.identifier === toqueActivo) {
          toqueActivo = null;
          estado.seleccionando = false;
          validarSeleccion();
        }
      });
    });

    // Botón validar
    document.getElementById('validar-' + contenedorId).addEventListener('click', function() {
      validarSeleccion();
    });

    // Botón solucionar
    document.getElementById('solucionar-' + contenedorId).addEventListener('click', function() {
      mostrarSolucion();
    });

    // Botón reiniciar
    document.getElementById('reiniciar-' + contenedorId).addEventListener('click', function() {
      reiniciar();
    });
  }

  function buscarToque(listaToques) {
    for (let i = 0; i < listaToques.length; i++) {
      return listaToques[i];
    }
    return null;
  }

  // --- 5. Lógica de selección ---
  function obtenerCelda(f, c) {
    return document.querySelector(
      `#grilla-${contenedorId} .sopa-celda[data-fila="${f}"][data-col="${c}"]`
    );
  }

  function limpiarSeleccion() {
    document.querySelectorAll(`#grilla-${contenedorId} .sopa-celda.seleccionada`).forEach(celda => {
      celda.classList.remove('seleccionada');
    });
    estado.seleccion = [];
  }

  function iniciarSeleccion(f, c) {
    // No seleccionar si ya está encontrada
    const celda = obtenerCelda(f, c);
    if (celda && celda.classList.contains('encontrada')) return;
    if (estado.resuelto) return;

    limpiarSeleccion();
    estado.seleccionando = true;
    estado.seleccion = [{ f, c }];
    if (celda) celda.classList.add('seleccionada');
  }

  function extenderSeleccion(f, c) {
    if (!estado.seleccionando || estado.seleccion.length === 0) return;

    const ultima = estado.seleccion[estado.seleccion.length - 1];
    const primera = estado.seleccion[0];

    // La celda debe ser adyacente a la última (horizontal, vertical o diagonal)
    const df = Math.abs(f - ultima.f);
    const dc = Math.abs(c - ultima.c);

    if ((df === 0 && dc === 1) || (df === 1 && dc === 0) || (df === 1 && dc === 1)) {
      // La celda no debe estar ya seleccionada
      const yaSeleccionada = estado.seleccion.some(s => s.f === f && s.c === c);
      if (!yaSeleccionada) {
        const celda = obtenerCelda(f, c);
        if (celda && celda.classList.contains('encontrada')) return;
        if (celda) celda.classList.add('seleccionada');
        estado.seleccion.push({ f, c });
      }
    }
  }

  function obtenerPalabraSeleccionada() {
    return estado.seleccion.map(s => estado.grilla[s.f][s.c]).join('');
  }

  // --- 6. Validar selección ---
  function validarSeleccion() {
    if (estado.seleccion.length === 0) return;
    if (estado.resuelto) {
      limpiarSeleccion();
      return;
    }

    const palabraFormada = obtenerPalabraSeleccionada();

    // Buscar si la palabra está en la lista
    let indiceEncontrado = -1;
    for (let i = 0; i < estado.palabras.length; i++) {
      if (!estado.encontradas[i] && estado.palabras[i] === palabraFormada) {
        indiceEncontrado = i;
        break;
      }
    }

    if (indiceEncontrado !== -1) {
      // ¡Palabra encontrada!
      estado.encontradas[indiceEncontrado] = true;

      // Marcar celdas como encontradas
      estado.seleccion.forEach(s => {
        const celda = obtenerCelda(s.f, s.c);
        if (celda) {
          celda.classList.remove('seleccionada');
          celda.classList.add('encontrada');
        }
      });

      // Marcar en la lista
      const li = document.getElementById('palabra-' + contenedorId + '-' + indiceEncontrado);
      if (li) li.classList.add('encontrada');

      actualizarContador();
      limpiarSeleccion();
    } else {
      // Palabra incorrecta: animar y limpiar
      estado.seleccion.forEach(s => {
        const celda = obtenerCelda(s.f, s.c);
        if (celda) {
          celda.style.background = '#ffcdd2';
          setTimeout(() => {
            celda.style.background = '';
            celda.classList.remove('seleccionada');
          }, 300);
        }
      });
      estado.seleccion = [];
    }
  }

  // --- 7. Actualizar contador ---
  function actualizarContador() {
    const count = estado.encontradas.filter(e => e).length;
    const total = estado.encontradas.length;
    const contador = document.getElementById('contador-' + contenedorId);
    if (contador) {
      contador.textContent = count + '/' + total;
    }

    // Verificar si completó todas
    if (count === total && total > 0) {
      setTimeout(() => {
        alert('🎉 ¡Felicidades! Has encontrado todas las palabras.');
      }, 200);
    }
  }

  // --- 8. Mostrar solución ---
  function mostrarSolucion() {
    estado.resuelto = true;

    for (let f = 0; f < estado.tamano; f++) {
      for (let c = 0; c < estado.tamano; c++) {
        const celda = obtenerCelda(f, c);
        if (!celda) continue;

        const idxPalabra = estado.solucion[f][c];
        if (idxPalabra !== -1) {
          if (estado.encontradas[idxPalabra]) {
            celda.classList.add('encontrada', 'solucion');
          } else {
            celda.classList.add('solucion');
            celda.classList.remove('seleccionada');
          }
        }
      }
    }

    // Marcar palabras no encontradas en la lista
    for (let i = 0; i < estado.palabras.length; i++) {
      const li = document.getElementById('palabra-' + contenedorId + '-' + i);
      if (li && !estado.encontradas[i]) {
        li.classList.add('no-encontrada');
      }
    }

    // Deshabilitar botón validar
    const btnValidar = document.getElementById('validar-' + contenedorId);
    if (btnValidar) btnValidar.disabled = true;
  }

  // --- 9. Reiniciar ---
  function reiniciar() {
    estado.encontradas = new Array(estado.palabras.length).fill(false);
    estado.seleccion = [];
    estado.seleccionando = false;
    estado.resuelto = false;

    // Regenerar grilla
    generarGrilla();

    // Limpiar clases de las celdas
    const celdas = document.querySelectorAll(`#grilla-${contenedorId} .sopa-celda`);
    celdas.forEach((celda, idx) => {
      const f = Math.floor(idx / estado.tamano);
      const c = idx % estado.tamano;
      celda.textContent = estado.grilla[f][c];
      celda.className = 'sopa-celda';
    });

    // Limpiar lista de palabras
    for (let i = 0; i < estado.palabras.length; i++) {
      const li = document.getElementById('palabra-' + contenedorId + '-' + i);
      if (li) li.className = '';
    }

    // Habilitar botón validar
    const btnValidar = document.getElementById('validar-' + contenedorId);
    if (btnValidar) btnValidar.disabled = false;

    actualizarContador();
  }

  // --- Inicializar ---
  generarGrilla();
  renderizar();
}
