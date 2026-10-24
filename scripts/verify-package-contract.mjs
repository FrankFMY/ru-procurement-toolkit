import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const target = mkdtempSync(join(tmpdir(), 'ru-procurement-toolkit-consumer-'));

try {
  const packOutput = execFileSync('npm', ['pack', '--silent', '--pack-destination', target], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  const tarball =
    process.env.RU_REGISTRY === '1'
      ? 'ru-procurement-toolkit@0.1.1'
      : join(target, packOutput.split('\n').at(-1));
  const packed = join(target, packOutput.split('\n').at(-1));
  const entries = execFileSync('tar', ['-tzf', packed], { encoding: 'utf8' }).trim().split('\n');
  for (const required of [
    'package/LICENSE',
    'package/NOTICE',
    'package/README.md',
    'package/dist/index.js',
    'package/dist/index.d.ts'
  ]) {
    if (!entries.includes(required)) throw new Error(`Missing package artifact: ${required}`);
  }
  writeFileSync(
    join(target, 'package.json'),
    '{"name":"ru-procurement-toolkit-consumer","private":true,"type":"module"}\n'
  );
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: target,
    stdio: 'pipe'
  });
  writeFileSync(
    join(target, 'consumer.ts'),
    [
      'import { extractPurchaseNumber, parseRubAmount, prioritizeTenderDocuments } from "ru-procurement-toolkit";',
      'const number: string | null = extractPurchaseNumber("0373100001026000001");',
      'const amount: number | null = parseRubAmount("1 000 руб.");',
      'const documents = prioritizeTenderDocuments([{ name: "ТЗ.pdf", url: "https://example.test/tz.pdf" }]);',
      'void [number, amount, documents];',
      ''
    ].join('\n')
  );
  writeFileSync(
    join(target, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noEmit: true,
          strict: true,
          skipLibCheck: false,
          target: 'ES2022'
        },
        include: ['consumer.ts']
      },
      null,
      2
    )}\n`
  );
  execFileSync(
    process.execPath,
    [join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'],
    {
      cwd: target,
      stdio: 'inherit'
    }
  );
  writeFileSync(
    join(target, 'runtime.mjs'),
    `
import assert from 'node:assert/strict';
import { extractPurchaseNumber, parseEisUrl, parseRubAmount, prioritizeTenderDocuments, detectTenderDocumentType } from 'ru-procurement-toolkit';
assert.equal(parseRubAmount('1234.56'), 1234.56);
assert.equal(parseRubAmount('1 250 000,50 руб.'), 1250000.5);
assert.equal(extractPurchaseNumber('text ?regNumber=%ZZ'), null);
assert.equal(parseEisUrl('text ?regNumber=%E0%A4').purchaseNumber, null);
assert.equal(extractPurchaseNumber('Закупка 0373100001026000001'), '0373100001026000001');
assert.equal(detectTenderDocumentType('Техническое задание.pdf'), 'technical_specification');
assert.equal(prioritizeTenderDocuments([{ name: 'Архив.zip', url: 'https://example.test/a.zip' }, { name: 'Техническое задание.pdf', url: 'https://example.test/tz.pdf' }])[0].name, 'Техническое задание.pdf');
console.log('installed parser/document runtime: PASS');
`
  );
  execFileSync(process.execPath, ['runtime.mjs'], { cwd: target, stdio: 'inherit' });
  execFileSync('bun', ['runtime.mjs'], { cwd: target, stdio: 'inherit' });
  console.log('isolated TypeScript NodeNext consumer: PASS');
} finally {
  rmSync(target, { force: true, recursive: true });
}
