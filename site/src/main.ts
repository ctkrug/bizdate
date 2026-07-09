import { nyseCalendar, parse } from '../../src/index.js';

const form = document.querySelector<HTMLFormElement>('#playground-form');
const input = document.querySelector<HTMLInputElement>('#phrase-input');
const result = document.querySelector<HTMLParagraphElement>('#result');

function resolve(phrase: string): string {
  const parsed = parse(phrase, nyseCalendar);
  if (!parsed.ok) {
    return `Not resolved yet: ${parsed.reason}`;
  }
  return parsed.date.toDateString();
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!input || !result) return;
  result.textContent = resolve(input.value);
});

if (input && result) {
  result.textContent = resolve(input.value);
}
