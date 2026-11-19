document.documentElement.classList.add('js');

/* ---------- 1. Cover page gesture ---------- */
const cover = document.getElementById('cover');
const openBtn = document.getElementById('openBtn');
let startY = null;

function openCover() {
  cover.style.transform = '';
  cover.classList.remove('dragging');
  cover.classList.add('open');
  document.body.classList.remove('locked');
  window.scrollTo(0, 0);
}

function isLocked() {
  return !cover.classList.contains('open');
}

// Finger or mouse: the cover follows the drag, then opens if pulled far enough
cover.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  startY = e.clientY;
  cover.classList.add('dragging');
  cover.setPointerCapture(e.pointerId);
});

cover.addEventListener('pointermove', (e) => {
  if (startY === null) return;
  const dy = Math.min(0, e.clientY - startY); // only upward
  cover.style.transform = `translateY(${dy}px)`;
});

function endDrag(e) {
  if (startY === null) return;
  const dy = e.clientY - startY;
  startY = null;
  cover.classList.remove('dragging');
  if (dy < -80) {
    openCover();
  } else {
    cover.style.transform = ''; // spring back
  }
}
cover.addEventListener('pointerup', endDrag);
cover.addEventListener('pointercancel', endDrag);

// Other ways in: button, mouse wheel, keyboard
openBtn.addEventListener('click', openCover);
window.addEventListener('wheel', (e) => { if (isLocked() && e.deltaY > 10) openCover(); }, { passive: true });
window.addEventListener('keydown', (e) => {
  if (isLocked() && ['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    openCover();
  }
});

/* ---------- 2. Mobile menu ---------- */
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

function setMenu(open) {
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });

/* ---------- 3. Highlight the section being read ---------- */
const links = document.querySelectorAll('#menu a');
const sections = document.querySelectorAll('.page');

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach((s) => spy.observe(s));

/* ---------- 4. Reveal each section as it scrolls into view ---------- */
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
sections.forEach((s) => reveal.observe(s));

/* ---------- 5. Gentle About photo movement ---------- */
const aboutImage = document.querySelector('#about .about-photo img');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let aboutImageMotion;

function updateAboutImageMotion() {
  if (aboutImageMotion) aboutImageMotion.cancel();
  if (!aboutImage || motionPreference.matches) return;

  aboutImageMotion = aboutImage.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }],
    { duration: 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }
  );
}

updateAboutImageMotion();
motionPreference.addEventListener('change', updateAboutImageMotion);

/* ---------- 6. Photos not added yet: show a dashed "Add photo" box ---------- */
document.querySelectorAll('.gallery img').forEach((img) => {
  const markMissing = () => img.closest('figure').classList.add('missing');
  img.addEventListener('error', markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();
});
