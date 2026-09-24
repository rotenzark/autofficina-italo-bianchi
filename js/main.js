/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'autofficina-italo-bianchi', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['08:30', '12:30'], ['14:00', '18:00']],
      2: [['08:30', '12:30'], ['14:00', '18:00']],
      3: [['08:30', '12:30'], ['14:00', '18:00']],
      4: [['08:30', '12:30'], ['14:00', '18:00']],
      5: [['08:30', '12:30'], ['13:00', '17:00']],
      6: [['08:30', '13:00']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 2600,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.eti": "Autofficina Italo Bianchi · Via Ettore Ponti 53",
      "i.skip": "Skip",
      "m.top": "Autofficina Italo Bianchi, back to the top",
      "m.sub": "Garage",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.revisione": "Inspection",
      "n.officina": "Workshop",
      "n.usato": "Used cars",
      "n.comodita": "Convenience",
      "n.storia": "Since 1979",
      "n.recensioni": "Reviews",
      "n.orari": "Hours and how to get here",
      "n.domande": "Questions",
      "n.chiama": "Call",
      "n.menu": "Open the menu",
      "h.eti": "Autofficina Italo Bianchi · Via Ettore Ponti 53, Milan",
      "h.t": "When is your inspection due?",
      "h.p": "The board tells you: say whether the vehicle is new or has already been inspected, then the month and the year. And if you like, we'll do the inspection here: cars, motorbikes and scooters, by appointment.",
      "h.leg1": "The vehicle",
      "h.nuovo": "Never inspected: the first registration counts",
      "h.revisionato": "Already inspected: the last inspection counts",
      "h.mese": "Month",
      "h.anno": "Year",
      "h.regola": "Cars and motorbikes: the first inspection within four years of first registration, then every two years, by the end of the month. The registration document (carta di circolazione) is what counts; heavy vehicles and public-service vehicles are inspected every year.",
      "h.chiama": "Book: 02&nbsp;816648",
      "h.dove": "Get directions",
      "h.voto": "<b>4.7 on Google</b> · 502 reviews, and “inspection” is the word that comes up most",
      "rv.t": "Car and motorbike inspections.",
      "rv.p1": "Periodic ministry inspections (revisione) for cars, motorbikes and scooters, by appointment: you call, we fix the day and time, you bring the vehicle to Via Ettore Ponti.",
      "rv.p2": "And if something isn't right, the workshop is the same one: we fix it here, no need to look for another.",
      "rv.ct": "What gets checked",
      "rv.c1": "Brakes",
      "rv.c2": "Steering",
      "rv.c3": "Lights and electrical system",
      "rv.c4": "Visibility: glass, mirrors, wipers",
      "rv.c5": "Tyres, axles and suspension",
      "rv.c6": "Chassis and bodywork",
      "rv.c7": "Emissions and noise",
      "tg.t": "Servicing and mechanics.",
      "tg.p1": "We're a multi-brand workshop: all-round repairs, servicing and maintenance, with the diagnostic testers for every kind of diagnosis, check and maintenance on most vehicles.",
      "tg.zoom": "Enlarge the photo of the pistons",
      "tg.alt": "The four pistons of an open engine block on the workbench",
      "tg.fig": "An engine opened up on the bench (photo from the Google listing)",
      "tg.zoom2": "Enlarge the photo of the cylinder head",
      "tg.alt2": "An open cylinder head on the bench, with the valve seats, wrapped in plastic",
      "tg.fig2": "The cylinder head, on the bench (photo from the Google listing)",
      "gm.t": "Tyre changes.",
      "gm.p": "The tyre service is in the same workshop: tyres are changed here.",
      "cr.t": "Bodywork and glass.",
      "cr.p": "All kinds of bodywork jobs, glass, polishing.",
      "el.t": "Auto electrics and air con.",
      "el.p": "The electrical system, air-conditioning recharge, audio systems.",
      "us.t": "Used cars: sales and trade-ins.",
      "us.p": "We sell used cars and take yours in. To find out which cars we have right now, give us a call.",
      "cm.t": "Courtesy cars, pick-up and delivery.",
      "cm.p1": "We have courtesy cars; by appointment we collect your car and bring it back, and we wash it when we hand it over.",
      "cm.n1": "square metres of workshop",
      "cm.n2": "vehicle lifts",
      "cm.n3": "parking spaces in the courtyard",
      "cm.p2": "You can pay by credit or debit card, contactless too. Entrance and parking are wheelchair accessible.",
      "cm.zoom": "Enlarge the photo of the courtyard",
      "cm.alt": "The workshop courtyard with cars lined up and the green DEKRA sign at the back",
      "cm.fig": "The courtyard (photo from the Google listing)",
      "st.t": "On cars since 1979.",
      "st.p1": "Italo Bianchi has been in the motor trade since 1979. From 1988 to 1997 he worked in a Lancia-authorised workshop; from 1998 to 2010 he was a partner in it, and the workshop was authorised for Lancia and Alfa Romeo.",
      "st.p2": "In 2011 Autofficina Italo Bianchi was born, a multi-brand workshop. Today, in Via Ettore Ponti, inspections, mechanics, tyres, bodywork and used cars are all under one roof.",
      "st.zoom": "Enlarge the photo of the vintage cars",
      "st.alt": "A row of vintage cars in the courtyard: a white coupé and two red spiders in front of the workshop",
      "st.fig": "The courtyard on a vintage-car day (photo from the Google listing)",
      "rc.t": "In our customers' words.",
      "rc.p": "Five Google reviews, translated from the Italian.",
      "rc.voto": "out of 5 · 502 Google reviews",
      "rc.s5": "5 stars",
      "rc.1": "Excellent service for the car inspection. I booked it this morning. I only waited 45 minutes …maybe less. Excellent service!",
      "rc.f1": "Phoebe · a year ago · 5 stars",
      "rc.2": "I called on Saturday morning to ask whether they could do the inspection on my motorbike, they told me I could come straight away, no problem. Inspection done in less than an hour. Kind and helpful, very tidy workshop. Highly recommended!",
      "rc.f2": "Matteo Salati · 3 years ago · 5 stars",
      "rc.3": "A sure thing for whatever your car needs. Services, maintenance, tyres, repairs, inspections and much, much more are all carried out with great professionalism and expertise and as quickly as possible. By now he's my trusted mechanic, highly recommended!",
      "rc.f3": "vito nicola fornaro · 8 years ago · 5 stars",
      "rc.4": "I was in Milan with my family when my car broke down. I only had two days and was desperately looking for a workshop that could repair my car in so little time. I immediately felt in good hands at Italo Bianchi. […] The workshop did an excellent job and repaired my car in just one day.",
      "rc.f4": "Pele Son · a month ago · 5 stars",
      "rc.5": "I had the inspections done on my 2 scooters, precise, fast, professional. Recommended ... And a few months later the car too.... Kind and helpful as always. HIGHLY RECOMMENDED",
      "rc.f5": "giovanbattista rubuano · 4 years ago · 5 stars",
      "or.t": "Hours and how to get here.",
      "or.lun": "Monday",
      "or.mar": "Tuesday",
      "or.mer": "Wednesday",
      "or.gio": "Thursday",
      "or.ven": "Friday",
      "or.sab": "Saturday",
      "or.dom": "Sunday",
      "or.chiuso": "closed",
      "or.ind": "Address",
      "or.indv": "Via Ettore Ponti 53, 20143 Milan (Barona)",
      "or.tel": "Phone",
      "or.pren": "Bookings",
      "or.prenv": "By phone: booking is recommended, for inspections and for the workshop",
      "or.chiama": "Call 02&nbsp;816648",
      "or.btn": "Directions",
      "or.mappa": "Map: Autofficina Italo Bianchi, Via Ettore Ponti 53, Milan",
      "q.t": "Questions.",
      "q.1t": "How often is the inspection due?",
      "q.1p": "For cars and motorbikes, the first within four years of first registration, then every two years, by the end of the month it falls due. The registration document is what counts.",
      "q.2t": "Do you also inspect motorbikes and scooters?",
      "q.2p": "Yes: cars, motorbikes and scooters.",
      "q.3t": "How do I book the inspection?",
      "q.3p": "Call us on 02&nbsp;816648 and we'll fix the day and time together.",
      "q.4t": "What if something isn't right?",
      "q.4p": "We're a workshop too: mechanics, tyres, lights, bodywork. Whatever's needed, we fix it here.",
      "q.5t": "Do you have courtesy cars?",
      "q.5p": "Yes, and by appointment we also collect and deliver your car. Ask when you book.",
      "q.6t": "Are you open on Saturdays?",
      "q.6p": "Yes, on Saturdays from 8:30 to 13:00. We're closed on Sundays.",
      "p.1": "Car and motorbike inspections · mechanics · tyres · bodywork · auto electrics · used cars",
      "p.3": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from the business's website and its Google listing, public reviews on Google (September 2026); photographs from the Google listing. The due-date calculation is indicative: the registration document is what counts.",
      "a.nav": "Quick actions",
      "a.chiama": "Call",
      "a.scadenza": "Due date",
      "a.orari": "Hours",
      "a.mappa": "Map"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «il tabellone a palette» (#201 Autofficina Italo Bianchi) ──
  // Ogni riga del tabellone ([data-palette], più le tre del calcolatore) ha nell'HTML le lettere finali: senza JS si legge tutto.
  // Con GSAP ogni cella si monta in quattro mezze palette (sopra e sotto ferme, sopra e sotto mobili); il JS mette in ogni cella
  // una lettera qualche giro prima di quella giusta (data-stato «attesa») e, quando la riga entra, le palette girano in ordine
  // d'alfabeto come su un tabellone vero, finché ogni cella si ferma sulla sua lettera («giro» → «ferma»).
  // Il calcolatore della scadenza riusa le stesse celle: a ogni cambio la risposta gira. Cambiando lingua le righe girano sulla
  // parola inglese. Reduced-motion (o senza GSAP): lettere subito ferme, nessuna palette montata.
  var SEQ = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÀ0123456789';
  var paletteViva = hasGsap && !reducedMotion;
  var inglese = function () { return root.lang === 'en'; };
  var celleDi = function (r) { return Array.prototype.slice.call(r.querySelectorAll('.cella')); };
  var parolaDi = function (r) { return (inglese() && r.getAttribute('data-palette-en')) || r.getAttribute('data-palette') || ''; };
  var riempi = function (parola, n) { parola = String(parola).toUpperCase(); while (parola.length < n) parola += ' '; return parola.slice(0, n); };
  var monta = function (c) {
    if (c.getAttribute('data-l') !== null) return;
    var l = (c.textContent || '').trim().charAt(0) || ' ';
    c.setAttribute('data-l', l);
    c.textContent = '';
    ['su', 'giu', 'fsu', 'fgiu'].forEach(function (k) { var i = document.createElement('i'); i.className = k; i.textContent = l === ' ' ? '' : l; c.appendChild(i); });
  };
  var scrivi = function (c, l) {
    var t = l === ' ' ? '' : l, f = c.children;
    c.setAttribute('data-l', l);
    if (f.length === 4) {
      for (var k = 0; k < 4; k++) f[k].textContent = t;
      if (hasGsap) { gsap.set(f[2], { rotationX: 0 }); gsap.set(f[3], { rotationX: 90 }); }
    } else c.textContent = t;
  };
  // un passo: la palette di sopra (lettera vecchia) cade e scopre la nuova; quella di sotto (nuova) scende e copre la vecchia
  var passo = function (c, da, a, d) {
    var f = c.children, tu = a === ' ' ? '' : a, td = da === ' ' ? '' : da;
    var tl = gsap.timeline();
    tl.call(function () { f[0].textContent = tu; f[1].textContent = td; f[2].textContent = td; f[3].textContent = tu; });
    tl.fromTo(f[2], { rotationX: 0 }, { rotationX: -90, duration: d / 2, ease: 'power1.in', immediateRender: false });
    tl.fromTo(f[3], { rotationX: 90 }, { rotationX: 0, duration: d / 2, ease: 'power1.out', immediateRender: false });
    tl.call(function () { f[1].textContent = tu; f[2].textContent = tu; gsap.set(f[2], { rotationX: 0 }); gsap.set(f[3], { rotationX: 90 }); c.setAttribute('data-l', a); });
    return tl;
  };
  var tappe = function (da, a) {
    var i = SEQ.indexOf(da), j = SEQ.indexOf(a), out = [];
    if (j < 0) return [a];
    if (i < 0) i = 0;
    while (i !== j) { i = (i + 1) % SEQ.length; out.push(SEQ.charAt(i)); }
    return out;
  };
  var giraCella = function (c, a, durata) {
    var da = c.getAttribute('data-l') || ' ';
    if (da === a) return null;
    var t = tappe(da, a), d = Math.max(0.028, Math.min(0.085, durata / t.length));
    var tl = gsap.timeline(), prec = da;
    t.forEach(function (l) { tl.add(passo(c, prec, l, d)); prec = l; });
    return tl;
  };
  // un giro interrotto a metà: ogni cella torna intera sull'ultima lettera arrivata
  var ferma = function (r) {
    if (r._tl) { r._tl.kill(); r._tl = null; }
    celleDi(r).forEach(function (c) { if (c.children.length === 4) scrivi(c, c.getAttribute('data-l') || ' '); });
  };
  var giraRiga = function (r, parola, opz) {
    opz = opz || {};
    var celle = celleDi(r), t = riempi(parola, celle.length);
    r.setAttribute('data-parola', t.replace(/\s+$/, ''));
    ferma(r);
    if (!paletteViva || opz.subito) {
      celle.forEach(function (c, i) { scrivi(c, t.charAt(i)); });
      r.setAttribute('data-stato', 'ferma');
      return;
    }
    var tl = gsap.timeline({ delay: opz.ritardo || 0, onComplete: function () { r._tl = null; r.setAttribute('data-stato', 'ferma'); } });
    celle.forEach(function (c, i) { var ct = giraCella(c, t.charAt(i), opz.durata || 0.9); if (ct) tl.add(ct, i * 0.045); });
    if (!tl.getChildren().length) { tl.kill(); r.setAttribute('data-stato', 'ferma'); return; }
    r._tl = tl;
    r.setAttribute('data-stato', 'giro');
  };
  // stato di partenza: ogni cella da tre a undici palette prima della sua lettera
  var mescola = function (r, parola) {
    var celle = celleDi(r), t = riempi(parola, celle.length);
    celle.forEach(function (c, i) {
      var j = SEQ.indexOf(t.charAt(i)); if (j < 0) j = 0;
      var k = 3 + Math.floor(Math.random() * 9);
      scrivi(c, SEQ.charAt((j - k + SEQ.length * 2) % SEQ.length));
    });
    r.setAttribute('data-stato', 'attesa');
  };

  // ── il calcolatore: quando scade la revisione ──
  // Auto e moto: la prima entro quattro anni dalla prima immatricolazione, poi ogni due anni, entro la fine del mese.
  var MESI = {
    it: ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'],
    en: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  };
  var oggiRoma = function () {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
      var g = function (t) { return parseInt(p.find(function (x) { return x.type === t; }).value, 10); };
      return { m: g('month'), a: g('year') };
    } catch (e) { var d = new Date(); return { m: d.getMonth() + 1, a: d.getFullYear() }; }
  };
  var scadenza = function (stato, m, a) {
    var o = oggiRoma(), sa = a + (stato === 'revisionato' ? 2 : 4), mesi = (sa - o.a) * 12 + (m - o.m);
    return { m: m, a: sa, mesi: mesi, scaduta: mesi < 0 };
  };
  var frase = function (r, en) {
    var mese = MESI[en ? 'en' : 'it'][r.m - 1];
    mese = en ? mese.charAt(0) + mese.slice(1).toLowerCase() : mese.toLowerCase();
    if (en) {
      if (r.scaduta) return 'The inspection was due by the end of ' + mese + ' ' + r.a + ": it's overdue. Call us to book it.";
      return 'Next inspection due by the end of ' + mese + ' ' + r.a + ': ' + (r.mesi === 0 ? "it's this month." : r.mesi === 1 ? 'one month to go.' : r.mesi + ' months to go.');
    }
    if (r.scaduta) return 'La revisione era da fare entro la fine di ' + mese + ' ' + r.a + ': è scaduta. Chiamateci per prenotarla.';
    return 'Prossima revisione entro la fine di ' + mese + ' ' + r.a + ': ' + (r.mesi === 0 ? 'è questo mese.' : r.mesi === 1 ? 'manca un mese.' : 'mancano ' + r.mesi + ' mesi.');
  };
  var form = document.getElementById('calcolo'), selMese = document.getElementById('calMese'), selAnno = document.getElementById('calAnno');
  var esito = document.getElementById('calEsito'), nota = document.getElementById('calNota');
  var righeCalcolo = ['calTesta', 'calMeseOut', 'calAnnoOut'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var calcoloOk = !!(form && selMese && selAnno && righeCalcolo.length === 3);
  var heroPronto = false;
  if (selAnno && selAnno.options.length) {  // l'elenco degli anni arriva sempre fino all'anno in corso
    var annoOggi = oggiRoma().a, primoAnno = parseInt(selAnno.options[0].value, 10);
    for (var y = primoAnno + 1; y <= annoOggi; y++) { var op = document.createElement('option'); op.value = op.textContent = String(y); selAnno.insertBefore(op, selAnno.options[0]); }
  }
  var bersagli = function () {
    var sc = form.querySelector('input[name="stato"]:checked'), en = inglese();
    var r = scadenza(sc ? sc.value : 'nuovo', parseInt(selMese.value, 10), parseInt(selAnno.value, 10));
    r.parole = [r.scaduta ? (en ? 'OVERDUE' : 'SCADUTA') : (en ? 'DUE BY' : 'ENTRO'), MESI[en ? 'en' : 'it'][r.m - 1], String(r.a)];
    return r;
  };
  var calcola = function (subito) {
    if (!calcoloOk) return;
    var r = bersagli();
    if (esito) { esito.classList.toggle('is-scaduta', r.scaduta); esito.setAttribute('data-esito', r.scaduta ? 'scaduta' : 'entro'); }
    righeCalcolo.forEach(function (riga, i) { giraRiga(riga, r.parole[i], { subito: subito, durata: 0.75 }); });
    if (nota) nota.textContent = frase(r, inglese());
  };
  if (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('change', function () { calcola(!heroPronto); });
  }

  // ── le righe del tabellone ──
  var tutte = Array.prototype.slice.call(document.querySelectorAll('[data-palette]'));
  var introRiga = document.getElementById('introRiga');
  var righe = tutte.filter(function (r) { return r !== introRiga; });
  if (paletteViva) {
    tutte.concat(righeCalcolo).forEach(function (r) { celleDi(r).forEach(monta); });
    righe.forEach(function (r) {
      mescola(r, parolaDi(r));
      var entra = function () { if (r._entrata) return; r._entrata = true; giraRiga(r, parolaDi(r)); };
      if (hasST) ScrollTrigger.create({ trigger: r, start: 'top 90%', once: true, onEnter: entra });
      else entra();
    });
    if (calcoloOk) { var r0 = bersagli(); righeCalcolo.forEach(function (riga, i) { mescola(riga, r0.parole[i]); }); }
    // rete di sicurezza: una riga passata sopra la vista ancora in attesa si ferma subito sulla sua parola
    window.addEventListener('scroll', function () {
      righe.forEach(function (r) {
        if (r.getAttribute('data-stato') === 'attesa' && r.getBoundingClientRect().bottom < 0) { r._entrata = true; giraRiga(r, parolaDi(r), { subito: true }); }
      });
    }, { passive: true });
    // l'intro: il tabellone gira su REVISIONE
    if (introRiga && document.getElementById('intro')) { mescola(introRiga, parolaDi(introRiga)); giraRiga(introRiga, parolaDi(introRiga), { ritardo: 0.3, durata: 1.1 }); }
  } else {
    righe.forEach(function (r) { r._entrata = true; giraRiga(r, parolaDi(r), { subito: true }); });
  }
  // cambio lingua: le righe già girate girano sulla parola dell'altra lingua, il calcolatore riscrive la risposta
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      righe.forEach(function (r) {
        if (r._entrata) giraRiga(r, parolaDi(r), { durata: 0.8 });
        else if (paletteViva) mescola(r, parolaDi(r));
      });
      if (heroPronto) calcola(!paletteViva);
    });
  });
  window.bespokeHeroEntrance = function () {
    heroPronto = true;
    calcola(!paletteViva);
    if (!paletteViva) return;
    gsap.from(['.apertura__eti', '.apertura__t', '.apertura__p', '.calcolo'], { opacity: 0, y: 24, duration: 0.7, stagger: 0.08, ease: 'power3.out', clearProps: 'all' });
    gsap.from(['.calcolo__esito', '.calcolo__regola', '.apertura__tabellone .azioni', '.apertura__voto'], { opacity: 0, y: 14, duration: 0.6, stagger: 0.06, delay: 0.55, ease: 'power2.out', clearProps: 'all' });
  };
})();
