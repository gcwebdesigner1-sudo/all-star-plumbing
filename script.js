(() => {
  if ('scrollRestoration' in history && !location.hash) history.scrollRestoration = 'manual';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Year
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  // Nav: solid after leaving the top, mobile menu
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks'), fab = $('.fab');
  const hero = $('.hero');
  const closeMenu = () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.add('is-solid');
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));

  // Scroll-linked hero parallax + fade (reversible)
  const parallax = $$('[data-parallax]');
  const heroContent = $('.hero__content');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const h = hero.offsetHeight;
    nav.classList.toggle('is-solid', y > 40 || links.classList.contains('is-open'));
    if (fab) fab.classList.toggle('is-on', y > h * 0.7);
    if (!reduce) {
      parallax.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.parallax);
        const offset = el.closest('.hero') ? y : (r.top + r.height / 2 - innerHeight / 2);
        el.style.transform = el.classList.contains('hero__star')
          ? `translate3d(0, ${offset * speed}px, 0) rotate(${y * 0.04}deg)`
          : `translate3d(0, ${offset * speed}px, 0)`;
      });
      if (y < h) {
        const p = y / h;
        heroContent.style.transform = `translate3d(0, ${y * -0.25}px, 0) scale(${1 - p * 0.12})`;
        heroContent.style.opacity = String(Math.max(0, 1 - p * 1.6));
      }
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Reveal on scroll, reversible when scrolling back up past it
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-in');
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('is-in');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 4) * 80}ms`;
    io.observe(el);
  });

  // Service tabs with sliding ink
  const tabs = $$('.tab'), ink = $('.tabs__ink');
  const moveInk = t => { ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft - 6}px)`; };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(o => {
      const on = o === t;
      o.classList.toggle('is-active', on);
      o.setAttribute('aria-selected', String(on));
      const panel = $('#panel-' + o.dataset.tab);
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    moveInk(t);
  }));
  const placeInk = () => moveInk($('.tab.is-active'));
  addEventListener('resize', placeInk);
  document.fonts ? document.fonts.ready.then(placeInk) : placeInk();
  placeInk();

  // Marquee: duplicate each row so the loop is seamless
  $$('.marquee__row').forEach(row => {
    [...row.children].forEach(c => { const d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); row.appendChild(d); });
  });

  // Quote form: opens a pre-written text to the shop
  const form = $('#quoteForm'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements;
    let ok = true;
    ['name', 'phone'].forEach(n => {
      const bad = !f[n].value.trim();
      f[n].classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Add your name and phone so we can call you back.'; return; }
    const body = `Hi All Star, I'd like a free quote.\nName: ${f.name.value.trim()}\nPhone: ${f.phone.value.trim()}\nService: ${f.service.value}` +
      (f.city.value.trim() ? `\nCity: ${f.city.value.trim()}` : '') +
      (f.msg.value.trim() ? `\nDetails: ${f.msg.value.trim()}` : '');
    location.href = `sms:+13238499863?&body=${encodeURIComponent(body)}`;
    note.innerHTML = 'Your messages app should open with everything filled in. Nothing opened? Call <a href="tel:+13238499863">(323) 849-9863</a>.';
  });
})();
