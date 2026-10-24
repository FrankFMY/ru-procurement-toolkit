# Scope

This library provides local, deterministic EIS URL and purchase-number parsing, ruble amount normalization, filename classification, and document ranking.

It makes no network calls, downloads no documents, stores no data, and implements no commercial scoring or legal-risk policy. URL recognition does not authorize a fetch. Applications remain responsible for input validation, network security, exact-decimal accounting, and their own business decisions.

The modules are independent pure helpers. Their TypeScript interfaces are exported from the package root; no private product or service is required.
