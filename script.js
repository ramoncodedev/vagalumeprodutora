(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  $('#year').textContent = new Date().getFullYear();

  const header = $('#header');

  /* ---------- Fallback: sem GSAP ou movimento reduzido ---------- */
  if (!hasGsap || reduce) {
    document.documentElement.classList.remove('js');
    initMenu();
    $$('.film').forEach(b => b.addEventListener('click', () => window.open(b.dataset.film, '_blank')));
    header.classList.toggle('is-scrolled', scrollY > 40);
    addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === '#topo' ? 0 : id);
  }));

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  function initMenu() {
    burger.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    $$('#menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }));
  }
  initMenu();

  /* ---------- Hero ---------- */
  gsap.set('.line__in', { yPercent: 115 });
  gsap.set('.hero__cta', { y: 20 });
  function heroIntro() {
    const t = gsap.timeline({ defaults: { ease: 'expo.out' } });
    t.fromTo('.hero__video', { scale: 1.18 }, { scale: 1.02, duration: 9, ease: 'power1.out' }, 0)
     .to('.line__in', { yPercent: 0, duration: 1.6, stagger: 0.14 }, 0.1)
     .fromTo('.header', { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 0.3)
     .to('.hero__cta', { opacity: 1, y: 0, duration: 1.1 }, 0.9)
     .to('.hero__foot', { opacity: 1, duration: 1.2 }, 1.0)
     .fromTo('.hero__tagline > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 1.0)
     .fromTo('.scrollcircle', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.6)' }, 1.15)
     ;
  }

  heroIntro();
  lenis && lenis.start();

  // Parallax/saída do hero ao rolar
  gsap.to('#heroMedia', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#heroContent', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '70% top', scrub: true } });
  gsap.to('#heroFoot', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '30% top', end: '75% top', scrub: true } });

  // Anel do círculo "Role a página" acompanha o progresso do hero
  gsap.to('#ring', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  ScrollTrigger.create({ trigger: '#hero', start: '65% top', onEnter: () => $('.wa').classList.add('is-on'), onLeaveBack: () => $('.wa').classList.remove('is-on') });

  // Header
  ScrollTrigger.create({ start: 40, onUpdate: s => header.classList.toggle('is-scrolled', s.scroll() > 40) });

  /* ---------- Manifesto: palavras acendem com o scroll ---------- */
  const mt = $('#manifestoText');
  (function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p.trim()) { frag.append(p); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.tagName === 'EM') { const s = document.createElement('span'); s.className = 'w'; n.replaceWith(s); s.append(n); }
          else walk(n);
        }
      });
    };
    walk(el);
  })(mt);
  gsap.to('.manifesto__text .w', { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '#manifestoText', start: 'top 80%', end: 'bottom 55%', scrub: true } });

  /* ---------- Reveals genéricos ---------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, overwrite: true })
  });

  /* ---------- Cards: máscara + parallax ---------- */
  $$('.card').forEach(card => {
    const box = $('.card__img', card), img = $('img', card);
    gsap.to(box, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 86%' } });
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo($('.card__meta', card), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 80%' } });
  });
  // img com yPercent precisa de folga
  $$('.card__img img').forEach(i => { i.style.height = '116%'; i.style.marginTop = '-8%'; });

  /* ---------- Parallax genérico ---------- */
  $$('[data-parallax]').forEach(el => {
    gsap.to(el, { yPercent: parseFloat(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('[data-band]', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#band', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Filmes: previews e lightbox ---------- */
  gsap.to('.film', { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.films', start: 'top 85%' } });
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting) {
      const s = v.querySelector('source[data-src]');
      if (s) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); }
      v.play().catch(() => {});
    } else v.pause();
  }), { threshold: 0.25 });
  $$('video[data-preview]').forEach(v => io.observe(v));

  const lb = $('#lightbox'), lbv = $('#lbVideo');
  let lastFocus = null;
  function openFilm(btn) {
    lastFocus = btn;
    lbv.poster = btn.dataset.poster; lbv.src = btn.dataset.film; lbv.setAttribute('aria-label', btn.dataset.title);
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add('is-open'));
    lenis && lenis.stop();
    lbv.play().catch(() => {});
    $('#lbClose').focus();
  }
  function closeFilm() {
    lb.classList.remove('is-open'); lbv.pause();
    setTimeout(() => { lb.hidden = true; lbv.removeAttribute('src'); lbv.load(); }, 350);
    lenis && lenis.start(); lastFocus && lastFocus.focus();
  }
  $$('.film').forEach(b => b.addEventListener('click', () => openFilm(b)));
  window.__openFilm = openFilm;
  $('#lbClose').addEventListener('click', closeFilm);
  lb.addEventListener('click', e => { if (e.target === lb) closeFilm(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeFilm(); });

  /* ---------- Cursor e magnetismo (apenas mouse) ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const cur = $('#cursor');
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener('mouseleave', () => cur.style.opacity = 0);
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => { cur.firstElementChild.textContent = el.dataset.label || 'Ver'; cur.classList.add('is-view'); });
      el.addEventListener('mouseleave', () => cur.classList.remove('is-view'));
    });
    $$('[data-magnetic]').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.55)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.55)' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.28);
        my((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();

/* ---------- Bastidores: toca sozinho com som ao entrar na seção, pausa ao sair; clique expande ---------- */
(() => {
  const reel = document.getElementById('reel');
  if (!reel) return;
  const v = document.getElementById('reelVideo'), btn = document.getElementById('reelPlay'), snd = document.getElementById('reelSound');
  const lb = document.getElementById('lightbox');
  let visible = false, wantSound = true;
  const ui = () => { snd.setAttribute('aria-pressed', !v.muted); snd.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Desligar som'); reel.classList.toggle('is-sound', !v.muted); };
  const start = () => {
    if (!visible || (lb && !lb.hidden)) return;
    v.muted = !wantSound;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }).finally(ui);
  };
  const stop = () => v.pause();
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); }), { threshold: 0.35 }).observe(reel);
  // o navegador só libera áudio automático depois do primeiro toque/clique/tecla: nesse momento liga o som
  const unlock = () => { if (visible && wantSound && v.muted && (!lb || lb.hidden)) { v.muted = false; v.play().catch(() => {}); ui(); } };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, unlock, { passive: true }));
  snd.addEventListener('click', e => { e.stopPropagation(); wantSound = v.muted; v.muted = !wantSound; if (v.paused) v.play().catch(() => {}); ui(); });
  btn.addEventListener('click', () => { v.pause(); if (window.__openFilm) window.__openFilm(btn); });
  if (lb) new MutationObserver(() => (lb.hidden ? start() : stop())).observe(lb, { attributes: true, attributeFilter: ['hidden'] });
})();
