// Sprogvalget på landingssiden. Siden er dansk som standard, og begge sprog står i HTML'en (data-l="da" og data-l="en");
// site.css viser kun det sprog, <html lang> siger. Sidens andre scripts: waitlist.js, skaerme.js og liste.js.
//
// Det ligger i <head> uden defer, så et gemt valg (engelsk) sættes, før siden tegnes, og der ikke blinker dansk først.
// Valget huskes i localStorage. Kan browseren ikke gemme (privat tilstand, blokeret lager), gælder valget kun, til siden lukkes.
(function () {
  'use strict';

  var KEY = 'nabolys-sprog';
  var LANGS = ['da', 'en'];
  var root = document.documentElement;
  root.classList.add('js');

  function known(lang) {
    return LANGS.indexOf(lang) >= 0;
  }

  function saved() {
    try {
      var value = window.localStorage.getItem(KEY);
      return known(value) ? value : null;
    } catch (e) {
      return null;
    }
  }

  function remember(lang) {
    try {
      window.localStorage.setItem(KEY, lang);
    } catch (e) {
      // Ingen lagring: valget gælder kun nu.
    }
  }

  function apply(lang) {
    root.lang = lang;
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-set-lang') === lang ? 'true' : 'false');
    }
    // Alt-tekst kan ikke stå to gange i ét billede, så den skiftes her. Uden script er den dansk.
    var images = document.querySelectorAll('img[data-alt-' + lang + ']');
    for (var j = 0; j < images.length; j++) {
      images[j].setAttribute('alt', images[j].getAttribute('data-alt-' + lang));
    }
    // Tekst, scripts selv skriver (3-døgnslisten, beskeden i telefonen), tegnes om på det nye sprog.
    try {
      document.dispatchEvent(new CustomEvent('nabolys:lang', { detail: lang }));
    } catch (e) {
      // En gammel browser uden CustomEvent: teksten skifter ved næste tegning.
    }
  }

  var initial = saved();
  if (initial) {
    root.lang = initial;
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(known(root.lang) ? root.lang : 'da');

    document.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('[data-set-lang]') : null;
      if (!button) {
        return;
      }
      var lang = button.getAttribute('data-set-lang');
      if (!known(lang)) {
        return;
      }
      apply(lang);
      remember(lang);
    });
  });
})();
