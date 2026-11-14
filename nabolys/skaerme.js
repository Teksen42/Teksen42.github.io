// "Se appen" på forsiden: faner, én telefon med faste skærmbilleder, knappen "Slå nettet fra" og en lille besked nederst i telefonen.
// Intet gemmes eller sendes. Ligger i <head> uden defer, så lytteren til manglende billeder er sat, før billederne hentes:
// mangler et skærmbillede (fx før scripts/screenshots.mjs er kørt), viser rammen skærmens navn i stedet for et ødelagt billede.
(function () {
  'use strict';

  /* De to skærme, nettet skifter imellem: familiens samtale over nettet, og den samme samtale efter nettet forsvandt. */
  var ONLINE = 'familie-chat';
  var OFFLINE = 'bluetooth-chat';
  var TOAST_MS = 2200;

  /* Skærme uden egen fane (man når dem ved et tryk i telefonen): den fane, der lyser imens. */
  function tabFor(name) {
    if (name === 'ok') { return 'hjem'; }
    if (/^svar-/.test(name)) { return ONLINE; }
    return name;
  }

  /* Skærme, hvor det nyeste står nederst: samtalen uden net, og samtalen efter et hurtigt svar. */
  function newestAtBottom(name) {
    return name === OFFLINE || /^svar-/.test(name);
  }

  var TEXT = {
    da: {
      off: 'Uden net · beskeden går til telefonerne i nærheden',
      on: 'Nettet er tilbage · alle i familien får beskederne'
    },
    en: {
      off: 'No network · the message goes to the phones nearby',
      on: 'Network back · everyone in the family gets the messages'
    }
  };

  function lang() {
    return document.documentElement.lang === 'en' ? 'en' : 'da';
  }

  function markMissing(img) {
    if (!img || !img.closest || img.classList.contains('faner')) {
      return; // en menu, der mangler, skjules bare (display: none, til den får .on, og så er den tom)
    }
    var frame = img.closest('.screen') || img.closest('.shot');
    if (frame) {
      frame.classList.add('is-missing');
    }
  }

  function markLoaded(img) {
    var frame = img && img.closest ? img.closest('.screen') || img.closest('.shot') : null;
    if (frame) {
      frame.classList.remove('is-missing');
    }
  }

  // Fejl og indlæsning ved billeder bobler ikke, derfor capture. Kommer et billede alligevel (fx hentet sent, fordi det er lazy), fjernes mærket.
  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      markMissing(target);
    }
  }, true);
  document.addEventListener('load', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG' && target.naturalWidth > 0) {
      markLoaded(target);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    // Et billede, browseren allerede har opgivet (fx fra cachen), giver ingen ny fejl. Et lazy billede, der ikke er hentet endnu, siger
    // også "complete" uden bredde i nogle browsere, så det tælles ikke: fejler det senere, kommer fejlen ovenfor.
    var images = document.querySelectorAll('.shot img, .screen img');
    for (var i = 0; i < images.length; i++) {
      if (images[i].complete && images[i].naturalWidth === 0 && images[i].getAttribute('loading') !== 'lazy') {
        markMissing(images[i]);
      }
    }

    var proto = document.getElementById('proto');
    var tabs = document.getElementById('proto-tabs');
    var screens = document.getElementById('screens');
    var netswitch = document.getElementById('netswitch');
    var toast = document.getElementById('phone-toast');
    if (!proto || !tabs || !screens || !netswitch || !toast) {
      return;
    }

    var toastTimer = null;
    var current = proto.getAttribute('data-screen') || 'hjem';
    var HOT = window.NABOLYS_HOTSPOTS || {};

    // Navnet på en fane i det sprog, siden står i, til knappernes tekst for skærmlæsere.
    function tabName(name) {
      var span = tabs.querySelector('button[data-s="' + name + '"] span[data-l="' + lang() + '"]') ||
        screens.querySelector('.screen[data-s="' + name + '"] figcaption span[data-l="' + lang() + '"]');
      return span ? span.textContent : name;
    }

    // På en smal skærm står telefonen under listen: rul ned til den, når man vælger en skærm, så man ser, hvad der skete.
    var phone = document.getElementById('phone') || screens;
    function showPhone() {
      if (window.parent !== window) { var pr = phone.getBoundingClientRect(); window.parent.postMessage({ nbShowPhone: pr.top, nbPhoneH: pr.height }, location.origin); return; }
      var r = phone.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      if (r.top >= 0 && r.bottom <= h) { return; }
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      phone.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: r.height > h ? 'start' : 'center' });
    }

    function hotButton(to, box, unit) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hot';
      b.setAttribute('data-to', to);
      b.style.left = box.x + '%';
      b.style.top = box.y + '%';
      b.style.width = box.w + '%';
      b.style.height = box.h + '%';
      return b;
    }

    // Felter på selve skærmen: de ruller med billedet. Fanerne i menuen: de ligger fast nederst, oven på menuen.
    var all0 = screens.querySelectorAll('.screen');
    for (var a = 0; a < all0.length; a++) {
      var sName = all0[a].getAttribute('data-s');
      var body = all0[a].querySelector('.screen-body');
      var data = HOT[sName];
      if (!body || !data) { continue; }
      for (var hIdx = 0; hIdx < data.hot.length; hIdx++) {
        body.appendChild(hotButton(data.hot[hIdx].to, data.hot[hIdx]));
      }
    }
    var fanerHot = document.createElement('div');
    fanerHot.className = 'faner-hot';
    fanerHot.hidden = true;
    screens.appendChild(fanerHot);

    function labelHot() {
      var buttons = screens.querySelectorAll('.hot');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('aria-label', tabName(buttons[i].getAttribute('data-to')));
      }
    }

    function drawFanerHot(name) {
      var data = HOT[name];
      fanerHot.innerHTML = '';
      if (!data || !data.bar) { fanerHot.hidden = true; return; }
      fanerHot.hidden = false;
      fanerHot.style.height = (screens.clientWidth * data.bar.height / 390) + 'px';
      for (var key in data.tabs) {
        if (Object.prototype.hasOwnProperty.call(data.tabs, key)) {
          fanerHot.appendChild(hotButton(key, data.tabs[key]));
        }
      }
      labelHot();
    }

    // Fanen "Beskeder" i menuen viser samtalen med eller uden net, alt efter knappen.
    function target(to) {
      if (to === 'beskeder') { return current === OFFLINE || proto.getAttribute('data-net') === 'off' ? OFFLINE : ONLINE; }
      return to;
    }

    function scrollToNewest(screen) {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var run = function () {
        var top = screen.scrollHeight - screen.clientHeight;
        if (reduced || typeof screen.scrollTo !== 'function') {
          screen.scrollTop = top;
        } else {
          screen.scrollTo({ top: top, behavior: 'smooth' });
        }
      };
      if (window.requestAnimationFrame) { window.requestAnimationFrame(run); } else { run(); }
    }

    function hideToast() {
      clearTimeout(toastTimer);
      toast.classList.remove('on');
    }

    function showToast(text) {
      toast.textContent = text;
      toast.classList.add('on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, TOAST_MS);
    }

    function go(name) {
      if (!screens.querySelector('.screen[data-s="' + name + '"]')) {
        return;
      }
      current = name;
      proto.setAttribute('data-screen', name);
      // Lys eller mørk statuslinje, som skærmbilledet er øverst (data-bar sættes af scripts/screenshots.mjs).
      var active = screens.querySelector('.screen[data-s="' + name + '"] img');
      proto.setAttribute('data-bar', (active && active.getAttribute('data-bar')) || 'light');
      proto.setAttribute('data-foot', (active && active.getAttribute('data-foot')) || 'light');
      var off = name === OFFLINE;
      proto.setAttribute('data-net', off ? 'off' : 'on');
      netswitch.setAttribute('aria-pressed', off ? 'true' : 'false');

      var items = tabs.querySelectorAll('li');
      var lit = tabFor(name);
      for (var j = 0; j < items.length; j++) {
        var button = items[j].querySelector('button[data-s]');
        var on = !!button && button.getAttribute('data-s') === lit;
        items[j].classList.toggle('on', on);
        if (button) {
          button.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
      }
      var all = screens.querySelectorAll('.screen');
      for (var k = 0; k < all.length; k++) {
        var on = all[k].getAttribute('data-s') === name;
        all[k].classList.toggle('on', on);
        if (on) {
          all[k].scrollTop = 0; // en ny skærm starter øverst
          if (newestAtBottom(name)) {
            // Samtalen uden net (»Nettet er væk her …«, at en telefon i nærheden hentede den, og Bos svar) eller Annes hurtige svar: nederst.
            scrollToNewest(all[k]);
          }
        }
      }
      // Appens menu nederst: den hører til skærmen og ligger fast, mens indholdet rulles.
      var bars = screens.querySelectorAll('.faner');
      for (var m = 0; m < bars.length; m++) {
        bars[m].classList.toggle('on', bars[m].getAttribute('data-for') === name);
      }
      drawFanerHot(name);
    }

    tabs.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button[data-s]') : null;
      if (button) {
        hideToast();
        go(button.getAttribute('data-s'));
        showPhone();
      }
    });

    screens.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button.hot') : null;
      if (button) {
        hideToast();
        go(target(button.getAttribute('data-to')));
      }
    });
    window.addEventListener('resize', function () { drawFanerHot(current); });
    document.addEventListener('nabolys:lang', labelHot);

    netswitch.addEventListener('click', function () {
      var goingOff = current !== OFFLINE;
      go(goingOff ? OFFLINE : ONLINE);
      showToast(TEXT[lang()][goingOff ? 'off' : 'on']);
    });

    // Sproget skiftes, mens beskeden står der: så skiftes den med.
    document.addEventListener('nabolys:lang', function () {
      if (toast.classList.contains('on')) {
        toast.textContent = TEXT[lang()][current === OFFLINE ? 'off' : 'on'];
      }
    });

    go(current);
  });
})();
