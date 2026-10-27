import './styles/main.scss';

/* ---------- Мобильное меню ---------- */
const header = document.querySelector('[data-header]');
const burger = document.querySelector('[data-burger]');

function setMenu(open) {
  header.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenu(burger.getAttribute('aria-expanded') !== 'true');
});

header.addEventListener('click', (event) => {
  if (event.target.closest('.nav__link')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

/* ---------- Подсветка пункта меню при прокрутке ---------- */
const navLinks = [...document.querySelectorAll('.nav__link')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => spy.observe(section));

/* ---------- Демо: переключение Figma / SCSS ---------- */
const demo = document.querySelector('[data-demo]');

if (demo) {
  const tabs = [...demo.querySelectorAll('[data-tab]')];

  const selectTab = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));

    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });
}

/* ---------- Копирование email в один клик ---------- */
const copyButton = document.querySelector('[data-copy]');

if (copyButton) {
  const label = copyButton.querySelector('[data-copy-label]');
  const status = document.querySelector('[data-copy-status]');
  let timer;

  const showResult = (message, copied) => {
    label.textContent = message;
    status.textContent = message;
    copyButton.classList.toggle('is-copied', copied);
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = 'Скопировать';
      copyButton.classList.remove('is-copied');
    }, 2000);
  };

  const fallbackCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  };

  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.copy;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
      else if (!fallbackCopy(email)) throw new Error('copy failed');
      showResult('Скопировано', true);
    } catch {
      showResult('Не удалось, выделите адрес вручную', false);
    }
  });
}

/* ---------- Год в подвале ---------- */
const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

/* ---------- Появление секций при прокрутке ---------- */
const revealTargets = document.querySelectorAll(
  '.section__head, .timeline__item, .edu-card, .project, .skills'
);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -16px 0px' });

  const projectCards = [...document.querySelectorAll('.project')];

  revealTargets.forEach((item, index) => {
    item.classList.add('reveal-on-scroll');
    const delay = item.matches('.project')
      ? projectCards.indexOf(item) * 110
      : (index % 3) * 50;
    item.style.setProperty('--reveal-delay', `${delay}ms`);
    revealObserver.observe(item);
  });
}
