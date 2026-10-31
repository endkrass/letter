'use strict';

// STORY SETTINGS — the PIN is a storytelling device, visible in source, not security.
const STORY = {
  pin: 'WIWI',
  evasiveLabels: ['Bad idea', 'really?', 'Hannah…', 'nice try.'],
};
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wait = (ms) => new Promise(resolve => setTimeout(resolve, motion.matches ? 0 : ms));
const form = document.querySelector('#pin-form');
const inputs = [...form.querySelectorAll('input')];
const boxes = form.querySelector('.pin-inputs');
let errorFlashTimer;
let busy = false;
let currentScene = 'pin';

// Keep one letter per box; support pasting, arrows, backspace and Enter.
function fillLetters(value, start = 0) {
  const letters = value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, inputs.length - start);
  if (!letters) return;
  [...letters].forEach((letter, i) => { inputs[start + i].value = letter; });
  inputs[Math.min(start + letters.length, inputs.length - 1)].focus();
  updateInputs();
  if (inputs.every(input => input.value)) form.requestSubmit();
}
function updateInputs() {
  clearTimeout(errorFlashTimer);
  boxes.classList.remove('error-flash');
  inputs.forEach(input => {
    input.classList.toggle('filled', Boolean(input.value));
    input.removeAttribute('aria-invalid');
  });
}
inputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    const value = input.value;
    input.value = '';
    fillLetters(value, index);
    if (!value.replace(/[^a-z]/gi, '')) updateInputs();
  });
  input.addEventListener('paste', event => {
    event.preventDefault();
    fillLetters(event.clipboardData.getData('text'), index);
  });
  input.addEventListener('focus', () => input.select());
  input.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      event.preventDefault();
      inputs[index - 1].value = '';
      inputs[index - 1].focus();
      updateInputs();
    }
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); inputs[index - 1].focus(); }
    if (event.key === 'ArrowRight' && index < inputs.length - 1) { event.preventDefault(); inputs[index + 1].focus(); }
  });
});

async function changeScene(next) {
  const previous = document.querySelector(`#${currentScene}-scene`);
  const incoming = document.querySelector(`#${next}-scene`);
  previous.classList.add('scene-leaving');
  await wait(550);
  previous.hidden = true;
  previous.classList.remove('scene-leaving');
  incoming.hidden = false;
  incoming.classList.add('scene-arriving');
  currentScene = next;
  document.body.dataset.scene = next;
  document.querySelectorAll('.chapter').forEach(chapter => {
    const active = chapter.dataset.chapter === next;
    chapter.classList.toggle('active', active);
    if (active) chapter.setAttribute('aria-current', 'step');
    else chapter.removeAttribute('aria-current');
  });
  document.querySelector('#folio-number').textContent = next === 'envelope' ? '02' : '03';
  window.scrollTo({ top: 0, behavior: 'instant' });
  incoming.querySelector('h2').focus({ preventScroll: true });
  await wait(900);
  incoming.classList.remove('scene-arriving');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  const value = inputs.map(input => input.value).join('');
  if (value !== STORY.pin) {
    clearTimeout(errorFlashTimer);
    boxes.classList.add('error-flash');
    errorFlashTimer = setTimeout(() => boxes.classList.remove('error-flash'), 500);
    inputs.forEach(input => input.setAttribute('aria-invalid', 'true'));
    inputs[value.length < inputs.length ? value.length : 0].focus();
    return;
  }
  busy = true;
  inputs.forEach(input => { input.disabled = true; input.removeAttribute('aria-invalid'); });
  document.body.classList.add('unlocked');
  await wait(900);
  await changeScene('envelope');
  document.body.classList.remove('unlocked');
  busy = false;
});

const hintToggle = document.querySelector('.hint-toggle');
const hintList = document.querySelector('#hint-list');
const hints = [...hintList.querySelectorAll('li')];
let revealedHints = 0;
hintToggle.addEventListener('click', () => {
  if (revealedHints >= hints.length) return;
  hintList.hidden = false;
  hints[revealedHints].hidden = false;
  revealedHints++;
  hintToggle.setAttribute('aria-expanded', 'true');
  if (revealedHints === hints.length) hintToggle.disabled = true;
});
// A restrained pointer tilt. Touch follows the finger, without sensor permission.
const envelope = document.querySelector('#envelope');
function tiltEnvelope(event) {
  if (motion.matches || busy || event.pointerType === 'touch') return;
  const rect = envelope.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  envelope.style.transform = `rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
}
envelope.addEventListener('pointermove', tiltEnvelope);
envelope.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' && !motion.matches) envelope.style.transform = 'rotateX(3deg)';
});
envelope.addEventListener('pointerleave', () => { envelope.style.transform = ''; });
async function openLetter() {
  if (busy) return;
  busy = true;
  envelope.disabled = true;
  envelope.style.transform = '';
  envelope.classList.add('opening');
  await wait(2400);
  await changeScene('reading');
  busy = false;
}
envelope.addEventListener('click', openLetter);

// Keep the playful answer contained and away from the working answer.
const badButton = document.querySelector('#bad-button');
const goodButton = document.querySelector('#good-button');
const arena = document.querySelector('#answer-arena');
let attempts = 0;
let lastMove = 0;
let lastPosition = { x: 0, y: 0 };
function dodgeAnswer() {
  const now = performance.now();
  if (now - lastMove < 450) return;
  lastMove = now;
  attempts++;
  badButton.textContent = STORY.evasiveLabels[Math.min(attempts, STORY.evasiveLabels.length - 1)];
  // Read the untransformed box so repeated moves cannot drift out of bounds.
  const bounds = arena.getBoundingClientRect();
  const good = goodButton.getBoundingClientRect();
  const left = badButton.offsetLeft;
  const top = badButton.offsetTop;
  const width = badButton.offsetWidth;
  const height = badButton.offsetHeight;
  const candidates = [
    { x: 6, y: 96 },
    { x: bounds.width - width - 6, y: 105 },
    { x: (bounds.width - width) / 2, y: 85 },
    { x: bounds.width - width - 10, y: 15 },
  ].filter(point => {
    const distance = Math.hypot(point.x - left - lastPosition.x, point.y - top - lastPosition.y);
    const overlapsGood = point.x < good.right - bounds.left + 12 && point.x + width > good.left - bounds.left - 12 && point.y < good.bottom - bounds.top + 10 && point.y + height > good.top - bounds.top - 10;
    return distance > 45 && !overlapsGood;
  });
  const point = candidates[Math.floor(Math.random() * candidates.length)] || { x: 6, y: 100 };
  lastPosition = { x: point.x - left, y: point.y - top };
  badButton.style.transform = `translate(${lastPosition.x}px, ${lastPosition.y}px)`;
}
arena.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  const rect = badButton.getBoundingClientRect();
  if (event.clientX > rect.left - 25 && event.clientX < rect.right + 25 && event.clientY > rect.top - 20 && event.clientY < rect.bottom + 20) dodgeAnswer();
});
badButton.addEventListener('pointerdown', event => { event.preventDefault(); dodgeAnswer(); });
badButton.addEventListener('click', event => { event.preventDefault(); dodgeAnswer(); });
badButton.addEventListener('keydown', event => {
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); dodgeAnswer(); }
});
window.addEventListener('resize', () => { badButton.style.transform = ''; lastPosition = { x: 0, y: 0 }; });

goodButton.addEventListener('click', async () => {
  if (busy) return;
  busy = true;
  const question = document.querySelector('#question-section');
  question.classList.add('scene-leaving');
  await wait(550);
  question.hidden = true;
  const finale = document.querySelector('#final-message');
  finale.hidden = false;
  finale.classList.add('scene-arriving');
  document.querySelector('#folio-number').textContent = '04';
  finale.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
  document.querySelector('#final-title').focus({ preventScroll: true });
  busy = false;
});
