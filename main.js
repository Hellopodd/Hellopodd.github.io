/* ============================================================
   ResearchLift — motion & micro-interactions
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 821;

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('progress');
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    header.classList.toggle('scrolled', h.scrollTop > 24);
    parallax();
  }

  /* ---------- Header ---------- */
  const header = document.getElementById('header');

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuToggle.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .line-rise');
  if (reduce) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1700;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.innerHTML = val.toLocaleString('en-IN') + (suffix ? '<span class="suffix">' + suffix + '</span>' : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (reduce) {
    counters.forEach(el => { el.innerHTML = parseFloat(el.dataset.count).toLocaleString('en-IN') + (el.dataset.suffix ? '<span class="suffix">' + el.dataset.suffix + '</span>' : ''); });
  } else {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Parallax ---------- */
  const parEls = document.querySelectorAll('[data-parallax]');
  let ticking = false;
  function parallax() {
    if (reduce || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      parEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const off = (mid - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
      ticking = false;
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduce) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Card tilt (hero card) ---------- */
  if (!isTouch && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Smooth anchor scroll (offset for header) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('formFields').style.display = 'none';
      document.getElementById('formSuccess').classList.add('show');
    });
  }

  /* ---------- Turnitin modal ---------- */
  const modal = document.getElementById('turnitinModal');
  const modalClose = document.getElementById('modalClose');
  let modalShown = false;
  function openModal() { if (!modalShown) { modal.classList.add('show'); modalShown = true; } }
  function closeModal() { modal.classList.remove('show'); }
  // Show once user scrolls a bit into the page
  let modalTimer = setTimeout(openModal, 6500);
  window.addEventListener('scroll', () => {
    if (!modalShown && window.scrollY > window.innerHeight * 1.4) openModal();
  }, { passive: true });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Init ---------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', parallax, { passive: true });
  onScroll();
})();
