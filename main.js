/* =============================================================
   Notaría Pedro García de los Huertos Sánchez
   Script único. Sin dependencias.
   ============================================================= */
(function () {
  'use strict';

  /* --- CONFIGURACIÓN --------------------------------------------------
     Sustituye la clave por la tuya de Web3Forms (https://web3forms.com,
     gratis: pones tu email y te dan la clave por correo en 1 minuto).
     Mientras ponga TU_ACCESS_KEY_AQUI, el formulario avisará en pantalla
     de que aún no está conectado en lugar de fallar en silencio.
  -------------------------------------------------------------------- */
  var WEB3FORMS_KEY = 'TU_ACCESS_KEY_AQUI';
  var ENDPOINT = 'https://api.web3forms.com/submit';

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
  var modal = document.getElementById('modal-cita');
  var lastFocused = null;

  function openModal() {
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
    btn.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  /* Permite abrir el formulario desde cualquier enlace: index.html#cita */
  if (window.location.hash === '#cita') openModal();

  /* -------------------------------------------------------- Formularios */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.querySelector('.honey input') && form.querySelector('.honey input').value) return;

      if (WEB3FORMS_KEY === 'TU_ACCESS_KEY_AQUI') {
        setStatus(status, 'error',
          'El formulario todavía no está conectado. Añade tu clave de Web3Forms en assets/js/main.js.');
        return;
      }

      var data = Object.fromEntries(new FormData(form).entries());
      data.access_key = WEB3FORMS_KEY;
      data.subject = form.getAttribute('data-subject') || 'Nuevo mensaje desde la web';
      data.from_name = 'Web Notaría';

      setStatus(status, 'sending', 'Enviando…');
      if (submit) submit.disabled = true;

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (result.success) {
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
