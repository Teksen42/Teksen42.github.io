/* Project sheets, the pinned project stage, reveals, the count-up and the cursor. Nothing is stored or sent. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* sheets: a button opens the project, the cross, Esc or a click outside closes it */
  let opener = null;
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => {
    const d = document.getElementById(b.dataset.open);
    if (!d || d.open) return;
    opener = b;
    // an embedded page (the Nabolys app) loads the first time its sheet opens, not with the front page
    d.querySelectorAll('iframe[data-src]').forEach((f) => { f.src = f.dataset.src; f.removeAttribute('data-src'); });
    d.showModal();
    d.scrollTop = 0;
    d.style.setProperty('--sp', 0);
    const nm = d.querySelector('.sheet-name');
    if (nm) { nm.tabIndex = -1; nm.focus({ preventScroll: true }); }
    window.dispatchEvent(new Event('resize'));
  }));
  $$('.sheet').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
  });

  /* the project images load a second after the page, or as soon as the projects come within half a screen,
     so the portrait on the first screen never shares the line with them */
  const later = $$('img[data-src]');
  let loaded = false;
  const loadLater = () => {
    if (loaded) return;
    loaded = true;
    near.disconnect();
    later.forEach((img) => {
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    });
  };
  const near = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) loadLater(); }, { rootMargin: '50% 0px' });
  const stage = $('.showcase');
  if (stage) near.observe(stage);
  const afterLoad = () => setTimeout(loadLater, 1000);
  if (document.readyState === 'complete') afterLoad(); else addEventListener('load', afterLoad, { once: true });

  /* each sheet shows how far you have read */
  document.querySelectorAll('.sheet').forEach((d) => {
    const bar = d.querySelector('.sheet-progress');
    if (!bar) return;
    d.addEventListener('scroll', () => {
      const max = d.scrollHeight - d.clientHeight;
      d.style.setProperty('--sp', max > 0 ? (d.scrollTop / max).toFixed(3) : 0);
    }, { passive: true });
  });

  /* the projects: the stage stays put and scrolling moves from one project to the next, on a computer and on a phone alike; the switcher shows where you are and jumps there. Only a very low screen (a phone on its side) lets them follow each other. */
  const show_ = document.querySelector('.showcase');
  const tabs = [...document.querySelectorAll('.seg [role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const wide = matchMedia('(min-width: 60rem) and (min-height: 640px), (max-width: 59.99rem) and (min-height: 560px)');
  let current = -1;
  const select = (i, focus) => {
    if (i === current) return;
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      panels[k].hidden = !on;
      if (on && !still) { panels[k].classList.remove('enter'); void panels[k].offsetWidth; panels[k].classList.add('enter'); }
    });
  };
  const range = () => show_.offsetHeight - innerHeight;
  const goTo = (i) => {
    const top = show_.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (range() * (i + 0.5)) / panels.length, behavior: still ? 'auto' : 'smooth' });
  };
  const onScroll = () => {
    if (!show_.classList.contains('pinned')) return;
    const p = -show_.getBoundingClientRect().top / Math.max(1, range());
    show_.style.setProperty('--pp', Math.min(1, Math.max(0, p)).toFixed(3));
    select(Math.min(panels.length - 1, Math.max(0, Math.floor(p * panels.length))));
  };
  const layout = () => {
    if (!show_ || !tabs.length) return;
    if (wide.matches) {
      show_.classList.add('pinned');
      show_.style.setProperty('--n', panels.length);
      current = -1; onScroll(); if (current < 0) select(0);
    } else {
      show_.classList.remove('pinned');
      current = -1;
      panels.forEach((p) => { p.hidden = false; p.classList.remove('enter'); });
    }
  };
  if (show_ && tabs.length) {
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => goTo(i));
      t.addEventListener('keydown', (e) => {
        const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!n) return;
        e.preventDefault();
        const j = (i + n + tabs.length) % tabs.length;
        goTo(j); select(j, true);
      });
    });
    layout();
    wide.addEventListener('change', layout);
    addEventListener('scroll', onScroll, { passive: true });
    const fromHash = () => { const k = panels.findIndex((p) => p && '#' + p.id === location.hash); if (k >= 0 && show_.classList.contains('pinned')) goTo(k); };
    fromHash();
    addEventListener('hashchange', fromHash);
  }

  /* read more: the card turns on its vertical axis and shows its back at the halfway point; close turns it back */
  document.querySelectorAll('.pcard .more summary').forEach((sum) => {
    sum.addEventListener('click', (e) => {
      if (still) return;
      e.preventDefault();
      const det = sum.parentElement, card = det.closest('.pcard');
      if (card.classList.contains('flip')) return;
      card.classList.add('flip');
      setTimeout(() => { det.open = !det.open; }, 300);
      setTimeout(() => card.classList.remove('flip'), 620);
      if (e.detail > 0) sum.blur();
    });
  });

  /* a back that is taller than its card fades at the edge that has more text */
  const markScroll = (b) => {
    const over = b.scrollHeight > b.clientHeight + 1;
    b.classList.toggle('scrolls', over);
    b.classList.toggle('scrolled', over && b.scrollTop > 4);
    b.classList.toggle('at-end', over && b.scrollTop + b.clientHeight >= b.scrollHeight - 4);
  };
  document.querySelectorAll('.more-back').forEach((b) => {
    b.addEventListener('scroll', () => markScroll(b), { passive: true });
    const det = b.closest('details');
    if (det) det.addEventListener('toggle', () => requestAnimationFrame(() => markScroll(b)));
  });
  addEventListener('resize', () => document.querySelectorAll('details[open] .more-back').forEach(markScroll));

  if (still) return;

  /* sections arrive as they come into view */
  const groups = ['.claim', '.facts > div', '.panel-copy', '#projects .row', '#education .row', '.stairs li', '.cert', '.c-row', '.sect h2', '.toolbox h2', '.contact h2'];
  const items = [];
  groups.forEach((sel) => $$(sel).forEach((el, i) => { if (el.closest('.sheet')) return; el.classList.add('reveal'); el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms'); items.push(el); }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  /* scroll animations: heads rise word by word, the timeline and the cards arrive, the portrait settles */
  document.documentElement.classList.add('motion');
  const splitWords = (el) => {
    if (el.querySelector('.w')) return;
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = t; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add('words');
  };
  const wordHeads = () => document.querySelectorAll('.sect h2, .toolbox h2, .show-h, .contact h2');
  const watch = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    watch.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  const arm = () => {
    wordHeads().forEach((el) => { splitWords(el); watch.observe(el); });
    document.querySelectorAll('.gantt, .sem, .pgrid, .skillmap').forEach((el) => watch.observe(el));
    document.querySelectorAll('.pcard, .sk').forEach((c, j) => c.style.setProperty('--j', j % 6));
  };
  arm();
  document.addEventListener('langchange', () => { wordHeads().forEach((el) => el.classList.remove('words', 'in')); arm(); });
  const portrait = document.querySelector('.hero-portrait');
  if (portrait) addEventListener('scroll', () => {
    const p = Math.min(1, scrollY / innerHeight);
    portrait.style.setProperty('--hp', p.toFixed(3));
  }, { passive: true });

  /* the three numbers count up the first time they are seen */
  $$('.facts dt').forEach((dt) => {
    const node = [...dt.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node || !('IntersectionObserver' in window)) return;
    const end = parseInt(node.textContent, 10), tail = node.textContent.replace(/^\s*\d+/, '');
    node.textContent = '0' + tail;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + tail;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(dt);
  });

  if (!fine) return;

  /* a cursor of its own: a dot, and a ring that follows a beat behind and grows over anything clickable */
  const cur = $('#cursor');
  if (!cur) return;
  document.documentElement.classList.add('has-cursor');
  /* an open sheet or viewer sits in the top layer; the cursor moves in with it so it stays visible */
  const home = cur.parentNode;
  const follow = () => { const open = [...document.querySelectorAll('dialog[open]')].pop(); const to = open || home; if (cur.parentNode !== to) to.appendChild(cur); };
  new MutationObserver(follow).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  let mx = -100, my = -100, rx = -100, ry = -100, rs = 1, target = 1;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!cur.classList.contains('away')) cur.classList.add('live');
    const link = e.target.closest('a, button, [role="button"], label, .cert');
    cur.classList.toggle('on-link', !!link);
    target = link ? 1.6 : 1;
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('live'));
  /* over an embedded page (the Nabolys app) the pointer belongs to that page: hide ours there, the normal arrow shows */
  document.querySelectorAll('iframe').forEach((f) => {
    f.addEventListener('mouseenter', () => { cur.classList.remove('live'); cur.classList.add('away'); });
    f.addEventListener('mouseleave', () => { cur.classList.remove('away'); });
  });
  addEventListener('pointerdown', () => { target *= 0.8; });
  addEventListener('pointerup', () => { target /= 0.8; });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; rs += (target - rs) * 0.2;
    cur.style.setProperty('--cx', mx + 'px'); cur.style.setProperty('--cy', my + 'px');
    cur.style.setProperty('--rx', rx.toFixed(1) + 'px'); cur.style.setProperty('--ry', ry.toFixed(1) + 'px');
    cur.style.setProperty('--rs', rs.toFixed(3));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
