/* ============================================================
   Scroll engine + page behaviour. No dependencies.
   One rAF loop writes --p (0..1) onto every [data-scene]:
     pin  — progress through a section taller than the viewport
            whose .stage is position:sticky (hero, claim, gathr,
            horizontal projects)
     view — progress of the element's travel through the viewport
            (everything that just reveals or parallaxes)
   CSS does the actual animating from --p; JS only measures.
   ============================================================ */

(function () {
  'use strict';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- boot stinger: terminal types, then the site is revealed ----------
     Skippable with any input, runs once per session, never for reduced motion. */
  (function bootSequence() {
    const boot = document.getElementById('boot');
    const out = document.getElementById('term-out');

    function finish(instant) {
      document.documentElement.classList.add('booted');
      document.documentElement.style.overflow = '';
      if (instant) { boot.remove(); return; }
      /* the reveal always lands on the hero — never a restored mid-page position */
      scrollTo(0, 0);
      boot.classList.add('done');
      setTimeout(() => boot.classList.add('gone'), 550);
    }

    if (!boot) { document.documentElement.classList.add('booted'); return; }
    if (reduced) { finish(true); return; }

    /* keep the browser from re-applying a remembered scroll or anchor under the overlay */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    let skipped = false;
    const skip = () => { if (!skipped) { skipped = true; finish(false); } };
    /* deliberate exits: the window's close button, Escape, or trying to scroll */
    document.getElementById('term-close').addEventListener('click', skip);
    addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
    addEventListener('wheel', skip, { once: true, passive: true });
    setTimeout(skip, 9000); // failsafe: nothing may strand a visitor behind the overlay

    const P = '<span class="p">~ %</span> ';
    /* the window title already says who this is — one command is enough */
    const script = [
      { cmd: './portfolio --open', out: null }
    ];
    let html = '';
    const caret = '<span class="caret"></span>';
    const render = extra => { out.innerHTML = html + extra; };

    (async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      render(caret);
      await wait(650);                       // the prompt sits there a beat first
      for (const line of script) {
        if (skipped) return;
        html += P;
        let typed = '';
        for (const ch of line.cmd) {
          if (skipped) return;
          typed += ch;
          render(typed + caret);
          await wait(62);                    // human typing speed
        }
        await wait(260);                     // beat before "enter"
        html += typed + '\n';
        if (line.out) html += '<span class="o">' + line.out + '</span>\n';
        render(caret);
        await wait(line.out ? 1050 : 800);   // time to actually read it
      }
      if (!skipped) { skipped = true; finish(false); }
    })();
  })();

  /* ---------- i18n ---------- */
  const DA = {
    nav_about: 'Om mig',
    nav_work: 'Projekter',
    nav_xp: 'Erfaring',
    nav_skills: 'Kompetencer',
    nav_certs: 'Certifikater',
    nav_contact: 'Kontakt',
    lede: 'Softwarestuderende på Aalborg Universitet i København. Jeg bygger webapplikationer og databaser, tester det, jeg bygger, og forklarer teknik, så folk forstår den. Jeg har været med til at udvikle <strong>Kvixa</strong>, den bestillingsplatform restauranter tager imod ordrer på, og har arbejdet med backend, frontend og test i <strong>Weft</strong>, en planlægningsapp der kører på Azure.',
    meta_loc: 'Ishøj, Storkøbenhavn',
    claim: 'Jeg bygger software sammen med dem, der skal bruge den, tester den, til den virker, og forklarer den, så de forstår den.',
    n1: '2. semesterprojekt, topkarakteren på 7-trinsskalaen',
    n2: 'Certifikater gennemført i 2026, fra Codecademy og Aalborg Universitet',
    n3: 'År i Bilka, nu lukkeansvarlig og med til at oplære nye kolleger',
    k_work: 'Semesterprojekt · karakter 12',
    g1_h: 'Problemet',
    g1_p: 'Studerende på AAU i København hørte mest om arrangementer fra mund til mund. I vores spørgeskema med 94 besvarelser syntes kun 17 %, at det var nemt at finde information om arrangementer, og 80,9 % ønskede én samlet kalender.',
    g2_h: 'Research først',
    g2_p: 'Vi kombinerede spørgeskemaet med interviews af studerende og arrangører, prioriterede med MoSCoW og gik fra skitser til en detaljeret prototype i Figma.',
    g3_h: 'Det byggede jeg',
    g3_p: 'Som gruppeleder for seks arbejdede jeg på tværs af projektet, fra prototyper i Figma og deres HTML og CSS til databasen, tilmelding og login, arrangørprofiler og det at oprette, tilmelde sig og gemme arrangementer.',
    g4_h: 'Testet med brugere',
    g4_p: 'Jeg deltog i de fleste interviews og alle brugertest, to runder i alt, og projektet har 29 automatiske tests. Det fik 12, topkarakteren på 7-trinsskalaen.',
    visit_site: 'Hjemmeside',
    team: 'Holdprojekt',
    w1_h: 'Én plan for en travl uge',
    w1_p: 'Arbejde, studie og træning ligger forskellige steder. Weft samler dem i én plan og lægger den om, når noget flytter sig. Bygget sammen med Jawad Qayyum, der også læser software.',
    w2_h: 'Min del',
    w2_p: 'Jeg arbejdede med backend i C# og .NET, med frontend og med at teste de funktioner, vi byggede.',
    w3_h: 'Kører på Azure',
    w3_p: 'API\'et kører på Azure App Service med Azure SQL og login via Entra ID. Platformen er live, og produktets funktioner bliver gjort færdige inden lanceringen.',
    w_tags: 'C# · .NET 8 · Azure · Frontend · Test',
    k_kvixa: 'Bestillingsplatform · i daglig brug',
    x1_h: 'Bygget med studiekammerater',
    x1_p: 'Selvbetjeningskiosker og online bestilling til grillbarer, caféer og takeawaysteder. Jeg har været med til at udvikle den sammen med studiekammerater.',
    x2_h: 'Én kasseskærm til det hele',
    x2_p: 'Gæsterne bestiller ved kiosken i butikken eller på restaurantens egen hjemmeside, med én menu bag begge. Alle ordrer lander på én kasseskærm, og afhentningsnumre vises på et almindeligt TV.',
    x3_h: 'Lanceret i en rigtig restaurant',
    x3_p: 'Jeg var med til at lancere den hos Chicken N Chicken Waves i Greve, hvor ordrerne nu kommer ind via Kvixa hver dag.',
    x_tags: 'Node.js · MongoDB · Kiosk · Online bestilling · Holdprojekt',
    a_role: '2. semesterprojekt · gruppeleder for seks · karakter 12',
    a_p: 'En webprototype, hvor studerende kan finde, filtrere, gemme og tilmelde sig arrangementer, og arrangører kan styre dem. Bygget på et spørgeskema med 94 besvarelser og interviews, testet i to runder brugertest og med 29 automatiske tests. Jeg arbejdede med databasen, tilmelding og login og funktionerne til arrangementer.',
    k_proj: 'Flere projekter',
    h_proj: 'Resten af hylden',
    p1_h: 'P1: Sociale arrangementer på AAU CPH',
    p1_role: '1. semesterprojekt · gruppe på syv · karakter 10',
    p1_p: 'Et program i C, der giver et overblik over arrangementer for studerende på AAU i København. Det læser arrangementer fra en tekstfil ind i structs, sorterer dem efter tid og pris med qsort, filtrerer på kategori og alkohol, søger på titel og kan tilføje nye arrangementer.',
    p1_t: 'Filindlæsning',
    to_top: 'Til toppen',
    pcap_1: 'Softwarestuderende',
    pcap_2: 'Aalborg Universitet København',
    copy: '© 2026 Yasir Lokman Teksen. Alle rettigheder forbeholdes.',
    c1_h: 'Superliga SQL-database',
    c1_role: 'Gymnasieprojekt i Informatik C · gruppe på to · karakter 12',
    c1_p: 'En relationel database med data fra Superligaen med ni tabeller, et ER-diagram og normalisering til 3. normalform samt SQL-forespørgsler med joins, gruppering og aggregering.',
    c2_h: 'Koordineringssystem',
    yr_now: 'Efterår 2026',
    c2_role: '3. semesterprojekt · i gang',
    c2_p: 'Et system, der skal samle tilmeldinger, status, timer og notifikationer for 2 koordinatorer og ca. 40 studenterformidlere. Jeg er med til interviews, spørgeskemaet, kravspecifikationen, designet og de første prototyper.',
    c3_h: 'Et overblik bygget med AI',
    c3_role: 'Egen automatisering',
    c3_p: 'Brugte Claude til at samle og sortere over 1.000 jobopslag i ét overblik over frister, timer og krav og tjekkede derefter resultatet mod de originale opslag, før jeg brugte det.',
    c3_t: 'Automatisering · Tjek af resultatet',
    k_xp: 'Erfaring',
    h_xp: 'Hvor jeg har arbejdet',
    now: 'nu',
    j1_h: 'Lukkeansvarlig og sælger, elektronik',
    j1_p: 'Har lukkeansvar og er med til at oplære nye kolleger i produkter, arbejdsgange og kundeservice. Deltid ved siden af studiet.',
    j2_h: 'Sælger, elektronik',
    j2_p: 'Rådgav kunder om computere, telefoner og TV, hjalp med basal fejlfinding og henviste dem til servicecenteret, når det var nødvendigt. Brugte SAP til vareopslag og lagerstatus.',
    j3_h: 'Kasseassistent',
    j3_p: 'Betjente kunder ved kassen og genstartede Dankort-terminalen ved fejl, så kunderne hurtigt kunne betale igen.',
    k_skills: 'Værktøjer',
    h_skills: 'Hvad jeg arbejder med',
    s1_h: 'Sprog',
    s2_h: 'Web og backend',
    s3_h: 'Data',
    s3_1: 'ER-diagrammer',
    s3_2: 'Normalisering (3NF)',
    s3_3: 'Dataintegritet',
    s4_h: 'Test og UX',
    s4_1: 'Automatiske tests',
    s4_2: 'Brugertest',
    s4_3: 'Brugerinterviews',
    s4_4: 'Prototyper i Figma',
    s4_5: 'Brugercentreret design',
    s5_h: 'AI-værktøjer',
    s6_h: 'Support og IT',
    s6_1: 'Fejlfinding',
    s6_2: 'Opsætning af enheder',
    k_certs: 'Certifikater',
    h_certs: 'Ni certifikater i 2026',
    b_data: 'Data',
    b_code: 'Programmering',
    b_ux: 'UX',
    b_sec: 'Sikkerhed',
    b_ai: 'AI',
    b_team: 'Samarbejde',
    m_sep: 'september 2026',
    m_jul: 'juli 2026',
    m_jun: 'juni 2026',
    m_mar: 'marts 2026',
    d_sep23: '23. sep. 2026',
    d_jul15: '15. jul. 2026',
    d_jun24: '24. jun. 2026',
    d_jun23: '23. jun. 2026',
    d_mar30: '30. mar. 2026',
    d_mar9: '9. mar. 2026',
    cert_view: 'Se certifikat',
    cv_pdf: 'Åbn PDF',
    certs_more: 'Se dem på LinkedIn',
    h_edu: 'Min vej indtil nu',
    k_edu: 'Uddannelse',
    e1_h: 'Bachelor (BSc) i teknisk videnskab (software)',
    e1_s: '3. semester, forventet færdig i juni 2028. Fag som Databaser og softwarearkitektur, Systemudvikling og Internetværk og web-programmering.',
    e1_g: 'Gennemsnit 8,0 / 12',
    e2_y: 'Næste',
    e2_h: 'Kandidat i cybersikkerhed, mit mål',
    e2_s: 'Jeg deltager jævnligt i Hacking Evening med CyberSkills og PROSA på AAU i København.',
    e3_s: 'Gymnasial uddannelse. Mit Superliga-databaseprojekt i Informatik C fik 12.',
    k_contact: 'Kontakt',
    h_contact: 'Lad os tage en snak',
    contact_p: 'Jeg søger et studiejob inden for udvikling, test, data, IT-support eller cybersikkerhed, 10 til 15 timer om ugen. Storkøbenhavn, og den hurtigste vej til mig er en mail.',
    btn_mail: 'Skriv til mig',
    foot: 'København'
  };

  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    EN[el.dataset.i18n] = EN[el.dataset.i18n] ?? el.innerHTML;
  });

  let lang = 'en';
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = l === 'da' ? (DA[el.dataset.i18n] ?? EN[el.dataset.i18n]) : EN[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('#l-en,#l2-en').forEach(e => e.classList.toggle('on', l === 'en'));
    document.querySelectorAll('#l-da,#l2-da').forEach(e => e.classList.toggle('on', l === 'da'));
    document.querySelectorAll('[data-words]').forEach(splitWords); // re-split after innerHTML swap
    measure();
  }
  document.querySelectorAll('#langbtn,#langbtn2').forEach(b =>
    b.addEventListener('click', () => {
      const next = lang === 'en' ? 'da' : 'en';
      setLang(next);
      try { localStorage.setItem('lang', next); } catch (e) {}
    }));

  /* ---------- theme (pre-paint script in <head> set the attribute) ---------- */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  let dark = document.documentElement.dataset.theme === 'dark';
  function setTheme(d, remember) {
    dark = d;
    document.documentElement.dataset.theme = d ? 'dark' : 'light';
    document.querySelectorAll('#themebtn,#themebtn2').forEach(b =>
      b.setAttribute('aria-pressed', String(d)));
    if (remember) { try { localStorage.setItem('theme', d ? 'dark' : 'light'); } catch (e) {} }
  }
  setTheme(dark, false);
  document.querySelectorAll('#themebtn,#themebtn2').forEach(b =>
    b.addEventListener('click', () => setTheme(!dark, true)));
  mq.addEventListener('change', e => {
    let stored = null; try { stored = localStorage.getItem('theme'); } catch (err) {}
    if (!stored) setTheme(e.matches, false);
  });

  /* ---------- word splitting for the claim scene ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`)
      .join(' ');
    el.style.setProperty('--n', words.length);
  }
  document.querySelectorAll('[data-words]').forEach(splitWords);

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobile');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobile.classList.toggle('open');
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); mobile.classList.remove('open');
  }));

  /* ---------- scrollspy ---------- */
  const spyTargets = ['about', 'work', 'experience', 'skills', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const allLinks = [...document.querySelectorAll('.navlinks a[href^="#"], .mobile a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        allLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  spyTargets.forEach(t => spy.observe(t));

  /* ---------- count-up numbers ---------- */
  function runCounter(span) {
    if (span._done) return;
    span._done = true;
    const target = parseFloat(span.dataset.count);
    const decimals = parseInt(span.dataset.decimals || '0', 10);
    if (reduced) { span.textContent = target.toFixed(decimals); return; }
    const t0 = performance.now(), dur = 1100;
    (function step(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      span.textContent = (target * eased).toFixed(decimals);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- the engine ---------- */
  const scenes = [...document.querySelectorAll('[data-scene]')];
  /* every pinned scene that walks through captions: .gathr, .weft, whatever comes next.
     data-steps says how many, so one loop drives all of them. */
  const walks = [...document.querySelectorAll('[data-steps]')].map(el => ({
    el,
    n: Math.max(1, parseInt(el.dataset.steps, 10) || 1),
    steps: [...el.querySelectorAll('.step')],
    dots: [...el.querySelectorAll('.step-dots i')],
    shots: [...el.querySelectorAll('.shot')],
    active: -1
  }));
  const numbers = document.querySelector('.numbers');
  const counters = [...document.querySelectorAll('[data-count]')];
  const hscroll = document.querySelector('.hscroll');
  const track = document.getElementById('track');
  const nav = document.getElementById('nav');
  const bar = document.getElementById('bar');
  const isNarrow = () => matchMedia('(max-width: 860px)').matches;

  let vh = innerHeight;

  /* on narrow / short viewports the pinned stages must hold copy + screenshot
     with nothing clipped: shrink the browser frame (ratio kept) to what's left */
  function fitPanels() {
    for (const scene of document.querySelectorAll('.gathr, .weft')) {
      const stage = scene.querySelector('.stage');
      const grid = scene.querySelector('.gathr-grid');
      const copy = scene.querySelector('.gathr-copy');
      const browser = scene.querySelector('.gathr-visual .browser');
      if (!stage || !grid || !copy || !browser) continue;
      browser.style.width = '';
      const steps = scene.querySelector('.steps');
      if (steps) steps.style.minHeight = '';
      if (!isNarrow()) continue;
      /* reserve exactly the tallest step, not the CSS guess — the saved
         slack becomes screenshot width */
      if (steps) {
        let tallest = 0;
        for (const st of steps.children) {
          let h = 0;
          for (const el of st.children) {
            const cs = getComputedStyle(el);
            h += el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
          }
          tallest = Math.max(tallest, h);
        }
        if (tallest) steps.style.minHeight = tallest + 'px';
      }
      const st = getComputedStyle(stage);
      const inner = stage.clientHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom);
      const twoCol = getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length > 1;
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
      const avail = twoCol ? inner : inner - copy.offsetHeight - gap;
      const bar = browser.querySelector('.browser-bar');
      const barH = bar ? bar.offsetHeight : 38;
      const maxW = (avail - barH) * (1400 / 825);
      const colW = browser.parentElement.clientWidth || grid.clientWidth;
      if (maxW < colW) browser.style.width = Math.max(180, maxW) + 'px';
    }
  }

  function measure() {
    vh = innerHeight;
    // horizontal section: its height is the horizontal distance to cover
    if (hscroll && track) {
      if (isNarrow() || reduced) {
        hscroll.style.height = '';
        track.style.setProperty('--shift', '0px');
      } else {
        const shift = Math.max(0, track.scrollWidth - innerWidth);
        track.style.setProperty('--shift', -shift + 'px');
        hscroll.style.height = (vh + shift) + 'px';
      }
    }
    fitPanels();
    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      s._top = r.top + scrollY;
      s._h = s.offsetHeight;
    }
  }

  function frame() {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    const doc = document.documentElement;
    bar.style.width = (y / Math.max(1, doc.scrollHeight - doc.clientHeight) * 100) + '%';

    for (const s of scenes) {
      let p;
      if (s.dataset.scene === 'pin') {
        p = clamp((y - s._top) / Math.max(1, s._h - vh), 0, 1);
      } else {
        // progress of the element travelling up through the viewport
        p = clamp((y + vh - s._top) / (vh + s._h), 0, 1);
      }
      if (Math.abs((s._p ?? -1) - p) > 0.0004) {
        s._p = p;
        s.style.setProperty('--p', p.toFixed(4));
      }
    }

    // step switching: the panel straightens over the first third, then the
    // captions take an equal share of the remainder. The +0.4 is that head start.
    for (const w of walks) {
      if (w.el._p === undefined) continue;
      const active = clamp(Math.floor(w.el._p * (w.n + 0.4)), 0, w.n - 1);
      if (w.active !== active) {
        w.active = active;
        w.steps.forEach((el, i) => el.classList.toggle('on', i === active));
        w.dots.forEach((el, i) => el.classList.toggle('on', i <= active));
        // a step can name the frame it wants, so three captions can share two frames
        const want = w.steps[active] && w.steps[active].dataset.shot;
        const shot = want ? +want : Math.min(active, w.shots.length - 1);
        w.shots.forEach((el, i) => el.classList.toggle('on', i === shot));
      }
    }

    // counters fire once their band is a third of the way up the screen
    if (numbers && numbers._p > 0.35) counters.forEach(runCounter);

    requestAnimationFrame(frame);
  }

  /* pointer tilt on the 3D panel — desktop only, on top of the scroll pose */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.gathr-visual').forEach(visual => {
      const panel = visual.querySelector('.panel3d');
      if (!panel) return;
      visual.addEventListener('mousemove', e => {
        const r = visual.getBoundingClientRect();
        panel.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 7);
        panel.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      visual.addEventListener('mouseleave', () => {
        panel.style.setProperty('--mx', 0);
        panel.style.setProperty('--my', 0);
      });
    });
  }

  /* the mobile URL bar fires height-only resizes constantly while scrolling;
     re-measuring then causes thrash and jumps. Only a width change matters. */
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth !== lastW) { lastW = innerWidth; measure(); }
    else { vh = innerHeight; }
  }, { passive: true });
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  if (reduced) {
    // CSS pins --p to 1 and flattens the pinned scenes; just finish the numbers
    counters.forEach(runCounter);
  } else {
    requestAnimationFrame(frame);
  }

  /* restore language: stored choice beats browser locale */
  let storedLang = null; try { storedLang = localStorage.getItem('lang'); } catch (e) {}
  if (storedLang === 'da' || storedLang === 'en') { if (storedLang !== 'en') setLang(storedLang); }
  else {
    /* device language OR a Copenhagen clock reads as a Danish visitor —
       catches Danes whose phone is set to English, no geo request needed */
    const langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (langs.includes('da') || tz === 'Europe/Copenhagen') setLang('da');
  }
})();

/* ---------- GoatCounter events: which contact links and certificates people open ----------
   count.js loads async and skips localhost, so this quietly does nothing until it is there */
function track(path, title) {
  try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path, title, event: true }); } catch (e) {}
}
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  const h = a.getAttribute('href');
  if (h.startsWith('mailto:')) track('click-email', 'Clicked email');
  else if (h.includes('linkedin.com')) track('click-linkedin', 'Clicked LinkedIn');
  else if (h.includes('github.com')) track('click-github', 'Clicked GitHub');
  else if (h.includes('kvixa') || h.includes('weft.azurewebsites')) track('click-' + new URL(a.href).hostname, 'Clicked ' + new URL(a.href).hostname);
});

/* ---------- certificate viewer: cards open a lightbox, the link still works without JS ---------- */
(() => {
  const dlg = document.getElementById('certview');
  const cards = [...document.querySelectorAll('.cert[data-cert]')];
  if (!dlg || !cards.length || typeof dlg.showModal !== 'function') return;
  const img = document.getElementById('cv-img');
  const title = document.getElementById('cv-title');
  const by = document.getElementById('cv-by');
  let i = 0;

  function show(n) {
    i = (n + cards.length) % cards.length;
    const c = cards[i];
    const name = c.querySelector('h3').textContent;
    img.src = 'assets/certs/' + c.dataset.cert + '.jpg';
    img.alt = name;
    title.textContent = name;
    by.textContent = c.querySelector('.by').textContent + ' · ' + c.querySelector('.date').textContent;
  }

  // view only: no right-click "save image" or dragging the certificate out
  document.querySelectorAll('.cert img, #cv-img').forEach(el => {
    el.setAttribute('draggable', 'false');
    el.addEventListener('contextmenu', e => e.preventDefault());
  });

  cards.forEach((c, n) => c.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks through
    e.preventDefault();
    show(n);
    dlg.showModal();
    track('cert-' + c.dataset.cert, 'Certificate: ' + c.querySelector('h3').textContent);
  }));
  document.getElementById('cv-close').addEventListener('click', () => dlg.close());
  document.getElementById('cv-prev').addEventListener('click', () => show(i - 1));
  document.getElementById('cv-next').addEventListener('click', () => show(i + 1));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // backdrop
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  dlg.addEventListener('close', () => cards[i].focus({ preventScroll: true }));
})();
