export function parseRubAmount(input: string | number | null | undefined): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (!input) return null;

  const normalized = input
    .replace(/\u00a0/g, ' ')
    .replace(/[₽ррублейруб.]/gi, '')
    .replace(/\s+/g, '')
    .replace(',', '.')
    .trim();

  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

export function formatRubAmount(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}
