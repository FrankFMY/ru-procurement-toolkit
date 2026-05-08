import { describe, expect, test } from 'bun:test';
import { detectTenderDocumentType, prioritizeTenderDocuments } from '../src/documents';

describe('documents', () => {
  test('detects document types', () => {
    expect(detectTenderDocumentType('Техническое задание.pdf')).toBe('technical_specification');
    expect(detectTenderDocumentType('Проект контракта.docx')).toBe('contract');
    expect(detectTenderDocumentType('archive.zip')).toBe('archive');
  });

  test('prioritizes technical spec and contract before archive', () => {
    const ranked = prioritizeTenderDocuments([
      { name: 'archive.zip' },
      { name: 'Проект контракта.docx' },
      { name: 'Техническое задание.pdf' }
    ]);
    expect(ranked[0]?.type).toBe('technical_specification');
    expect(ranked[1]?.type).toBe('contract');
    expect(ranked[2]?.type).toBe('archive');
  });
});
