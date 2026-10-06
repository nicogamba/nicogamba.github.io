(function () {
  'use strict';

  var STORAGE_KEY = 'ng-lang';
  var translations = {
    en: {
      title: 'Nicolás Gamba — Tech Lead & Cloud Backend Engineer',
      description: 'Tech Lead & Cloud Backend Engineer with 7+ years building production systems with PHP/Symfony, PostgreSQL and AWS. Co-Founder & CTO at Orbix-IT.'
    },
    es: {
      title: 'Nicolás Gamba — Tech Lead & Ingeniero Backend Cloud',
      description: 'Tech Lead e Ingeniero Backend Cloud con más de 7 años construyendo sistemas en producción con PHP/Symfony, PostgreSQL y AWS. Co-Founder y CTO en Orbix-IT.'
    }
  };

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* storage unavailable */
    }
  }

  function applyLang(lang) {
    if (lang !== 'es') {
      lang = 'en';
    }

    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll('[data-en][data-es]');
    for (var i = 0; i < nodes.length; i++) {
      var value = nodes[i].getAttribute('data-' + lang);
      if (value !== null) {
        nodes[i].textContent = value;
      }
    }

    var meta = translations[lang];
    document.title = meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute('content', meta.description);
    }

    var buttons = document.querySelectorAll('.lang__btn');
    for (var j = 0; j < buttons.length; j++) {
      var active = buttons[j].getAttribute('data-lang') === lang;
      buttons[j].classList.toggle('is-active', active);
      buttons[j].setAttribute('aria-pressed', String(active));
    }
  }

  document.querySelectorAll('.lang__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      storeLang(lang);
      applyLang(lang);
    });
  });

  applyLang(getStoredLang() || 'en');

  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  function closeNav() {
    if (!navLinks || !navToggle) {
      return;
    }
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        closeNav();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) {
        closeNav();
      }
    });
  }

  var spyLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  var spySections = [];

  spyLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      spySections.push({ link: link, target: target });
    }
  });

  function setActiveSection(id) {
    spySections.forEach(function (entry) {
      if (entry.target.id === id) {
        entry.link.setAttribute('aria-current', 'true');
      } else {
        entry.link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveSection() {
    var pos = window.scrollY + window.innerHeight * 0.4;
    var current = '';
    for (var k = 0; k < spySections.length; k++) {
      if (spySections[k].target.offsetTop <= pos) {
        current = spySections[k].target.id;
      }
    }
    setActiveSection(current);
  }

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();

  var revealNodes = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
