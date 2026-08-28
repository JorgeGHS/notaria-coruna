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

  document.querySelectorAll('[data-open-wa]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(document.getElementById('modal-wa'));
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

  /* Botón "Copiar" del nombre de usuario de WhatsApp */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-copy'));
      if (!el) return;
      var texto = el.textContent.trim();
      var hecho = function () {
        var antes = btn.textContent;
        btn.textContent = 'Copiado';
        setTimeout(function () { btn.textContent = antes; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(hecho, function () {});
      } else {
        var tmp = document.createElement('textarea');
        tmp.value = texto; document.body.appendChild(tmp); tmp.select();
        try { document.execCommand('copy'); hecho(); } catch (err) {}
        document.body.removeChild(tmp);
      }
    });
  });

  /* Permite abrir el formulario desde cualquier enlace: index.html#cita */
  if (window.location.hash === '#cita') openModal(document.getElementById('modal-cita'));

  /* -------------------------------------------------------- Formularios */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.querySelector('.honey input') && form.querySelector('.honey input').value) return;

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
