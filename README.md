# RU Procurement Toolkit

Small, framework-neutral TypeScript utilities for Russian public procurement input: EIS/Zakupki URLs, purchase numbers, ruble amounts, and document prioritization. No network calls, account setup, or runtime dependencies.

[![CI](https://github.com/FrankFMY/ru-procurement-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/FrankFMY/ru-procurement-toolkit/actions/workflows/ci.yml)
[npm](https://www.npmjs.com/package/ru-procurement-toolkit) · [Source](https://github.com/FrankFMY/ru-procurement-toolkit) · [Issues](https://github.com/FrankFMY/ru-procurement-toolkit/issues) · [Changelog](CHANGELOG.md)

## Install

```sh
npm install ru-procurement-toolkit
# or: bun add ru-procurement-toolkit
```

The current source prepares 0.1.1; check the exact version on npm before depending on a correction described below. Existing published versions and their artifacts are unchanged.

## Usage

```ts
import {
  extractPurchaseNumber,
  parseEisUrl,
  parseRubAmount,
  prioritizeTenderDocuments
} from 'ru-procurement-toolkit';

const parsed = parseEisUrl(
  'https://zakupki.gov.ru/epz/order/notice/ea20/view/common-info.html?regNumber=0373100001026000001'
);
// parsed.source === 'zakupki.gov.ru'
// parsed.purchaseNumber === '0373100001026000001'

parseRubAmount('1 250 000,50 руб.'); // 1250000.5
parseRubAmount('1234.56'); // 1234.56 (0.1.1 correction)
extractPurchaseNumber('text ?regNumber=%ZZ'); // null, not URIError

const documents = prioritizeTenderDocuments([
  { name: 'Проект контракта.docx', url: 'https://example.test/contract.docx' },
  { name: 'Техническое задание.pdf', url: 'https://example.test/tz.pdf' },
  { name: 'Архив.zip', url: 'https://example.test/archive.zip' }
]);
```

## API and behavior

- `parseEisUrl(input)` returns the original trimmed text, recognized source, pathname, query parameters, and purchase number. Only the exact EIS host or its subdomains are recognized. This classification is not a URL allowlist for fetching.
- `extractPurchaseNumber(input)` checks known query parameters, then free text, for an 11–20 digit number. Invalid percent escapes in pasted snippets do not throw; an independent plain-text number can still be found. It is a syntactic extractor, not a check that a notice exists.
- `parseRubAmount(input)` accepts a finite number, a decimal comma or decimal dot, spaces/NBSP grouping, a minus sign, and common ruble suffixes. Returns a number or `null`. A dot is a decimal separator, not a thousands separator. This is a permissive free-text helper, not a strict financial-input validator or exact-decimal accounting type.
- `formatRubAmount(value)` uses `Intl.NumberFormat('ru-RU')` with RUB currency. Whitespace may be locale-specific; do not compare its output to ordinary ASCII spaces.
- `detectTenderDocumentType(name)` recognizes contract, technical specification, notice, protocol, estimate, and archive patterns, falling back to `unknown`. The exported union also reserves `attachment`; there is no separate attachment-detection rule.
- `prioritizeTenderDocuments(documents, options?)` sorts using deterministic generic document priorities. It does not open files or assess legal/commercial risk.

See the exported TypeScript declarations for complete input/output interfaces and ranking options. ESM imports are supported; declarations use explicit `.js` specifiers for strict NodeNext consumers. Node 20+, Bun, and browser bundlers that support modern JavaScript are the intended environments. The package has no Node-specific runtime dependency; no CommonJS `require` entry is declared.

## Migration from 0.1.0

0.1.1 corrects decimal-dot parsing (`1234.56` was incorrectly read as `123456`) and malformed percent decoding. Existing comma-decimal and free-text inputs remain supported. There is no API rename or data-store migration. Re-parse previously imported source values if your application may have stored an affected amount; do not try to infer the intended decimal position from the incorrect stored number alone.

## Development and releases

```sh
git clone https://github.com/FrankFMY/ru-procurement-toolkit.git
cd ru-procurement-toolkit
bun install --frozen-lockfile
bun run format:check
bun run check
bun test
bun run build
bun run package:check
```

The package check creates a clean installed consumer, executes parser/document behavior in Node and Bun, and type-checks with strict NodeNext and library checking enabled. Normal public pull-request and main CI run the same gates. Registry publication is an explicit maintainer operation after artifact qualification; publishing a GitHub release does not authorize an automatic registry upload.

## Scope and support

This toolkit is not a monitoring service, document downloader, legal adviser, or business-scoring engine. It processes caller-provided values locally. Treat links and filenames as untrusted input and apply your own fetching, validation, and business rules. Report reproducible defects through [GitHub Issues](https://github.com/FrankFMY/ru-procurement-toolkit/issues); see [SECURITY.md](SECURITY.md) for sensitive reports and [scope](docs/scope.md) for the module boundary.

## Author

Artem Prianishnikov / FrankFMY

- Email: [Pryanishnikovartem@gmail.com](mailto:Pryanishnikovartem@gmail.com) · [frankfmy@proton.me](mailto:frankfmy@proton.me)
- [Telegram](https://t.me/FrankFMY) · [LinkedIn](https://www.linkedin.com/in/frankfmy/) · [X](https://x.com/FrankFMY)
- [Website](https://frankfmy.com) · [GitHub](https://github.com/FrankFMY) · [npm](https://www.npmjs.com/~frankfmy)

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Third-party tools retain their own licenses.
