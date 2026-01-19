// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href')?.substring(1);
    const targetEl = targetId ? document.getElementById(targetId) : null;
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu after selection
      if (navList && navList.classList.contains('open')) {
        navList.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// Dynamic year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Reveal on scroll using IntersectionObserver
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('[data-animate]'));
  if (!items.length) return;

  // If user prefers reduced motion, reveal everything immediately
  if (prefersReduced) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }

  const reveal = (el) => {
    // Read optional CSS variable --stagger (ms)
    const cssVar = getComputedStyle(el).getPropertyValue('--stagger').trim();
    const delay = cssVar ? parseInt(cssVar, 10) || 0 : 0;
    if (delay > 0) {
      setTimeout(() => el.classList.add('visible'), delay);
    } else {
      el.classList.add('visible');
    }
  };

  // Observer to reveal elements when they enter viewport
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  items.forEach((el) => io.observe(el));
})();
