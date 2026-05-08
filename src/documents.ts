export type TenderDocumentType =
  | 'contract'
  | 'technical_specification'
  | 'notice'
  | 'protocol'
  | 'estimate'
  | 'attachment'
  | 'archive'
  | 'unknown';

export interface TenderDocumentInput {
  name: string;
  url?: string;
  sizeBytes?: number;
}

export interface RankedTenderDocument extends TenderDocumentInput {
  type: TenderDocumentType;
  priority: number;
  reason: string;
}

const RULES: Array<{
  type: TenderDocumentType;
  priority: number;
  patterns: RegExp[];
  reason: string;
}> = [
  {
    type: 'technical_specification',
    priority: 100,
    patterns: [/техническ/i, /\bтз\b/i, /описание объекта закуп/i, /specification/i],
    reason: 'technical requirements usually define actual delivery scope'
  },
  {
    type: 'contract',
    priority: 95,
    patterns: [/контракт/i, /договор/i, /contract/i],
    reason: 'contract draft usually contains liability, payment and security terms'
  },
  {
    type: 'notice',
    priority: 80,
    patterns: [/извещен/i, /notice/i, /common-info/i],
    reason: 'notice contains public tender metadata and participation rules'
  },
  {
    type: 'estimate',
    priority: 70,
    patterns: [/смет/i, /обоснован/i, /нмцк/i, /estimate/i],
    reason: 'estimate and price justification help understand budget structure'
  },
  {
    type: 'protocol',
    priority: 50,
    patterns: [/протокол/i, /protocol/i],
    reason: 'protocols can be useful but are often secondary for initial analysis'
  },
  {
    type: 'archive',
    priority: 20,
    patterns: [/\.zip$/i, /\.rar$/i, /\.7z$/i],
    reason: 'archives require extraction before direct text analysis'
  }
];

export function detectTenderDocumentType(name: string): TenderDocumentType {
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(name))) return rule.type;
  }
  return 'unknown';
}

export function prioritizeTenderDocuments(
  documents: TenderDocumentInput[],
  options: { limit?: number } = {}
): RankedTenderDocument[] {
  const ranked = documents.map(rankDocument);
  ranked.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.name.localeCompare(b.name, 'ru');
  });
  return typeof options.limit === 'number' ? ranked.slice(0, options.limit) : ranked;
}

function rankDocument(document: TenderDocumentInput): RankedTenderDocument {
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(document.name))) {
      return {
        ...document,
        type: rule.type,
        priority: adjustForSize(rule.priority, document.sizeBytes),
        reason: rule.reason
      };
    }
  }

  return {
    ...document,
    type: 'unknown',
    priority: adjustForSize(30, document.sizeBytes),
    reason: 'unknown document type'
  };
}

function adjustForSize(priority: number, sizeBytes?: number): number {
  if (!sizeBytes) return priority;
  if (sizeBytes > 50 * 1024 * 1024) return priority - 20;
  if (sizeBytes > 15 * 1024 * 1024) return priority - 10;
  return priority;
}
