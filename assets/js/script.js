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

// Projects accordion: only one "Read more" open at a time
let activeProjectOverlay = null;
let activeProjectOverlayCleanup = null;
let activeProjectSourceCard = null;
let activeProjectSourceDetails = null;

const getPreviewText = (text, wordsCount = 7) => {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Read more…';
  const words = cleaned.split(' ');
  const preview = words.slice(0, wordsCount).join(' ');
  return words.length > wordsCount ? `${preview}…` : `${preview}`;
};

const closeActiveProjectOverlay = () => {
  if (activeProjectOverlayCleanup) {
    activeProjectOverlayCleanup();
    activeProjectOverlayCleanup = null;
  }
  if (activeProjectOverlay) {
    activeProjectOverlay.remove();
    activeProjectOverlay = null;
  }
  if (activeProjectSourceCard) {
    activeProjectSourceCard.classList.remove('is-open');
    activeProjectSourceCard.classList.remove('is-placeholder');
    activeProjectSourceCard = null;
  }
  if (activeProjectSourceDetails) {
    activeProjectSourceDetails.removeAttribute('open');
    activeProjectSourceDetails = null;
  }
};

const positionOverlayForCard = (cardEl, overlayEl) => {
  const rect = cardEl.getBoundingClientRect();
  overlayEl.style.left = `${rect.left + window.scrollX}px`;
  overlayEl.style.top = `${rect.top + window.scrollY}px`;
  overlayEl.style.width = `${rect.width}px`;
};

document.querySelectorAll('.project-details').forEach((detailsEl) => {
  const summaryEl = detailsEl.querySelector('.project-summary');
  const cardEl = detailsEl.closest('.card');
  if (!summaryEl || !cardEl) return;

  const descriptionEl = detailsEl.querySelector('p');
  if (descriptionEl) {
    summaryEl.textContent = getPreviewText(descriptionEl.textContent);
  }

  const toggleOverlay = () => {
    // Close if this card is already active
    if (activeProjectSourceDetails === detailsEl) {
      closeActiveProjectOverlay();
      return;
    }

    // Close anything else first
    closeActiveProjectOverlay();

    // Mark source as active and prevent the original <details> from expanding the layout.
    activeProjectSourceCard = cardEl;
    activeProjectSourceDetails = detailsEl;
    detailsEl.removeAttribute('open');
    cardEl.classList.add('is-open');
    cardEl.classList.add('is-placeholder');

    const overlayEl = cardEl.cloneNode(true);
    overlayEl.classList.add('card-overlay');
    overlayEl.classList.remove('is-placeholder');
    overlayEl.classList.add('is-open');
    overlayEl.style.position = 'absolute';
    overlayEl.style.zIndex = '1000';
    overlayEl.style.pointerEvents = 'auto';
    positionOverlayForCard(cardEl, overlayEl);

    const overlayDetails = overlayEl.querySelector('.project-details');
    if (overlayDetails) overlayDetails.setAttribute('open', '');

    const overlaySummary = overlayEl.querySelector('.project-summary');
    if (overlaySummary) {
      overlaySummary.addEventListener('click', (e) => {
        e.preventDefault();
        closeActiveProjectOverlay();
      });
    }

    document.body.appendChild(overlayEl);
    activeProjectOverlay = overlayEl;

    const onScrollOrResize = () => {
      if (!activeProjectOverlay || !activeProjectSourceCard) return;
      positionOverlayForCard(activeProjectSourceCard, activeProjectOverlay);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    activeProjectOverlayCleanup = () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  };

  summaryEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Safety: some browsers may still toggle <details> even when default is prevented.
    // Force it closed so the grid never grows/pushes other cards.
    detailsEl.open = false;
    detailsEl.removeAttribute('open');
    setTimeout(() => {
      detailsEl.open = false;
      detailsEl.removeAttribute('open');
    }, 0);

    toggleOverlay();
  });
});

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
