/* Oncobrújula — interacciones
   Movimiento según Emil Kowalski: ease-out, menos de 300 ms en la interfaz,
   y nada de animación si la persona pidió reducir movimiento. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
  document.documentElement.classList.add('js');

  function track(path, title) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: path, title: title, event: true });
      }
    } catch (e) {}
  }

  /* ---- Menú del celular ---- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  /* ---- Preguntas frecuentes: abre y cierra con la altura animada ---- */
  document.querySelectorAll('.accordion__trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (reduce || !panel.animate) { panel.hidden = open; return; }
      if (panel._anim) panel._anim.cancel();
      if (open) {
        var h = panel.offsetHeight;
        panel._anim = panel.animate(
          [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 200, easing: EASE }
        );
        panel._anim.onfinish = function () { panel.hidden = true; };
      } else {
        panel.hidden = false;
        var target = panel.offsetHeight;
        panel._anim = panel.animate(
          [{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
          { duration: 240, easing: EASE }
        );
      }
    });
  });

  /* ---- La brújula: ¿en qué momento del camino estás? ---- */
  var root = document.querySelector('[data-moment-root]');
  if (root) {
    var needle = root.querySelector('.moment__needle');
    var hint = root.querySelector('.moment__hint');
    var opts = root.querySelectorAll('.moment__opt');
    var angle = 0; // se acumula para que la aguja siempre gire por el camino corto

    function choose(btn, focusPanel) {
      var key = btn.getAttribute('data-moment');
      var target = parseFloat(btn.getAttribute('data-angle')) || 0;
      var delta = ((target - angle) % 360 + 540) % 360 - 180;
      angle += delta;
      if (needle) needle.style.transform = 'rotate(' + angle + 'deg)';

      opts.forEach(function (o) { o.setAttribute('aria-pressed', String(o === btn)); });
      if (hint) hint.hidden = true;
      root.querySelectorAll('.moment__panel').forEach(function (p) {
        var show = p.id === 'panel-' + key;
        p.hidden = !show;
        if (show) {
          p.classList.remove('is-in');
          void p.offsetWidth; // reinicia la entrada
          p.classList.add('is-in');
          if (focusPanel && window.innerWidth < 860) {
            p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
          }
        }
      });
      track('brujula-' + key, btn.textContent.trim());
    }

    opts.forEach(function (btn) {
      btn.addEventListener('click', function () { choose(btn, true); });
    });
  }

  /* ---- "Saliste de la consulta…": las líneas aparecen una vez al llegar ---- */
  var pain = document.querySelector('.pain');
  if (pain && !reduce && 'IntersectionObserver' in window) {
    pain.classList.add('will-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { pain.classList.add('is-revealed'); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(pain);
  }
})();
