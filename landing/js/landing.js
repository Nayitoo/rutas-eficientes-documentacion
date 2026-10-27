/* Rutas Eficientes · landing.
   Un solo reloj: GSAP ticker mueve Lenis, ScrollTrigger y el vehículo de la escena.
   Sin JS o con movimiento reducido, la página queda completa y en su estado final. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  var D = window.RUTA_DEMO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- la escena se arma con la ruta real ---------- */
  var mapa = $('[data-ruta]');
  var svg = { fantasma: $('.ruta__fantasma'), carga: $('.ruta__carga'), sombra: $('.ruta__sombra'), optima: $('.ruta__optima'), vehiculo: $('.ruta__vehiculo') };
  if (D && mapa) {
    svg.fantasma.setAttribute('d', D.dCarga);
    svg.carga.setAttribute('d', D.dCarga);
    svg.sombra.setAttribute('d', D.dOptima);
    svg.optima.setAttribute('d', D.dOptima);
    var ol = $('.ruta__pines');
    D.paradas.forEach(function (p) {
      // anclado por la punta del pin con left/right + bottom (GSAP anima el transform del li)
      var li = document.createElement('li');
      li.style.bottom = (100 - p.y / 7.6) + '%';
      if (p.x > 700) { li.className = p.x > 800 ? 'is-left is-up' : 'is-left'; li.style.right = (100 - p.x / 10) + '%'; }
      else li.style.left = (p.x / 10) + '%';
      if (p.carga !== p.optimo) li.setAttribute('data-cambia', '');
      li.innerHTML = '<span class="pin"><span class="pin__num"><i>' + p.carga + '</i><i>' + p.optimo + '</i></span></span>' +
        '<span class="pin__label"><b>' + p.nombre + '</b><span>' + p.barrio + '</span></span>';
      ol.appendChild(li);
    });
  }

  /* ---------- 4 · índice: la captura se abre solo al hacer clic en la fila ---------- */
  // va antes del corte de GSAP: el visor funciona aunque no carguen las librerías
  (function visor() {
    var dlg = $('#visor'), lista = $('.indice__lista');
    if (!dlg || !lista) return;
    var img = $('.visor__img', dlg), titulo = $('#visor-titulo'), texto = $('.visor__texto', dlg);
    function abrir(fila) {
      img.src = fila.getAttribute('data-preview');
      img.alt = fila.getAttribute('data-alt') || '';
      titulo.textContent = $('.fila__nombre', fila).textContent;
      texto.textContent = $('.fila__texto', fila).textContent;
      if (lenis) lenis.stop();
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    }
    function cerrar() { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); if (lenis) lenis.start(); } }
    // toda la fila es clicable; el botón del título la hace accesible con teclado
    lista.addEventListener('click', function (e) { var f = e.target.closest('.fila'); if (f) abrir(f); });
    $('.visor__cerrar', dlg).addEventListener('click', cerrar);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) cerrar(); });   // clic en el fondo oscuro
    dlg.addEventListener('close', function () { if (lenis) lenis.start(); });
  })();

  if (!window.gsap || !window.ScrollTrigger) return;   // sin librerías: queda el estado final estático
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  var ease = { out: 'expo.out', inOut: 'expo.inOut', soft: 'power3.out' };

  /* ---------- scroll ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -70 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- marco: borde al bajar, se corre al bajar y vuelve al subir ---------- */
  var ultimo = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      html.classList.toggle('is-scrolled', y > 8);
      if (Math.abs(y - ultimo) < 4) return;
      html.classList.toggle('frame-away', y > 240 && y > ultimo && !html.classList.contains('menu-open'));
      ultimo = y;
    }
  });

  /* ---------- revelados declarativos ---------- */
  var intro = gsap.timeline({ paused: true });
  function revelados() {
    if (reduced) return;
    $$('[data-split]').forEach(function (el) {
      var isIntro = el.hasAttribute('data-intro');
      var delay = parseFloat(el.getAttribute('data-delay') || '0');
      var estado = { hecho: false, pedido: false, tween: null };
      if (!window.SplitText) { gsap.set(el, { visibility: 'visible' }); return; }
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
        onSplit: function (self) {
          gsap.set(el, { visibility: 'visible' });
          if (estado.hecho) return;
          estado.tween = gsap.from(self.lines, {
            yPercent: 112, duration: 1.2, stagger: 0.08, ease: ease.out, delay: delay,
            paused: isIntro && !estado.pedido,
            onComplete: function () { estado.hecho = true; },
            scrollTrigger: isIntro ? undefined : { trigger: el, start: 'top 88%', once: true }
          });
          return estado.tween;
        }
      });
      if (isIntro) intro.add(function () { estado.pedido = true; if (estado.tween) estado.tween.play(); }, 0);
    });
    $$('[data-reveal]').forEach(function (el) {
      var isIntro = el.hasAttribute('data-intro');
      var t = gsap.fromTo(el, { y: 40, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1.2, ease: ease.out, delay: parseFloat(el.getAttribute('data-delay') || '0'),
        paused: isIntro, scrollTrigger: isIntro ? undefined : { trigger: el, start: 'top 90%', once: true }
      });
      if (isIntro) intro.add(function () { t.play(); }, 0);
    });
  }

  /* ---------- 1 · escena: del orden de carga al orden óptimo ---------- */
  function escena() {
    if (!D || !mapa) return;
    var modo = $('[data-modo]');
    var fin = $$('.ruta__dato--fin');
    var km = $('[data-num="km"]');
    var nums = $$('.ruta__pines li[data-cambia] .pin__num i');
    var pinesCambian = $$('.ruta__pines li[data-cambia]');
    var lenC = svg.carga.getTotalLength(), lenO = svg.optima.getTotalLength();
    var setModo = function (optimo) {
      var txt = optimo ? 'Orden óptimo' : 'Orden de carga';
      if (modo.textContent !== txt) modo.textContent = txt;
    };

    if (reduced) { setModo(true); return; }   // estado final, ya pintado por CSS

    // estado inicial: la ruta como se cargó
    setModo(false);
    gsap.set(svg.carga, { opacity: 1, strokeDasharray: lenC, strokeDashoffset: 0 });
    gsap.set(svg.fantasma, { opacity: 0 });
    gsap.set([svg.sombra, svg.optima], { strokeDasharray: lenO, strokeDashoffset: lenO });
    gsap.set(fin, { autoAlpha: 0 });
    $$('.ruta__pines li[data-cambia] .pin__num').forEach(function (n) {
      gsap.set(n.children[0], { y: 0, yPercent: 0 });
      gsap.set(n.children[1], { y: 0, yPercent: 110 });
    });

    // entrada: los pines se asientan y se dibuja la línea en orden de carga
    intro.from('.ruta__mapa', { autoAlpha: 0, y: 30, duration: 1.2, ease: ease.out }, 0.15)
      .from('.ruta__pines li', { y: -26, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.45)
      .fromTo(svg.carga, { strokeDashoffset: lenC }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, 0.55)
      .from('.ruta__estado', { autoAlpha: 0, y: 12, duration: 0.8, ease: ease.out }, 0.9);

    var cuenta = { v: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(svg.carga, { strokeDashoffset: lenC, duration: 0.3, ease: 'power2.inOut' }, 0.1)
      .to(svg.fantasma, { opacity: 0.55, duration: 0.15 }, 0.28)
      .to(pinesCambian, { scale: 1.22, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 0.3)
      .to(nums.filter(function (_, i) { return i % 2 === 0; }), { yPercent: -110, duration: 0.14, ease: ease.inOut }, 0.32)
      .to(nums.filter(function (_, i) { return i % 2 === 1; }), { yPercent: 0, duration: 0.14, ease: ease.inOut }, 0.32)
      .to([svg.sombra, svg.optima], { strokeDashoffset: 0, duration: 0.42, ease: 'power1.inOut' }, 0.44)
      .to(fin, { autoAlpha: 1, duration: 0.08 }, 0.86)
      .to(cuenta, {
        v: parseFloat(D.distanciaKm.replace(',', '.')), duration: 0.12, ease: 'power2.out',
        onUpdate: function () { km.textContent = cuenta.v.toFixed(1).replace('.', ','); }
      }, 0.86)
      .set({}, {}, 1);

    var activa = false, progreso = 0, vh = $('.ruta__vehiculo');
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: tl,
      onUpdate: function (self) { progreso = self.progress; setModo(self.progress > 0.42); }
    });
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: function (s) { activa = s.isActive; } });

    // en reposo: el vehículo recorre la ruta vigente mientras la escena está a la vista.
    // Antes del reordenamiento va por la línea del orden de carga; después, por la óptima.
    // La estela marca el tramo que el vehículo acaba de recorrer.
    var estela = $('.ruta__estela'), COLA = 140;
    var recorrido = 0, enOptima = null, arrancado = false;
    intro.add(function () { arrancado = true; }, 2.1);
    gsap.ticker.add(function (t, dt) {
      if (!activa || !arrancado) return;
      var transicion = progreso > 0.12 && progreso < 0.86;   // mientras se reordena, el vehículo se aparta
      var optima = progreso >= 0.86;
      var camino = optima ? svg.optima : svg.carga, largo = optima ? lenO : lenC;
      if (optima !== enOptima) {
        enOptima = optima; recorrido = 0;
        estela.setAttribute('d', camino.getAttribute('d'));
        estela.style.strokeDasharray = COLA + ' ' + (largo + COLA);
        estela.style.stroke = optima ? '' : 'var(--ink)';
      }
      gsap.set([vh, estela], { opacity: transicion ? 0 : 1 });
      if (transicion) return;
      recorrido = (recorrido + (dt / 1000) * (largo / (optima ? 16 : 11))) % largo;
      estela.style.strokeDashoffset = String(COLA - recorrido);
      var p = camino.getPointAtLength(recorrido);
      vh.setAttribute('cx', p.x.toFixed(1));
      vh.setAttribute('cy', p.y.toFixed(1));
    });
  }

  /* ---------- 3 · capítulos con la captura de cada paso ---------- */
  function capitulos() {
    var pasos = $$('.paso'), imgs = $$('.pantalla img'), lista = $('.como__pasos');
    if (!pasos.length) return;
    var actual = 0;
    function activar(i) {
      pasos.forEach(function (p, k) { p.classList.toggle('is-on', k === i); p.classList.toggle('is-done', k < i); });
      if (i === actual || !imgs[i]) return;
      var prev = imgs[actual]; actual = i;
      imgs.forEach(function (im) { im.style.zIndex = 0; });
      prev.style.zIndex = 1; imgs[i].style.zIndex = 2;
      if (reduced) { imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); im.style.opacity = k === i ? 1 : 0; }); return; }
      gsap.set(prev, { opacity: 1 });
      gsap.fromTo(imgs[i], { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)', scale: 1.04 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1, ease: ease.out, overwrite: true,
          // con scroll rápido puede haber llegado otro paso: solo apaga las demás si este sigue vigente
          onComplete: function () { if (actual !== i) return; imgs.forEach(function (im, k) { if (k !== i) gsap.set(im, { opacity: 0 }); }); } });
    }
    pasos[0].classList.add('is-on');
    pasos.forEach(function (p, i) {
      ScrollTrigger.create({ trigger: p, start: 'top 62%', end: 'bottom 62%', onToggle: function (s) { if (s.isActive) activar(i); } });
    });
    ScrollTrigger.create({
      trigger: lista, start: 'top 62%', end: 'bottom 62%', scrub: reduced ? false : 0.4,
      onUpdate: function (s) { lista.style.setProperty('--prog', s.progress.toFixed(3)); }
    });
  }

  /* ---------- botones: el relleno entra desde el lado del puntero ---------- */
  function botones() {
    if (touch || reduced) return;
    $$('[data-fill]').forEach(function (btn) {
      var fill = btn.querySelector('.btn__fill'); if (!fill) return;
      var cerrado = true;
      var desde = function (e) { var r = btn.getBoundingClientRect(); return (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px'; };
      var abrir = function (at) {
        if (cerrado) gsap.set(fill, { clipPath: 'circle(0% at ' + at + ')' });
        cerrado = false;
        gsap.to(fill, { clipPath: 'circle(150% at ' + at + ')', duration: 0.6, ease: ease.soft, overwrite: true });
      };
      var cerrar = function (at) {
        gsap.to(fill, { clipPath: 'circle(0% at ' + at + ')', duration: 0.5, ease: ease.soft, overwrite: true, onComplete: function () { cerrado = true; } });
      };
      btn.addEventListener('pointerenter', function (e) { abrir(desde(e)); });
      btn.addEventListener('pointerleave', function (e) { cerrar(desde(e)); });
      btn.addEventListener('focus', function () { if (btn.matches(':focus-visible')) abrir('50% 50%'); });
      btn.addEventListener('blur', function () { cerrar('50% 50%'); });
    });
  }

  /* ---------- 6 · contadores (números reales) ---------- */
  function contadores() {
    if (reduced) return;
    $$('[data-count]').forEach(function (el) {
      var fin = parseInt(el.getAttribute('data-count'), 10);
      if (fin < 3) return;
      var o = { v: 0 };
      gsap.to(o, { v: fin, duration: 1.6, ease: ease.out, scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.textContent = Math.round(o.v); } });
    });
  }

  /* ---------- menú del teléfono ---------- */
  function menu() {
    var btn = $('.frame__menu'), panel = $('#menu');
    if (!btn || !panel) return;
    var links = $$('a', panel);
    function abrir() {
      panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Cerrar';
      html.classList.add('menu-open'); html.classList.remove('frame-away');
      if (lenis) lenis.stop();
      if (!reduced) {
        gsap.fromTo(panel, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: ease.inOut });
        gsap.fromTo(links, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.05, ease: ease.out, delay: 0.25 });
      }
      links[0].focus();
    }
    function cerrar(volver) {
      btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menú';
      html.classList.remove('menu-open');
      if (lenis) lenis.start();
      var listo = function () { panel.hidden = true; if (volver) btn.focus(); };
      if (reduced) listo(); else gsap.to(panel, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: ease.inOut, onComplete: listo });
    }
    btn.addEventListener('click', function () { panel.hidden ? abrir() : cerrar(true); });
    links.forEach(function (a) { a.addEventListener('click', function () { cerrar(false); }); });
    document.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); cerrar(true); return; }
      if (e.key !== 'Tab') return;
      var foco = [btn].concat(links), i = foco.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); foco[foco.length - 1].focus(); }
      else if (!e.shiftKey && i === foco.length - 1) { e.preventDefault(); foco[0].focus(); }
    });
  }

  /* ---------- arranque ---------- */
  function iniciar() {
    revelados();
    escena();
    capitulos();
    botones();
    contadores();
    menu();
    requestAnimationFrame(function () { ScrollTrigger.refresh(); intro.play(); });
  }
  var fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fuentes, new Promise(function (r) { setTimeout(r, 700); })]).then(iniciar);
})();
