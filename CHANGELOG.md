# Changelog

## 1.5.2 (2026-08-28)
- Morpho GraphQL recipe fixed: `vaults` returns only Vault V1 (MetaMorpho); Vault V2 strategy vaults live under the separate `vaultV2s` query. The recipe now requires querying both and cross-checking against DefiLlama. Found in field use: an agent following the old recipe missed every V2 book.
- Merkl recipe: compare campaigns by USD daily-reward fields, never raw token amounts (decimal normalization), and report tranche structure plus renewal history, not just an end date.

## 1.5.1 (2026-08-28)

Initial public release. Eval-gated before publish: paired with-skill vs no-skill runs across assessment, allocation, content, and execution-refusal cases; a look-through regression gate; adversarial audits by a panel of independent models; and live verification of every manifest source and data recipe.
