const progresivo = (function() {
  let estado = {};

  function iniciar(contenedorId, opts) {
    estado[contenedorId] = {
      seccionActual: 0,
      preguntas: opts.preguntas || {},
      total: document.getElementById(contenedorId).querySelectorAll('.seccion-contenido').length
    };

    const secciones = document.getElementById(contenedorId).querySelectorAll('.seccion-contenido');
    secciones.forEach((s, i) => {
      s.classList.add(i === 0 ? 'seccion-activa' : 'seccion-oculta');
      s.classList.remove(i === 0 ? 'seccion-oculta' : 'seccion-activa');
    });

    actualizarBarra(contenedorId);
  }

  function verificar(contenedorId, seccionIdx, preguntaIdx, valor) {
    const cfg = estado[contenedorId];
    if (!cfg) return;

    const preguntas = cfg.preguntas[seccionIdx];
    if (!preguntas || !preguntas[preguntaIdx]) return;

    const pregunta = preguntas[preguntaIdx];
    const div = document.getElementById(`${contenedorId}-chk-${seccionIdx}-${preguntaIdx}`);
    if (!div) return;

    const feedback = div.querySelector('.chk-fb');
    const correcta = valor === pregunta.correcta;

    div.classList.remove('chk-ok', 'chk-err');
    div.classList.add(correcta ? 'chk-ok' : 'chk-err');
    feedback.textContent = correcta
      ? '✅ ' + (pregunta.explicacion || '¡Correcto!')
      : '❌ Vuelve a leer e intenta de nuevo.';
    feedback.style.display = 'block';

    if (correcta) {
      div.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);

      const todasOk = preguntas.every((_, i) => {
        const d = document.getElementById(`${contenedorId}-chk-${seccionIdx}-${i}`);
        return d && d.classList.contains('chk-ok');
      });

      if (todasOk) {
        const btn = document.getElementById(`${contenedorId}-sig-${seccionIdx}`);
        if (btn) btn.classList.add('btn-visible');
      }
    }
  }

  function siguiente(contenedorId) {
    const cfg = estado[contenedorId];
    if (!cfg) return;

    const contenedor = document.getElementById(contenedorId);
    const secciones = contenedor.querySelectorAll('.seccion-contenido');

    if (cfg.seccionActual < secciones.length - 1) {
      secciones[cfg.seccionActual].classList.remove('seccion-activa');
      secciones[cfg.seccionActual].classList.add('seccion-completada');
      cfg.seccionActual++;
      secciones[cfg.seccionActual].classList.remove('seccion-oculta');
      secciones[cfg.seccionActual].classList.add('seccion-activa');
      actualizarBarra(contenedorId);
      contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function actualizarBarra(contenedorId) {
    const cfg = estado[contenedorId];
    if (!cfg) return;

    const pasos = document.querySelectorAll(`#${contenedorId} .paso`);
    pasos.forEach((p, i) => {
      p.classList.remove('paso-activo', 'paso-completado');
      if (i < cfg.seccionActual) p.classList.add('paso-completado');
      else if (i === cfg.seccionActual) p.classList.add('paso-activo');
    });

    const barraLlena = document.getElementById(`barra-${contenedorId}`);
    if (barraLlena) {
      const pct = Math.round(((cfg.seccionActual) / (cfg.total - 1)) * 100);
      barraLlena.style.width = pct + '%';
    }
  }

  return { iniciar, verificar, siguiente };
})();
