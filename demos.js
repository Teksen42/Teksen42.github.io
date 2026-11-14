/* The things you can try on the page. Plain JavaScript, nothing is stored or sent anywhere. */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const isDa = () => document.documentElement.lang === 'da';
  const say = (da, en) => (isDa() ? da : en);
  const num = (n, d) => n.toLocaleString(isDa() ? 'da-DK' : 'en-GB', { maximumFractionDigits: d === undefined ? 1 : d });
  const clock = () => { const t = new Date(); return String(t.getHours()).padStart(2, '0') + (isDa() ? '.' : ':') + String(t.getMinutes()).padStart(2, '0'); };
  const reRender = [];
  document.addEventListener('langchange', () => reRender.forEach(f => f()));

  /* ---------- Nabolys: "Se appen" from nabolys.azurewebsites.net, the same page shown in a frame ---------- */
  const nbFrame = $('#nb-frame');
  if (nbFrame) {
    const nbSend = () => { if (nbFrame.contentWindow) nbFrame.contentWindow.postMessage({ nb: 'setup', lang: isDa() ? 'da' : 'en', vh: innerHeight }, location.origin); };
    nbFrame.addEventListener('load', nbSend);
    addEventListener('resize', nbSend);
    reRender.push(nbSend);
    addEventListener('message', ev => {
      if (ev.origin !== location.origin || !ev.data) return;
      if (ev.data.nbHeight) nbFrame.style.height = ev.data.nbHeight + 'px';
      // On a phone the list sits above the phone: scroll the page down to the phone when a screen is picked.
      if (typeof ev.data.nbShowPhone === 'number') {
        const top = nbFrame.getBoundingClientRect().top + ev.data.nbShowPhone;
        const h = ev.data.nbPhoneH || 0;
        if (top >= 0 && top + h <= innerHeight) return;
        // Wait until the frame has its new height (the list changes when a screen is picked), or the scroll is cut short.
        const y = scrollY + top - Math.max(12, (innerHeight - h) / 2);
        setTimeout(() => scrollTo({ top: y, behavior: 'auto' }), 120);
      }
    });
    nbSend();
  }

  /* ---------- Nabolys: the whole three-day list, with the same rules and numbers as in the app ---------- */
  const SOURCES = {
    samsik: 'Styrelsen for Samfundssikkerhed',
    fvst: 'Fødevarestyrelsen',
    nb: 'Nationalbanken'
  };
  const FOOD = [
    { k: 'knaekbroed', g: 500, da: 'Knækbrød', en: 'Crispbread' },
    { k: 'fisk-og-koed', g: 300, da: 'Fisk eller kød på dåse (fx makrel i tomat)', en: 'Tinned fish or meat (such as mackerel in tomato)' },
    { k: 'baelgfrugter', g: 300, da: 'Bælgfrugter på dåse (kikærter, bønner)', en: 'Tinned pulses (chickpeas, beans)' },
    { k: 'groentsager', g: 1500, da: 'Grøntsager på dåse eller glas', en: 'Tinned or jarred vegetables' },
    { k: 'pasta-og-ris', g: 500, da: 'Pasta eller couscous', en: 'Pasta or couscous' },
    { k: 'gryn', g: 500, da: 'Gryn (fx havregryn)', en: 'Oats and similar grains' },
    { k: 'noedder', g: 100, da: 'Nødder', en: 'Nuts' }
  ];
  const WATER_PER_DAY = 3, DAYS = 3, CASH = 250;
  const hh = { adults: 2, children: 2, infants: 0, pets: 0, medicine: false };
  const FIELDS = [
    { k: 'adults', da: 'Voksne', en: 'Adults' },
    { k: 'children', da: 'Børn', en: 'Children' },
    { k: 'infants', da: 'Småbørn under 3', en: 'Small children under 3' },
    { k: 'pets', da: 'Kæledyr', en: 'Pets' }
  ];
  const weight = g => (g >= 1000 ? num(g / 1000) + ' kg' : num(g, 0) + ' g');

  /* the list in the app's order and groups. Every line says what it is based on. */
  function needs() {
    const persons = Math.max(1, hh.adults + hh.children + hh.infants);
    const eaters = Math.max(1, hh.adults + hh.children);
    const infantNote = hh.infants > 0 ? say(' Småbørn er regnet med som personer, og det er Nabolys’ egen tolkning.', ' Small children are counted as people, which is Nabolys’ own reading.') : '';
    const stk = n => `${n} ${say('stk.', 'pcs')}`;
    const noAmount = say('uden mængde', 'no amount');
    return {
      persons, eaters,
      groups: [
        { k: 'vand', name: say('Vand', 'Water'), src: SOURCES.samsik, rows: [
          { k: 'vand', q: WATER_PER_DAY * persons * DAYS, show: `${num(WATER_PER_DAY * persons * DAYS, 0)} ${say('liter', 'litres')}`, name: say('Drikkevand', 'Drinking water'),
            note: say('3 liter pr. person pr. døgn til at drikke og evt. lave mad.', '3 litres per person per day for drinking and any cooking.') + infantNote + (hh.pets > 0 ? say(' Kæledyr skal have vand ud over dette.', ' Pets need water on top of this.') : '') }
        ] },
        { k: 'mad', name: say('Mad', 'Food'), src: SOURCES.fvst, intro: say('Fødevarestyrelsens eksempel pr. person til tre dage.', 'The Food Administration’s example per person for three days.'), rows: [
          ...FOOD.map(f => ({ k: f.k, q: f.g * eaters, show: weight(f.g * eaters), name: isDa() ? f.da : f.en, note: say(`ca. ${weight(f.g)} pr. person`, `about ${weight(f.g)} per person`) })),
          { k: 'olie', q: null, show: noAmount, name: say('Olie og smagsgivere', 'Oil and seasoning') },
          ...(hh.infants > 0 ? [{ k: 'babymad', q: null, show: noAmount, own: true, name: say('Modermælkserstatning og babymad', 'Infant formula and baby food'), note: say('Ingen officiel mængde. Forslag: barnets dagsforbrug × 3 døgn.', 'No official amount. Suggestion: what the child uses in a day × 3 days.') }] : [])
        ] },
        { k: 'kogning', name: say('Kogning', 'Cooking'), src: SOURCES.samsik, rows: [
          { k: 'kogeudstyr', q: 1, show: stk(1), name: say('Mulighed for at koge vand uden strøm', 'A way to boil water without power'), note: say('Fx stormkøkken eller grill. Aldrig indendørs.', 'Such as a camping stove or a grill. Never indoors.') }
        ] },
        { k: 'medicin', name: say('Medicin og førstehjælp', 'Medicine and first aid'), src: SOURCES.samsik, rows: [
          ...(hh.medicine ? [{ k: 'medicin', q: DAYS, show: `${DAYS} ${say('døgn', 'days')}`, name: say('Nødvendig medicin', 'Necessary medicine'), note: say('Medicin til mindst 3 døgn.', 'Medicine for at least 3 days.') }] : []),
          { k: 'smertestillende', q: 1, show: say('1 pakke', '1 pack'), name: say('Smertestillende og febernedsættende', 'Painkillers and fever reducers'), note: say('Fra myndighedernes Beredskabsberegner.', 'From the authorities’ preparedness calculator.') },
          { k: 'foerstehjaelp', q: 1, show: stk(1), name: say('Førstehjælpskasse', 'First aid kit') },
          { k: 'jodtabletter', q: null, show: noAmount, name: say('Jodtabletter', 'Iodine tablets'), note: say('Anbefales til personer under 40 år samt gravide og ammende.', 'Recommended for people under 40 and for pregnant and breastfeeding women.') }
        ] },
        { k: 'hygiejne', name: say('Hygiejne', 'Hygiene'), src: SOURCES.samsik, rows: [
          { k: 'hygiejne', q: 1, show: stk(1), name: say('Hygiejne (toiletpapir, håndsprit, vådservietter, bind)', 'Hygiene (toilet paper, hand sanitiser, wet wipes, sanitary pads)'), note: say('Nævnt uden mængde. Appen regner med mindst én ting.', 'Mentioned with no amount. The app counts at least one item.') },
          ...(hh.infants > 0 ? [{ k: 'bleer', q: null, show: noAmount, own: true, name: say('Bleer', 'Nappies'), note: say('Ingen officiel mængde. Forslag: barnets dagsforbrug × 3 døgn.', 'No official amount. Suggestion: what the child uses in a day × 3 days.') }] : [])
        ] },
        { k: 'varme', name: say('Varme og lys', 'Warmth and light'), src: SOURCES.samsik, rows: [
          { k: 'varme', q: persons, show: `${persons} ${say('sæt', persons === 1 ? 'set' : 'sets')}`, own: true, name: say('Tæpper og varmt tøj', 'Blankets and warm clothes'), note: say('Tæpper, dyner og varmt tøj er nævnt officielt. 1 sæt pr. person er Nabolys’ forslag.', 'Blankets, duvets and warm clothes are mentioned officially. 1 set per person is Nabolys’ suggestion.') },
          { k: 'lommelygte', q: 1, show: stk(1), name: say('Lommelygte', 'Torch') }
        ] },
        { k: 'stroem', name: say('Strøm og information', 'Power and information'), src: SOURCES.samsik, rows: [
          { k: 'batterier', q: 1, show: say('1 sæt', '1 set'), name: say('Batterier til lygte og radio', 'Batteries for torch and radio') },
          { k: 'powerbank', q: 1, show: stk(1), name: say('Powerbank eller batteripakke', 'Power bank or battery pack') },
          { k: 'radio', q: 1, show: stk(1), name: say('FM-radio med batteri, håndsving eller solceller', 'FM radio with battery, hand crank or solar cells'), note: say('Eller en bilradio.', 'Or a car radio.') }
        ] },
        { k: 'penge', name: say('Penge', 'Money'), src: SOURCES.nb, rows: [
          { k: 'kontanter', q: CASH * persons, show: `${num(CASH * persons, 0)} kr.`, name: say('Kontanter i små sedler og mønter', 'Cash in small notes and coins'), note: say('Nationalbankens pejlemærke: 250 kr. pr. person.', 'The National Bank’s guide: 250 kr. per person.') + infantNote },
          { k: 'betalingskort', q: 2, show: stk(2), name: say('Fysiske betalingskort (husk pinkoden)', 'Physical payment cards (remember the PIN)'), note: say('Mindst 2 pr. husstand af forskellige mærker.', 'At least 2 per household, of different brands.') }
        ] },
        ...(hh.pets > 0 ? [{ k: 'dyr', name: say('Kæledyr', 'Pets'), src: SOURCES.samsik, rows: [
          { k: 'kaeledyr', q: null, show: noAmount, name: say('Mad og vand til kæledyr', 'Food and water for pets'), note: say('Nævnt uden mængde. Beregn dyrenes eget dagsforbrug.', 'Mentioned with no amount. Work out what the animals use in a day.') }
        ] }] : [])
      ]
    };
  }

  function drawCalc() {
    $('#steppers').innerHTML = FIELDS.map(f => `
      <div class="stepper">
        <span class="st-name" id="st-${f.k}">${isDa() ? f.da : f.en}</span>
        <div class="st-ctl" role="group" aria-labelledby="st-${f.k}">
          <button type="button" data-k="${f.k}" data-d="-1" aria-label="${say('Færre', 'Fewer')}" ${hh[f.k] === 0 || (f.k !== 'pets' && hh.adults + hh.children + hh.infants <= 1) ? 'disabled' : ''}>−</button>
          <output>${hh[f.k]}</output>
          <button type="button" data-k="${f.k}" data-d="1" aria-label="${say('Flere', 'More')}" ${hh[f.k] >= 12 ? 'disabled' : ''}>+</button>
        </div>
      </div>`).join('') + `
      <label class="st-check"><input type="checkbox" id="st-medicine" ${hh.medicine ? 'checked' : ''}><span>${say('Nogen har brug for fast medicin', 'Someone needs regular medicine')}</span></label>`;
    const n = needs();
    const water = WATER_PER_DAY * n.persons * DAYS;
    const food = FOOD.reduce((a, f) => a + f.g, 0) * n.eaters;
    $('#calc-out').innerHTML = `
      <div class="big3">
        <div><strong>${num(water, 0)} <small>${say('liter', 'litres')}</small></strong><span>${say('drikkevand', 'drinking water')}</span></div>
        <div><strong>${weight(food).replace(' ', ' <small>')}</small></strong><span>${say('holdbar mad', 'food that keeps')}</span></div>
        <div><strong>${num(CASH * n.persons, 0)} <small>kr.</small></strong><span>${say('i kontanter', 'in cash')}</span></div>
      </div>`;
    $('#calc-list').innerHTML = `
      <div class="calc-groups">${n.groups.map(g => `
        <section class="calc-group">
          <h4><span>${g.name}</span><em>${g.src}</em></h4>
          ${g.intro ? `<p class="calc-intro">${g.intro}</p>` : ''}
          <ul class="calc-list">${g.rows.map(r => `
            <li data-k="${r.k}" data-q="${r.q === null ? '' : r.q}">
              <div class="cl-top"><span>${r.name}</span><b>${r.show}</b></div>
              ${r.own ? `<p class="cl-own">${say('Forslag fra Nabolys', 'Suggestion from Nabolys')}</p>` : ''}
              ${r.note ? `<p class="cl-note">${r.note}</p>` : ''}
            </li>`).join('')}</ul>
        </section>`).join('')}</div>`;
  }
  $('#steppers').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b || b.disabled) return;
    hh[b.dataset.k] = Math.max(0, hh[b.dataset.k] + +b.dataset.d);
    const k = b.dataset.k, d = b.dataset.d;
    drawCalc();
    const again = $(`#steppers button[data-k="${k}"][data-d="${d}"]`);
    if (again && !again.disabled) again.focus();
    else { const other = $(`#steppers button[data-k="${k}"]:not([disabled])`); if (other) other.focus(); }
  });
  $('#steppers').addEventListener('change', e => {
    if (e.target.id !== 'st-medicine') return;
    hh.medicine = e.target.checked;
    drawCalc();
    $('#st-medicine').focus();
  });
  drawCalc();
  reRender.push(drawCalc);
  const calcToggle = $('#calc-toggle');
  const calcFull = $('#calc-full');
  function drawToggle() {
    const open = !calcFull.hidden;
    calcToggle.setAttribute('aria-expanded', open);
    calcToggle.innerHTML = `${open ? say('Skjul listen', 'Hide the list') : say('Se hele listen', 'See the full list')}<i aria-hidden="true"></i>`;
  }
  calcToggle.addEventListener('click', () => { calcFull.hidden = !calcFull.hidden; drawToggle(); });
  drawToggle();
  reRender.push(drawToggle);

  /* ---------- Weft: a small planner. What is fixed stays, the rest finds the next free time ---------- */
  const START = 8, END = 22, GAP = 0.5;
  const planState = { shift: false, cancel: false };
  const SCEN = [
    { k: 'shift', da: 'Vagten rykkes til kl. 12', en: 'The shift moves to 12:00' },
    { k: 'cancel', da: 'Forelæsningen bliver aflyst', en: 'The lecture is cancelled' }
  ];
  const ITEMS = {
    lecture: { kind: 'study', da: 'Forelæsning', en: 'Lecture' },
    study: { kind: 'study', da: 'Selvstudie', en: 'Self study' },
    train: { kind: 'train', da: 'Træning', en: 'Training' },
    shift: { kind: 'work', da: 'Vagt', en: 'Shift' }
  };
  function schedule(st) {
    const placed = [];
    if (!st.cancel) placed.push({ id: 'lecture', from: 9, to: 11 });
    placed.push(st.shift ? { id: 'shift', from: 12, to: 17 } : { id: 'shift', from: 16, to: 21 });
    const free = (from, len) => placed.every(p => from + len + GAP <= p.from || from >= p.to + GAP);
    [{ id: 'study', len: 2, from: 9 }, { id: 'train', len: 1, from: 14.5 }].forEach(f => {
      let t = f.from;
      while (t + f.len <= END && !free(t, f.len)) t += GAP;
      placed.push({ id: f.id, from: t, to: t + f.len });
    });
    return placed;
  }
  const hhmm = v => `${String(Math.floor(v)).padStart(2, '0')}${isDa() ? '.' : ':'}${v % 1 ? '30' : '00'}`;
  let lastPlan = schedule(planState);
  const day = $('#plan-day');
  function drawHours() {
    let h = '';
    for (let t = START; t <= END; t += 2) h += `<span class="hr" style="top:${((t - START) / (END - START)) * 100}%">${hhmm(t)}</span>`;
    $$('.hr', day).forEach(n => n.remove());
    day.insertAdjacentHTML('afterbegin', h);
  }
  Object.keys(ITEMS).forEach(id => {
    const el = document.createElement('div');
    el.className = `blk ${ITEMS[id].kind}`;
    el.dataset.id = id;
    day.appendChild(el);
  });
  function drawPlan(moved) {
    drawHours();
    const now = schedule(planState);
    $$('.blk', day).forEach(el => {
      const it = now.find(p => p.id === el.dataset.id);
      el.classList.toggle('gone', !it);
      const base = ITEMS[el.dataset.id];
      if (it) {
        el.style.top = ((it.from - START) / (END - START)) * 100 + '%';
        el.style.height = `calc(${((it.to - it.from) / (END - START)) * 100}% - 3px)`;
        el.innerHTML = `<b>${isDa() ? base.da : base.en}</b><span>${hhmm(it.from)}–${hhmm(it.to)}</span>`;
        el.classList.toggle('moved', !!moved && moved.includes(el.dataset.id));
      }
    });
    $('#plan-btns').innerHTML = SCEN.map(s => `<button type="button" data-k="${s.k}" aria-pressed="${planState[s.k]}">${isDa() ? s.da : s.en}</button>`).join('');
  }
  function planMessage(moved) {
    const names = moved.map(id => (isDa() ? ITEMS[id].da : ITEMS[id].en));
    const list = names.length > 1 ? names.slice(0, -1).join(', ') + say(' og ', ' and ') + names[names.length - 1] : names[0];
    $('#plan-msg').textContent = names.length
      ? say(`${list} fandt selv en ny plads.`, `${list} found a new place by itself.`)
      : say('Her skulle resten ikke flyttes.', 'Nothing else had to move this time.');
  }
  $('#plan-btns').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    const k = b.dataset.k;
    planState[k] = !planState[k];
    const next = schedule(planState);
    const flex = ['study', 'train'];
    const moved = flex.filter(id => {
      const a = lastPlan.find(p => p.id === id), c = next.find(p => p.id === id);
      return a && c && a.from !== c.from;
    });
    lastPlan = next;
    drawPlan(moved);
    planMessage(moved);
    $(`#plan-btns button[data-k="${k}"]`).focus();
  });
  drawPlan();
  $('#plan-msg').textContent = '';
  reRender.push(() => { drawPlan(); $('#plan-msg').textContent = ''; });

  /* ---------- Kvixa: kiosk, counter screen and TV, with the same steps as the real system.
     New > Received > Ready > Handed over. An order leaves both screens only when it is handed over. ---------- */
  const MENU = [
    { id: 'burger', price: 79, da: 'Cheeseburger', en: 'Cheeseburger' },
    { id: 'hotdog', price: 45, da: 'Hotdog', en: 'Hot dog' },
    { id: 'fries', price: 32, da: 'Pommes frites', en: 'French fries' },
    { id: 'shake', price: 39, da: 'Vanilje-shake', en: 'Vanilla shake' }
  ];
  const STEPS = {
    fresh: { band: '#c74a12', label: () => say('Ny, ikke modtaget', 'New, not received'), btn: () => say('Modtaget', 'Received'), next: 'busy' },
    busy: { band: '#46506a', label: () => say('Modtaget, i gang', 'Received, in progress'), btn: () => say('Klar', 'Ready'), next: 'ready' },
    ready: { band: '#1e7a45', label: () => say('Klar til udlevering', 'Ready for pickup'), btn: () => say('Udleveret', 'Handed over'), next: null }
  };
  const basket = {};
  let orders = [
    { no: 212, st: 'ready', items: { burger: 1 } },
    { no: 213, st: 'busy', items: { hotdog: 2, fries: 1 } },
    { no: 214, st: 'fresh', items: { burger: 1, fries: 1, shake: 1 } }
  ];
  let nextNo = 215;
  let kioskDone = null;
  let doneTimer;
  const count = () => Object.values(basket).reduce((a, b) => a + b, 0);
  const sum = () => MENU.reduce((a, m) => a + (basket[m.id] || 0) * m.price, 0);
  const nameOf = m => (isDa() ? m.da : m.en);

  function drawKiosk() {
    $('#kiosk-items').innerHTML = MENU.map(m => `
      <button type="button" class="kiosk-item" data-id="${m.id}">
        <img src="assets/demo/food-${m.id}.webp" alt="" width="123" height="110" loading="lazy">
        <span class="ki-name">${nameOf(m)}</span>
        <span class="ki-row"><span>${m.price} kr</span><i aria-hidden="true">${basket[m.id] ? basket[m.id] : '+'}</i></span>
      </button>`).join('');
    const n = count();
    $('#kiosk-sum').innerHTML = n ? `${n} ${n === 1 ? say('vare', 'item') : say('varer', 'items')} <b>${sum()} kr</b> <button type="button" id="kiosk-clear">${say('Ryd', 'Clear')}</button>` : say('Tryk på en ret', 'Tap a dish');
    const pay = $('#kiosk-pay');
    pay.textContent = say('Bestil', 'Order');
    pay.disabled = !n;
    const done = $('#kiosk-done');
    done.hidden = !kioskDone;
    if (kioskDone) {
      done.innerHTML = `
        <p class="kd-t">${say('Tak for din bestilling', 'Thank you for your order')}</p>
        <p class="kd-l">${say('Dit ordrenummer er', 'Your order number is')}</p>
        <p class="kd-n">${kioskDone}</p>
        <p class="kd-w">${say('Hold øje med skærmen. Vi kalder dit nummer, når maden er klar.', 'Keep an eye on the screen. We call your number when the food is ready.')}</p>
        <button type="button" id="kiosk-again">${say('Ny bestilling', 'New order')}</button>`;
    }
  }

  function drawCounter(scrollDown) {
    const box = $('#counter');
    const old = $('.tk-list', box);
    const top = old ? old.scrollTop : 0;
    const n = st => orders.filter(o => o.st === st).length;
    box.innerHTML = `<div class="counter-in">
      <div class="scr-top">
        <p class="scr-title">${say('Kasseskærm', 'Counter screen')}</p>
        <p class="scr-counts"><span style="background:${STEPS.fresh.band}">${n('fresh')} ${say('ny', 'new')}</span><span style="background:${STEPS.busy.band}">${n('busy')} ${say('i gang', 'in progress')}</span><span style="background:${STEPS.ready.band}">${n('ready')} ${say('klar', 'ready')}</span></p>
      </div>
      ${n('fresh') ? `<p class="scr-ring">${say('Ny ordre: tryk Modtaget', 'New order: tap Received')}</p>` : ''}
      <div class="tk-list" tabindex="0" aria-label="${say('Åbne ordrer', 'Open orders')}">${orders.length ? orders.map(o => {
        const s = STEPS[o.st];
        return `<div class="ticket${o.isNew ? ' fresh' : ''}">
          <b class="tk-no">${o.no}</b>
          <div class="tk-body">
            <span class="tk-state" style="background:${s.band}">${s.label()}</span>
            <span class="tk-lines">${MENU.filter(m => o.items[m.id]).map(m => `${o.items[m.id]} × ${nameOf(m)}`).join(', ')}</span>
          </div>
          <button type="button" data-no="${o.no}" style="background:${s.band}">${s.btn()}</button>
        </div>`;
      }).join('') : `<p class="scr-empty">${say('Ingen åbne ordrer lige nu.', 'No open orders right now.')}</p>`}</div>
    </div>`;
    orders.forEach(o => { delete o.isNew; });
    const list = $('.tk-list', box);
    list.scrollTop = scrollDown ? list.scrollHeight : top;
  }

  function drawTv(popped) {
    const nums = list => list.map(o => `<span class="${o.no === popped ? 'fresh' : ''}">${o.no}</span>`).join('');
    /* as on the real screen: the 6 newest being made and the 4 newest ready */
    const prep = orders.filter(o => o.st === 'fresh' || o.st === 'busy').slice(-6);
    const ready = orders.filter(o => o.st === 'ready').slice(-4);
    $('#tv').innerHTML = `
      <p class="tv-top">Byens Grill</p>
      <div class="tv-col prep"><h5>${say('Tilberedes', 'Being made')}</h5><div class="tv-nums">${nums(prep)}</div></div>
      <div class="tv-col done"><h5>${say('Er klar', 'Ready')}</h5><div class="tv-nums">${nums(ready)}</div></div>`;
  }
  function drawKv() { drawKiosk(); drawCounter(); drawTv(); }

  $('#kiosk-items').addEventListener('click', e => {
    const b = e.target.closest('.kiosk-item');
    if (!b) return;
    const id = b.dataset.id;
    basket[id] = (basket[id] || 0) + 1;
    drawKiosk();
    $(`.kiosk-item[data-id="${id}"]`).focus();
  });
  $('#kiosk-sum').addEventListener('click', e => {
    if (e.target.id !== 'kiosk-clear') return;
    Object.keys(basket).forEach(k => delete basket[k]);
    drawKiosk();
    $('#kiosk-pay').focus();
  });
  $('#kiosk-pay').addEventListener('click', () => {
    if (!count()) return;
    const no = nextNo++;
    orders.push({ no, st: 'fresh', isNew: true, items: { ...basket } });
    Object.keys(basket).forEach(k => delete basket[k]);
    kioskDone = no;
    clearTimeout(doneTimer);
    doneTimer = setTimeout(() => { kioskDone = null; drawKiosk(); }, 6000);
    drawKiosk();
    drawCounter(true);
    drawTv(no);
  });
  $('#kiosk-done').addEventListener('click', e => {
    if (e.target.id !== 'kiosk-again') return;
    clearTimeout(doneTimer);
    kioskDone = null;
    drawKiosk();
  });
  $('#counter').addEventListener('click', e => {
    const b = e.target.closest('button[data-no]');
    if (!b) return;
    const no = +b.dataset.no;
    const o = orders.find(x => x.no === no);
    const next = STEPS[o.st].next;
    if (next) o.st = next;
    else orders = orders.filter(x => x.no !== no);
    drawCounter();
    drawTv(next === 'ready' ? no : null);
    const again = $(`#counter button[data-no="${no}"]`);
    if (again) again.focus();
  });
  drawKv();
  reRender.push(drawKv);

  /* ---------- certificates: filter by subject ---------- */
  $('#cert-filter').addEventListener('click', e => {
    const b = e.target.closest('button[data-cat]');
    if (!b) return;
    $$('#cert-filter button').forEach(x => {
      x.classList.toggle('on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    $$('.cert').forEach(c => c.classList.toggle('off', !!b.dataset.cat && c.dataset.cat !== b.dataset.cat));
  });

  /* ---------- copy the e-mail address ---------- */
  const copyBtn = $('#copy-mail');
  let copied = false;
  const drawCopy = () => { copyBtn.textContent = copied ? say('Kopieret', 'Copied') : say('Kopiér', 'Copy'); };
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copyBtn.dataset.mail); } catch (e) { return; }
    copied = true;
    drawCopy();
    setTimeout(() => { copied = false; drawCopy(); }, 2200);
  });
  drawCopy();
  reRender.push(drawCopy);

})();
