/* Page behaviour: language, theme, mobile menu, the current section in the nav,
   and the certificate viewer. No dependencies and no scroll animation. */

(function () {
  'use strict';

  /* ---------- i18n: English is in the HTML, Danish is here ---------- */
  const DA = {
    skip: 'Spring til indhold',
    nav_about: 'Om mig',
    nav_work: 'Projekter',
    nav_xp: 'Erfaring',
    nav_skills: 'Kompetencer',
    nav_certs: 'Certifikater',
    nav_contact: 'Kontakt',
    td_lede: 'Jeg hedder Yasir og læser software på 3. semester på Aalborg Universitet i København. Lige nu bygger jeg beredskabsappen <strong>Nabolys</strong>. Jeg arbejder også på <strong>Weft</strong> og var med til at lave <strong>Kvixa</strong>. Ved siden af studiet er jeg lukkeansvarlig i Bilka, og mit mål er en kandidat i cybersikkerhed.',
    status: 'Søger studiejob, 10 til 15 timer om ugen.',
    td_jump: 'Se projekterne',
    meta_loc: 'Ishøj, Storkøbenhavn',
    meta_mail: 'E-mail',
    claim: 'Jeg bygger software <span class="ph" data-proof="users">sammen med dem, der skal bruge den</span>, <span class="ph" data-proof="test">tester den, til den virker</span>, og <span class="ph" data-proof="explain">forklarer den, så de forstår den</span>.',
    n1: '2. semesterprojekt, topkarakteren på 7-trinsskalaen',
    n2: 'Certifikater gennemført i 2026, fra Codecademy, Aalborg Universitet og IDA',
    n3: 'År i Bilka, nu lukkeansvarlig og med til at oplære nye kolleger',
    k_nabolys: 'Beredskabsapp under udvikling, eget projekt',
    n_lede: 'Nabolys hjælper familien og naboerne med at være klar til de første tre døgn af en krise. Det er mit eget projekt, og appen er på vej til Android og iPhone.',
    n_tags: 'C#/.NET 10 · Azure SQL · Entra ID · Bicep · GitHub Actions · React Native · Kotlin · Swift',
    cap_n1: 'Nabolys\' hjemmeside med venteliste',
    f_n1_h: 'Lager og 3-døgnsliste',
    f_n1_p: 'Skriv eller scan dine varer ind med udløbsdato, og se, hvad husstanden mangler til tre døgn efter myndighedernes råd.',
    f_n2_h: 'Familieplan og »Jeg er ok«',
    f_n2_p: 'Aftal et mødested og vigtige numre, og tjek ind med ét tryk, så familien kan se, at du er i orden.',
    f_n3_h: 'Skriv og tal uden net',
    f_n3_p: 'Når nettet er væk, går beskeder og tale direkte fra telefon til telefon over Bluetooth, så længe I er inden for rækkevidde.',
    f_n4_h: 'Kun familien kan læse det',
    f_n4_p: 'Det, du deler med familien, er låst, før det forlader din telefon. Kun familien kan læse det, heller ikke vi.',
    proto_h: 'Klik rundt i appen',
    proto_note: 'Skærme fra appen med en opdigtet familie: Anne, Bo og Sara. Vælg en skærm, og rul i telefonen for at se det hele.',
    calc_h: 'Hvad skal din husstand have?',
    calc_p: 'Myndighederne anbefaler, at du kan klare dig selv i tre døgn under en krise. Det er en vejledende anbefaling, ikke en pligt. Her er samme beregning som i appen, og ved hver gruppe står, hvor tallene kommer fra.',
    calc_src: 'Kilder: <a href="https://samsik.dk/forberedt/" target="_blank" rel="noopener">Styrelsen for Samfundssikkerhed</a>, <a href="https://www.foedevarestyrelsen.dk/kost-og-foedevarer/foedevaresikkerhed/foedevareberedskab/forberedt-paa-kriser" target="_blank" rel="noopener">Fødevarestyrelsen</a> og <a href="https://www.nationalbanken.dk/da/viden-og-nyheder/presse/arkiv/2025/nationalbankens-nye-anbefalinger-om-betalinger-i-butikker-og-anden-fysisk-handel-06-10-2025" target="_blank" rel="noopener">Nationalbanken</a>. Myndighederne nævner flere ting uden mængde, og dér regner appen med mindst én. Nabolys er et privat projekt og ikke en myndighed.',
    k_weft: 'Planlægningsapp under udvikling, holdprojekt',
    w_lede: 'Arbejde, studie og træning ligger forskellige steder. Weft samler dem i én plan og lægger den om, når noget flytter sig. Jawad Qayyum og jeg bygger den sammen, og jeg arbejder med backend i C# og .NET, frontend og test.',
    w_tags: 'C#/.NET 8 · Azure SQL · Entra ID · Bicep · GitHub Actions · React Native',
    cap_w1: 'Wefts hjemmeside med venteliste',
    f_w1_h: 'Vagtplanen fra et foto',
    f_w1_p: 'Tag et billede af vagtplanen, som den hænger. Weft læser vagterne og spørger, når den er i tvivl.',
    f_w2_h: 'Ét tidspunkt at gå hjemmefra',
    f_w2_p: 'Weft regner rejsetiden fra dør til dør og siger til, når toget svigter.',
    f_w3_h: 'Intet sker, du ikke kan fortryde',
    f_w3_p: 'Hver ændring står med sin grund og en fortryd-knap.',
    f_w4_h: 'Kører på Azure',
    f_w4_p: 'API\'et kører på Azure App Service med Azure SQL og login via Entra ID. Funktionerne bliver gjort færdige inden lanceringen.',
    ws_h: 'Sådan ser appen ud',
    ws_note: 'Skærmbilleder fra prototypen af Weft.',
    cap_wa: 'Dagen samlet i én plan',
    cap_wb: 'Skriv, hvad der er sket, så flytter Weft løbeturen',
    cap_wc: 'Planen før og efter, klar til at blive bekræftet',
    cap_wd: 'Det, der overlapper, side om side',
    plan_h: 'Noget flytter sig. Hvad sker der med dagen?',
    plan_note: 'Et lille eksempel, jeg har kodet til den her side. Det er ikke Wefts rigtige planlægger.',
    k_kvixa: 'Bestillingsplatform i daglig brug, holdprojekt',
    x_lede: 'Selvbetjeningskiosker og online bestilling til grillbarer, caféer og takeawaysteder. Jeg har været med til at udvikle den sammen med studiekammerater og til at lancere den hos Chicken N Chicken Waves i Greve, hvor ordrerne nu kommer ind via Kvixa hver dag.',
    x_tags: 'Node.js · MongoDB · Kotlin + Compose · Flutter · Docker',
    cap_x1: 'Kvixas hjemmeside',
    f_x1_h: 'I butikken',
    f_x1_p: 'Gæsten bestiller og betaler selv ved skærmen, med tilvalg og menuer, dansk og engelsk og de 14 EU-allergener ved hver ret.',
    f_x2_h: 'Online',
    f_x2_p: 'Restaurantens egen hjemmeside og bestillingsside. Gæsten afhenter nu eller senere, med samme menu som på kiosken.',
    f_x3_h: 'Bag disken',
    f_x3_p: 'Alle ordrer ringer på én kasseskærm, til nogen trykker Modtaget. Numrene flytter fra Tilberedes til Er klar på et almindeligt TV.',
    f_x4_h: 'For restauranten',
    f_x4_p: 'Menu, priser og åbningstider rettes fra telefonen, og ét tryk melder en ret udsolgt.',
    cw_h: 'Bruges hver dag på en restaurant i Greve',
    cw_note: 'chickenwaves.dk er restaurantens egen hjemmeside. Gæsterne bestiller her, og ordrerne kommer ind via Kvixa.',
    cap_cw4: 'Begge kiosker i butikken',
    cap_cw0: 'Startskærmen på kiosken',
    cap_cw3: 'Menuen på kiosken, med kortterminalen',
    cap_cw1: 'Restaurantens forside',
    cap_cw2: 'Bestillingssiden med menu og kurv',
    kv_h: 'Bestil noget, og følg det gennem restauranten',
    kv_s1: '1. Gæsten bestiller ved kiosken',
    kv_s2: '2. Ordren lander på kasseskærmen. Tryk Modtaget, Klar og Udleveret',
    kv_s3: '3. Nummeret flytter sig på TV\'et',
    kv_note: 'Et lille eksempel på flowet, kodet til den her side. Det følger de samme trin som Kvixa, og intet bliver sendt nogen steder.',
    h_proj: 'Andre projekter',
    yr_now: 'Efterår 2026',
    c2_h: 'Koordineringssystem',
    c2_role: '3. semesterprojekt, i gang',
    c2_p: 'Et system, der skal samle tilmeldinger, status, timer og notifikationer for 2 koordinatorer og ca. 40 studenterformidlere. Jeg er med til interviews, spørgeskemaet, kravspecifikationen, designet og de første prototyper. I backenden (Java og Spring Boot) har jeg ansvaret for strukturen, dataadgangen og databaseskemaet. Jeg byggede fundamentet og koblede frontend og backend sammen.',
    a_role: '2. semesterprojekt, gruppeleder for seks, karakter 12',
    a_p: 'En webprototype, hvor studerende kan finde, filtrere, gemme og tilmelde sig arrangementer, og arrangører kan styre dem. Bygget på et spørgeskema med 94 besvarelser og interviews, testet i to runder brugertest og med 29 automatiske tests. Jeg arbejdede med databasen, tilmelding og login og funktionerne til arrangementer.',
    yr_m1: 'Sommer 2026',
    m1_role: 'Medudvikler, bygget sammen med en ven',
    m1_p: 'Bygget til live undertekster af fredagsprædikenen i en moské. Imamen taler arabisk eller tyrkisk, også midt i en sætning, og talen bliver oversat live til danske og tyrkiske undertekster i browseren, klar til en tv-skærm. Koran-recitation genkendes blandt 6.236 vers og vises med de officielle oversættelser og en henvisning. Der er en demotilstand uden API-nøgler.',
    c3_h: 'Flere AI-agenter i Claude Code',
    c3_role: 'Egen automatisering',
    c3_p: 'Jeg satte et system op, hvor flere AI-agenter arbejdede på samme tid med at samle over 1.000 jobopslag fra Jobindex og Jobbank og sortere dem efter faste regler. Én agent holdt øje med, at de andre kørte, og én fjernede dubletter. Jeg tjekkede resultatet mod de originale opslag, før jeg brugte det.',
    c3_t1: 'AI-agenter',
    c3_t2: 'Tjek af resultatet',
    p1_h: 'P1: Sociale arrangementer på AAU CPH',
    p1_role: '1. semesterprojekt, gruppe på syv, karakter 10',
    p1_p: 'Et program i C, der giver et overblik over arrangementer for studerende på AAU i København. Det læser arrangementer fra en tekstfil ind i structs, sorterer dem efter tid og pris med qsort, filtrerer på kategori og alkohol, søger på titel og kan tilføje nye arrangementer.',
    p1_t: 'Filindlæsning',
    c1_h: 'Superliga SQL-database',
    c1_role: 'Gymnasieprojekt i Informatik C, gruppe på to, karakter 12',
    c1_p: 'En relationel database med data fra Superligaen med ni tabeller, et ER-diagram og normalisering til 3. normalform samt SQL-forespørgsler med joins, gruppering og aggregering.',
    h_xp: 'Hvor jeg har arbejdet',
    j3_h: 'Kasseassistent',
    j3_p: 'Betjente kunder ved kassen og genstartede Dankort-terminalen ved fejl, så kunderne hurtigt kunne betale igen.',
    j2_h: 'Sælger, elektronik',
    j2_p: 'Rådgav kunder om computere, telefoner og TV, hjalp med basal fejlfinding og henviste dem til servicecenteret, når det var nødvendigt. Brugte SAP til vareopslag og lagerstatus.',
    now: 'nu',
    j1_h: 'Lukkeansvarlig og sælger, elektronik',
    j1_p: 'Har lukkeansvar og er med til at oplære nye kolleger i produkter, arbejdsgange og kundeservice. Deltid ved siden af studiet.',
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
    s6_h: 'Support og IT',
    s6_1: 'Fejlfinding',
    s6_2: 'Opsætning af enheder',
    s5_h: 'AI og automatisering',
    h_certs: 'Ti certifikater i 2026',
    f_all: 'Alle',
    b_data: 'Data',
    b_code: 'Programmering',
    b_sec: 'Sikkerhed',
    b_ux: 'UX',
    b_ai: 'AI',
    b_team: 'Samarbejde',
    d_sep23: '23. sep. 2026',
    d_jul15: '15. jul. 2026',
    d_jun24: '24. jun. 2026',
    d_jun23: '23. jun. 2026',
    d_mar30: '30. mar. 2026',
    d_mar9: '9. mar. 2026',
    d_jan25: '25. jan. 2026',
    certs_more: 'Se dem på LinkedIn',
    h_edu: 'Min vej indtil nu',
    e2_y: 'Næste',
    e2_h: 'Kandidat i cybersikkerhed, mit mål',
    e2_s: 'Jeg deltager jævnligt i Hacking Evening med CyberSkills og PROSA på AAU i København.',
    e1_h: 'Bachelor (BSc) i teknisk videnskab (software)',
    e1_s: '3. semester, forventet færdig i juni 2028. Fag som Databaser og softwarearkitektur, Systemudvikling og Internetværk og web-programmering.',
    e1_g: 'Gennemsnit 8,0 / 12',
    e3_s: 'Gymnasial uddannelse. Mit Superliga-databaseprojekt i Informatik C fik 12.',
    contact_k: 'Tak, fordi du kiggede med.',
    h_contact: '<span class="ln"><span>Lad os tage</span></span> <span class="ln"><span>en snak</span></span>',
    contact_p: 'Jeg søger et studiejob på 10 til 15 timer om ugen i Storkøbenhavn, inden for softwareudvikling, test, data, IT-support, cybersikkerhed eller AI og automatisering. Den hurtigste vej til mig er en mail.',
    c_mail: 'Mail',
    copy: '© 2026 Yasir Lokman Teksen',
    foot: 'København',
    to_top: 'Til toppen',
    g_cap: 'Versalhøjde',
    g_x: 'x-højde',
    g_base: 'Grundlinje',
    see_proj: 'Se projektet',
    f_c2: 'ca. 40',
    fl_c2: 'studenterformidlere',
    f_m1: '6.236',
    fl_m1: 'vers i Koranen, den kan genkende',
    f_a: '94',
    fl_a: 'svar på spørgeskemaet',
    f_c3: '1.000+',
    fl_c3: 'jobopslag samlet',
    f_p1: 'C',
    fl_p1: 'skrevet i C med structs og qsort',
    f_c1: '9',
    fl_c1: 'tabeller, normaliseret til 3NF',
    more: 'Læs mere',
    hero_role: 'Softwarestuderende på Aalborg Universitet i København, på 3. semester.',
    n1s: 'i karakter for AAU CPH Events, mit 2. semesterprojekt',
    n2s: 'certifikater i 2026',
    n3s: 'år i Bilka',
    x_short: 'Selvbetjeningskiosker og online bestilling, brugt hver dag på en restaurant i Greve.',
    n_short: 'En beredskabsapp, der gør familien og snart naboerne klar til de første tre døgn af en krise.',
    w_short: 'Én plan for arbejde, studie og træning, der lægger sig om, når noget flytter sig.',
    sk1: 'Apps og web',
    sk2: 'Data og databaser',
    sk3: 'Cloud, hosting og Git',
    sk3_dns: 'DNS-opsætning',
    sk4: 'Test og brugere',
    sk5: 'IT-support',
    sk6: 'AI og automatisering',
    used_in: 'Brugt i',
    g12: 'Karakter 12',
    cd_c2: 'Tilmeldinger, timer og notifikationer for studenterformidlere. Jeg har ansvaret for backend-strukturen.',
    cd_m1: 'Live undertekster til fredagsprædikenen på dansk og tyrkisk.',
    cd_a: 'Find, filtrér, gem og tilmeld dig studiearrangementer.',
    cd_c3: 'AI-agenter, der samlede og sorterede jobopslag.',
    cd_p1: 'Et C-program, der sorterer, filtrerer og søger i arrangementer.',
    cd_c1: 'En Superliga-database med joins, gruppering og aggregering.',
    st_now: 'I gang',
    g10: 'Karakter 10',
    close_more: 'Luk',
    contact_p1: 'Jeg søger et studiejob på 10 til 15 timer om ugen i Storkøbenhavn inden for:',
    contact_p2: 'Den hurtigste vej til mig er en mail.',
    jr_fk: 'Avisomdeler',
    jr_sp: 'Skolepraktik',
    jr_bk: 'Bilka Waves, Greve',
    jr_lt: 'Avisomdeler, familievirksomhed',
    ar1: 'Softwareudvikling',
    ar2: 'Test',
    ar3: 'Data',
    ar4: 'IT-support',
    ar5: 'Cybersikkerhed',
    ar6: 'AI og automatisering'
  };

  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    EN[el.dataset.i18n] = EN[el.dataset.i18n] ?? el.innerHTML;
  });

  let lang = 'en';
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.title = l === 'da' ? 'Yasir Lokman Teksen, softwarestuderende' : 'Yasir Lokman Teksen, software student';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = l === 'da' ? (DA[el.dataset.i18n] ?? EN[el.dataset.i18n]) : EN[el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('#l-en,#l2-en').forEach(e => e.classList.toggle('on', l === 'en'));
    document.querySelectorAll('#l-da,#l2-da').forEach(e => e.classList.toggle('on', l === 'da'));
    document.dispatchEvent(new CustomEvent('langchange'));
  }
  document.querySelectorAll('#langbtn,#langbtn2').forEach(b =>
    b.addEventListener('click', () => {
      const next = lang === 'en' ? 'da' : 'en';
      setLang(next);
      try { localStorage.setItem('lang', next); } catch (e) {}
    }));

  /* stored choice beats browser locale; a Danish device or a Copenhagen clock reads as a Danish visitor */
  let storedLang = null; try { storedLang = localStorage.getItem('lang'); } catch (e) {}
  if (storedLang === 'da') setLang('da');
  else if (storedLang !== 'en') {
    const langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (langs.includes('da') || tz === 'Europe/Copenhagen') setLang('da');
  }
  document.documentElement.classList.remove('da-wait');

  /* the tab title takes turns between a few short lines, every 4 seconds; search engines and test tools keep the plain title */
  if (!/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) {
    const titles = ['Yasir Lokman Teksen', 'Software student', 'Open to student jobs', 'Kvixa, Nabolys, Weft'];
    let ti = 0;
    document.title = titles[0];
    setInterval(() => { ti = (ti + 1) % titles.length; document.title = titles[ti]; }, 4000);
  }

  /* ---------- theme (the script in <head> set the attribute before first paint) ---------- */
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

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobile');
  function toggleMenu(open) {
    burger.classList.toggle('open', open);
    mobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', () => toggleMenu(!mobile.classList.contains('open')));
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- the current section in the nav ---------- */
  const links = [...document.querySelectorAll('.navlinks a[href^="#"], .mobile a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  ['about', 'work', 'experience', 'skills', 'certificates', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean).forEach(t => spy.observe(t));
})();

/* ---------- GoatCounter events: which contact links and certificates people open ----------
   count.js loads a second after the page, so it never competes with the first screen; it skips
   localhost, and until it is there this quietly does nothing */
(function () {
  const counter = () => setTimeout(() => {
    const s = document.createElement('script');
    s.dataset.goatcounter = 'https://teksen42.goatcounter.com/count';
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    document.body.append(s);
  }, 1000);
  if (document.readyState === 'complete') counter(); else addEventListener('load', counter, { once: true });
})();
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
  else if (h.includes('kvixa') || h.includes('weft.azurewebsites') || h.includes('nabolys.azurewebsites')) track('click-' + new URL(a.href).hostname, 'Clicked ' + new URL(a.href).hostname);
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
    const b = c.querySelector('.by'), dt = c.querySelector('.date');
    by.textContent = b && dt ? b.textContent + ', ' + dt.textContent : '';
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
