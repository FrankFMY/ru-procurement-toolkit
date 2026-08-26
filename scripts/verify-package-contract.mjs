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
  const tarball = join(target, packOutput.split('\n').at(-1));
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
  console.log('isolated TypeScript NodeNext consumer: PASS');
} finally {
  rmSync(target, { force: true, recursive: true });
}
