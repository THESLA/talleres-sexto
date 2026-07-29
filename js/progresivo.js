document.addEventListener('copy', function(e) {
  if (e.target.closest('.paso-contenido-lectura')) e.preventDefault();
});
document.addEventListener('cut', function(e) {
  if (e.target.closest('.paso-contenido-lectura')) e.preventDefault();
});
document.addEventListener('contextmenu', function(e) {
  if (e.target.closest('.paso-contenido-lectura')) e.preventDefault();
});

const progresivo = (function() {
  const estados = {};

  function barajarOpciones(contenedor) {
    contenedor.querySelectorAll('.paso-opciones').forEach(function(grupo) {
      var labels = Array.from(grupo.children);
      labels.sort(function() { return Math.random() - 0.5; });
      labels.forEach(function(l) { grupo.appendChild(l); });
      var letras = ['A', 'B', 'C', 'D'];
      grupo.querySelectorAll('label').forEach(function(label, i) {
        label.childNodes.forEach(function(n) {
          if (n.nodeType === 3) {
            n.textContent = n.textContent.replace(/ [A-D](\.)/, ' ' + letras[i] + '$1');
          }
        });
      });
    });
  }

  function iniciar(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    const pasos = contenedor.querySelectorAll('.paso-pagina');
    estados[contenedorId] = { pasoActual: 0 };
    pasos.forEach((p, i) => { p.style.display = i === 0 ? 'block' : 'none'; });
    if (pasos.length > 0) {
      pasos[0].classList.add('paso-activo');
      barajarOpciones(pasos[0]);
    }
  }

  function irSiguiente(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    const pasos = contenedor.querySelectorAll('.paso-pagina');
    const e = estados[contenedorId];
    if (!e) return;
    if (e.pasoActual < pasos.length - 1) {
      pasos[e.pasoActual].classList.remove('paso-activo');
      pasos[e.pasoActual].style.display = 'none';
      e.pasoActual++;
      pasos[e.pasoActual].style.display = 'block';
      pasos[e.pasoActual].classList.add('paso-activo');
      // Limpiar feedback y radios en la página nueva
      const feedback = pasos[e.pasoActual].querySelector('.paso-feedback');
      if (feedback) { feedback.style.display = 'none'; feedback.textContent = ''; }
      pasos[e.pasoActual].querySelectorAll('.paso-pregunta').forEach(el => el.classList.remove('paso-correcta', 'paso-incorrecta'));
      const radios = pasos[e.pasoActual].querySelectorAll('input[type="radio"]');
      radios.forEach(function(r) { r.checked = false; r.disabled = false; });
      barajarOpciones(pasos[e.pasoActual]);
      contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function irAtras(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    const pasos = contenedor.querySelectorAll('.paso-pagina');
    const e = estados[contenedorId];
    if (!e) return;
    if (e.pasoActual > 0) {
      pasos[e.pasoActual].classList.remove('paso-activo');
      pasos[e.pasoActual].style.display = 'none';
      e.pasoActual--;
      pasos[e.pasoActual].style.display = 'block';
      pasos[e.pasoActual].classList.add('paso-activo');
      // Limpiar estado de la pregunta a la que se retrocede
      const feedback = pasos[e.pasoActual].querySelector('.paso-feedback');
      if (feedback) { feedback.style.display = 'none'; feedback.textContent = ''; }
      pasos[e.pasoActual].querySelectorAll('.paso-pregunta').forEach(el => el.classList.remove('paso-correcta', 'paso-incorrecta'));
      const radios = pasos[e.pasoActual].querySelectorAll('input[type="radio"]');
      radios.forEach(r => { r.checked = false; r.disabled = false; });
      barajarOpciones(pasos[e.pasoActual]);
      contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function responder(contenedorId, pasoIdx, valor, correcta, explicacion) {
    const contenedor = document.getElementById(contenedorId);
    const pasoDiv = contenedor.querySelector(`.paso-pagina[data-paso="${pasoIdx}"]`);
    if (!pasoDiv) return;

    const feedback = pasoDiv.querySelector('.paso-feedback');
    const esCorrecta = valor === correcta;

    pasoDiv.querySelectorAll('.paso-pregunta').forEach(el => el.classList.remove('paso-correcta', 'paso-incorrecta'));

    if (esCorrecta) {
      pasoDiv.querySelectorAll('.paso-pregunta').forEach(el => el.classList.add('paso-correcta'));
      feedback.textContent = '✅ ' + explicacion;
      feedback.style.display = 'block';
      const btnSiguiente = pasoDiv.querySelector('.btn-siguiente');
      if (btnSiguiente) btnSiguiente.style.display = 'inline-flex';
      const btnReintentar = pasoDiv.querySelector('.btn-reintentar');
      if (btnReintentar) btnReintentar.style.display = 'none';
      const radios = pasoDiv.querySelectorAll('input[type="radio"]');
      radios.forEach(r => r.disabled = true);
    } else {
      pasoDiv.querySelectorAll('.paso-pregunta').forEach(el => el.classList.add('paso-incorrecta'));
      feedback.textContent = '❌ Incorrecto. Debes volver a leer el texto anterior.';
      feedback.style.display = 'block';
      const btnReintentar = pasoDiv.querySelector('.btn-reintentar');
      if (btnReintentar) btnReintentar.style.display = 'none';
      const radios = pasoDiv.querySelectorAll('input[type="radio"]');
      radios.forEach(r => r.disabled = true);
      setTimeout(function() { irAtras(contenedorId); }, 2000);
    }
  }

  return { iniciar, irSiguiente, irAtras, responder };
})();
