export interface ParsedEisUrl {
  source: 'zakupki.gov.ru' | 'unknown';
  original: string;
  purchaseNumber: string | null;
  path: string | null;
  params: Record<string, string>;
}

const PURCHASE_NUMBER_RE = /\b\d{11,20}\b/;
const KNOWN_NUMBER_PARAMS = ['regNumber', 'noticeId', 'purchaseNumber', 'number'];

export function extractPurchaseNumber(input: string): string | null {
  for (const key of KNOWN_NUMBER_PARAMS) {
    const value = extractQueryValue(input, key);
    if (value && PURCHASE_NUMBER_RE.test(value)) {
      return value.match(PURCHASE_NUMBER_RE)?.[0] ?? null;
    }
  }

  return input.match(PURCHASE_NUMBER_RE)?.[0] ?? null;
}

export function parseEisUrl(input: string): ParsedEisUrl {
  const original = input.trim();
  let source: ParsedEisUrl['source'] = 'unknown';
  let path: string | null = null;
  const params: Record<string, string> = {};

  try {
    const url = new URL(original);
    if (url.hostname === 'zakupki.gov.ru' || url.hostname.endsWith('.zakupki.gov.ru')) {
      source = 'zakupki.gov.ru';
    }
    path = url.pathname || null;
    for (const [key, value] of url.searchParams.entries()) {
      params[key] = value;
    }
  } catch {
    // Keep free-text support. Users often paste snippets, not clean URLs.
  }

  return {
    source,
    original,
    purchaseNumber: extractPurchaseNumber(original),
    path,
    params
  };
}

function extractQueryValue(input: string, key: string): string | null {
  try {
    const url = new URL(input.trim());
    return url.searchParams.get(key);
  } catch {
    const re = new RegExp(`[?&]${escapeRegExp(key)}=([^&#\\s]+)`, 'i');
    const match = input.match(re);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
