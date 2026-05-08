import { describe, expect, test } from 'bun:test';
import { extractPurchaseNumber, parseEisUrl } from '../src/eis-url';

describe('eis-url', () => {
  test('extracts purchase number from zakupki URL', () => {
    const url =
      'https://zakupki.gov.ru/epz/order/notice/ea20/view/common-info.html?regNumber=0373100001026000001';
    expect(extractPurchaseNumber(url)).toBe('0373100001026000001');
  });

  test('parses zakupki URL source and params', () => {
    const parsed = parseEisUrl(
      'https://zakupki.gov.ru/epz/order/notice/ea20/view/common-info.html?regNumber=0373100001026000001'
    );
    expect(parsed.source).toBe('zakupki.gov.ru');
    expect(parsed.purchaseNumber).toBe('0373100001026000001');
    expect(parsed.params.regNumber).toBe('0373100001026000001');
  });

  test('extracts number from free text', () => {
    expect(extractPurchaseNumber('Закупка N 0373100001026000001 на разработку')).toBe(
      '0373100001026000001'
    );
  });
});
