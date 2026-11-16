/* =============================================================
   Notaría Pedro García de los Huertos Sánchez
   Script único. Sin dependencias.
   ============================================================= */
(function () {
  'use strict';

  /* =====================================================================
     CONFIGURACIÓN DEL FORMULARIO
     ---------------------------------------------------------------------
     Elige un proveedor y pega su dato. Sólo hay que tocar estas líneas.

     PROVEEDOR = 'web3forms'  -> pon tu access key en CLAVE
                                 (web3forms.com, gratis, 250 envíos/mes)
     PROVEEDOR = 'formspree'  -> pon tu ID de formulario en CLAVE
                                 (el de https://formspree.io/f/XXXXXXX)
     PROVEEDOR = 'forminit'   -> pon la URL completa del endpoint en CLAVE

     Mientras CLAVE siga como está, el formulario avisa en pantalla en vez
     de fallar en silencio.
     ===================================================================== */
  var PROVEEDOR = 'web3forms';
  var CLAVE = '1425008d-e092-4f19-81cd-2999d3cb1a70';

  function endpoint() {
    if (PROVEEDOR === 'formspree') return 'https://formspree.io/f/' + CLAVE;
    if (PROVEEDOR === 'forminit') return CLAVE;
    return 'https://api.web3forms.com/submit';
  }

  /* ------------------------------------------------- Menú de navegación */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu-principal');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  /* ------------------------------------------------------------- Modal */
  var modal = null;              // modal actualmente abierto
  var lastFocused = null;

  function openModal(el) {
    modal = el || document.getElementById('modal-cita');
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var first = modal.querySelector('input, textarea, button');
    if (first) first.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab' || !modal) return;

    var focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(document.getElementById('modal-cita'));
      /* Si el botón pertenece a un servicio, preselecciona ese trámite */
      var t = btn.getAttribute('data-tramite');
      var sel = document.getElementById('cita-tramite');
      if (t && sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.toLowerCase() === t.toLowerCase()) { sel.selectedIndex = i; break; }
        }
        sel.dispatchEvent(new Event('change'));
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  /* El campo Banco sólo aparece si el trámite es hipotecario */
  var selTramite = document.getElementById('cita-tramite');
  if (selTramite) {
    selTramite.addEventListener('change', function () {
      var campo = document.getElementById('campo-banco');
      if (campo) campo.hidden = selTramite.value.indexOf('ipoteca') === -1;
    });
  }

  /* Permite abrir el formulario desde cualquier enlace: index.html#cita */
  if (window.location.hash === '#cita') openModal(document.getElementById('modal-cita'));

  /* -------------------------------------------------------- Formularios */
  /* =====================================================================
     VALIDACIÓN
     Los campos ya llevan "required" en el HTML, pero hay que comprobarlo
     antes de enviar: si no, se mandan formularios vacíos.
     ===================================================================== */
  function soloDigitos(v) { return (v || '').replace(/\D/g, ''); }

  function revisaCampo(el) {
    if (!el || el.name === 'botcheck' || el.type === 'checkbox' || el.type === 'hidden') return;
    el.setCustomValidity('');
    var v = (el.value || '').trim();
    if (!v) return;                     /* de los vacíos ya se ocupa "required" */
    if (el.type === 'tel') {
      if (soloDigitos(v).length < 9) el.setCustomValidity('Escriba un teléfono con al menos 9 cifras.');
    } else if (el.tagName === 'TEXTAREA' && el.required) {
      if (v.length < 10) el.setCustomValidity('Cuéntenos un poco más para poder ayudarle.');
    } else if (el.type === 'text' && el.required) {
      if (v.length < 2 || !/[a-záéíóúüñ]/i.test(v)) el.setCustomValidity('Revise este dato.');
    }
  }

  function esValido(form) {
    var campos = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < campos.length; i++) {
      var el = campos[i];
      if (el.name !== 'botcheck' && el.type !== 'checkbox' && typeof el.value === 'string') {
        el.value = el.value.trim();     /* un espacio no cuenta como respuesta */
      }
      revisaCampo(el);
    }
    if (form.checkValidity()) return true;
    var fallo = form.querySelector(':invalid');
    if (fallo) { try { fallo.focus(); } catch (err) {} }
    form.reportValidity();              /* el navegador señala el campo */
    return false;
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('input', function (e) { e.target.setCustomValidity(''); });
    form.addEventListener('change', function (e) { e.target.setCustomValidity(''); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Campo trampa: si viene relleno es un bot. Le damos por bueno sin enviar. */
      var trampa = form.querySelector('.honey input');
      if (trampa && trampa.value) {
        setStatus(status, 'ok', 'Hemos recibido tu mensaje.');
        return;
      }

      if (!esValido(form)) {
        setStatus(status, 'error', 'Faltan datos. Revise los campos señalados y vuelva a enviarlo.');
        return;
      }

      if (CLAVE === 'PEGA_AQUI_TU_CLAVE') {
        setStatus(status, 'error',
          'El formulario todavía no está conectado. Añade la clave del proveedor en main.js.');
        return;
      }

      var data = Object.fromEntries(new FormData(form).entries());
      data.subject = form.getAttribute('data-subject') || 'Nuevo mensaje desde la web';
      if (PROVEEDOR === 'web3forms') {
        data.access_key = CLAVE;
        data.from_name = 'Web Notaría';
      }

      setStatus(status, 'sending', 'Enviando…');
      if (submit) submit.disabled = true;

      fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          /* Web3Forms responde {success:true}; Formspree y Forminit devuelven
             {ok:true} o el objeto enviado sin campo de error. */
          if (result.success || result.ok || (!result.error && !result.errors)) {
            form.reset();
            setStatus(status, 'ok',
              'Hemos recibido tu solicitud. Te llamaremos para confirmar día y hora.');
          } else {
            setStatus(status, 'error',
              'No se ha podido enviar. Escríbenos a ' + contactoEmail() + ' o llámanos.');
          }
        })
        .catch(function () {
          setStatus(status, 'error',
            'No se ha podido enviar. Escríbenos a ' + contactoEmail() + ' o llámanos.');
        })
        .finally(function () { if (submit) submit.disabled = false; });
    });
  });

  function setStatus(el, state, message) {
    if (!el) return;
    el.setAttribute('data-state', state);
    el.textContent = message;
  }

  function contactoEmail() {
    var link = document.querySelector('a[href^="mailto:"]');
    return link ? link.textContent.trim() : 'la notaría';
  }

  /* ------------------------------------- Mapa: sólo se carga si se pide */
  var mapBtn = document.querySelector('[data-load-map]');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var frame = document.getElementById('mapa');
      var consent = frame.querySelector('.map-consent');
      var iframe = document.createElement('iframe');
      iframe.src = frame.getAttribute('data-src');
      iframe.title = 'Mapa con la ubicación de la notaría en Linares Rivas 26, A Coruña';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      if (consent) consent.remove();
      frame.appendChild(iframe);
    });
  }

  /* -------------------- Abre el desplegable al llegar con ancla (#hash) */
  function openFromHash() {
    if (!window.location.hash) return;
    var target = document.querySelector(window.location.hash);
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
      target.scrollIntoView({ block: 'start' });
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* --------------------------------------------------- Año en el pie */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
