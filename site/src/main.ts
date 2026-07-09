import { NYSE_HOLIDAYS, nyseCalendar, parse } from '../../src/index.js';
import { upcomingHolidays } from './ledger.js';

const form = document.querySelector<HTMLFormElement>('#playground-form');
const input = document.querySelector<HTMLInputElement>('#phrase-input');
const resultDate = document.querySelector<HTMLParagraphElement>('#result-date');
const resultMessage = document.querySelector<HTMLParagraphElement>('#result-message');
const stampUnderline = document.querySelector<SVGSVGElement>('.stamp-underline');
const ledgerList = document.querySelector<HTMLUListElement>('#ledger-list');

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', DATE_FORMAT);
}

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

function playPlotAnimation(): void {
  if (!stampUnderline) return;
  stampUnderline.classList.remove('is-plotted');
  // Force reflow so removing/re-adding the class restarts the animation.
  void stampUnderline.getBoundingClientRect();
  stampUnderline.classList.add('is-plotted');
}

function showEmptyState(): void {
  if (!resultDate || !resultMessage || !stampUnderline) return;
  resultDate.textContent = '';
  resultDate.classList.remove('is-error');
  resultMessage.textContent = 'Type a phrase above, like "next trading day" or "in 5 days".';
  resultMessage.classList.remove('is-error');
  stampUnderline.classList.remove('is-plotted');
}

function showResolved(date: Date): void {
  if (!resultDate || !resultMessage) return;
  resultDate.textContent = formatDate(date);
  resultDate.classList.remove('is-error');
  resultMessage.textContent = '';
  resultMessage.classList.remove('is-error');
  playPlotAnimation();
}

function showError(reason: string): void {
  if (!resultDate || !resultMessage || !stampUnderline) return;
  resultDate.textContent = '';
  resultMessage.textContent = reason;
  resultMessage.classList.add('is-error');
  stampUnderline.classList.remove('is-plotted');
}

function resolve(phrase: string): void {
  const trimmed = phrase.trim();
  if (!trimmed) {
    showEmptyState();
    return;
  }

  const parsed = parse(trimmed, nyseCalendar);
  if (parsed.ok) {
    showResolved(parsed.date);
  } else {
    showError(parsed.reason);
  }
}

const debouncedResolve = debounce(resolve, 300);

function renderLedger(): void {
  if (!ledgerList) return;
  const upcoming = upcomingHolidays(NYSE_HOLIDAYS, new Date(), 3);

  ledgerList.innerHTML = '';
  for (const holiday of upcoming) {
    const item = document.createElement('li');
    item.className = 'ledger-chip';
    const dateEl = document.createElement('span');
    dateEl.className = 'ledger-chip-date';
    dateEl.textContent = formatDate(new Date(`${holiday.date}T00:00:00`));
    const nameEl = document.createElement('span');
    nameEl.className = 'ledger-chip-name';
    nameEl.textContent = holiday.name;
    item.append(dateEl, nameEl);
    ledgerList.append(item);
  }
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (input) resolve(input.value);
});

input?.addEventListener('input', () => {
  debouncedResolve(input.value);
});

if (input) resolve(input.value);
renderLedger();
