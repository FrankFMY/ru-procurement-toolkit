import { describe, expect, test } from 'bun:test';
import { formatRubAmount, parseRubAmount } from '../src/money';

describe('money', () => {
  test('preserves a decimal dot instead of turning kopeks into rubles', () => {
    expect(parseRubAmount('1234.56')).toBe(1234.56);
    expect(parseRubAmount('-1\u00a0234.56 ₽')).toBe(-1234.56);
  });
  test('parses Russian ruble amount', () => {
    expect(parseRubAmount('1 250 000,50 руб.')).toBe(1250000.5);
  });

  test('formats ruble amount', () => {
    expect(formatRubAmount(1250000)).toContain('1');
    expect(formatRubAmount(1250000)).toContain('250');
  });
});
