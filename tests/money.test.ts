import { describe, expect, test } from 'bun:test';
import { formatRubAmount, parseRubAmount } from '../src/money';

describe('money', () => {
  test('parses Russian ruble amount', () => {
    expect(parseRubAmount('1 250 000,50 руб.')).toBe(1250000.5);
  });

  test('formats ruble amount', () => {
    expect(formatRubAmount(1250000)).toContain('1');
    expect(formatRubAmount(1250000)).toContain('250');
  });
});
