const ideaInput = document.querySelector('#idea-input');
const ideaList = document.querySelector('#idea-list');
const primaryCta = document.querySelector('#cta-primary');
const secondaryCta = document.querySelector('#cta-secondary');
const ideaSubmit = document.querySelector('#idea-submit');

const examples = [
  'Craft a pricing page with tiered cards and toggle.',
  'Design an onboarding checklist with progress tracking.',
  'Create a dashboard with KPI tiles and spark lines.',
  'Prototype a hero section with rotating feature highlights.',
  'Lay out a gallery that staggers cards with subtle motion.',
];

primaryCta?.addEventListener('click', () => {
  const randomIdea = examples[Math.floor(Math.random() * examples.length)];
  ideaInput.value = randomIdea;
  ideaInput.focus();
});

secondaryCta?.addEventListener('click', () => {
  const message = document.createElement('div');
  message.className = 'chip';
  message.textContent = 'Previewed layout snapshot';
  secondaryCta.replaceWith(message);
});

ideaSubmit?.addEventListener('click', () => {
  const value = ideaInput.value.trim();
  if (!value) return;

  const item = document.createElement('li');
  item.className = 'idea-item';
  item.innerHTML = `<span>${value}</span><span class="chip">Saved</span>`;
  ideaList.prepend(item);

  ideaInput.value = '';
  ideaInput.focus();
});
