# Changelog

## 1.5.3 (2026-08-28)
Adversarial four-model review of everything added since release; all confirmed findings fixed.
- Finance corrections in the teaching layer: CCP default waterfall order (defaulter margin, defaulter fund contribution, CCP skin-in-the-game, THEN the mutualized fund) and the honest ADL contrast (depth and frequency, not presence); T-bills are discount securities, not par claims; sUSDS is an administered rate on a mixed book, not a T-bill passthrough; looping mapped to margin leverage and rehypothecation to collateral-as-liquidity; duration example recalibrated to the real liquidation print; nightly (not just weekend) equity-oracle gaps; settlement simplified to T+1.
- Concepts: Resolv depeg low corrected ($0.025, was off 10x); underwritten credit split into unsecured (3Jane-style) vs negotiated overcollateralized institutional (Maple-style); PT linear-discount oracle split into pure-curve (immune to squeezes, converts deterioration into protocol bad debt) vs min(curve, TWAP) (not immune); IL vs LVR single-benchmark rule; Kelp print now carries its source URL.
- Recipes: working vaultV2s query shipped and live-verified (flat fields, netApy exists); Merkl pagination (items=, count endpoint, name filter); rwa.xyz app and DeBank marked browser-tool-only; curator field returns an address, noted.
- Tooling: verify_manifest.py now checks llms_full and pages[], content-checks llms.txt (empty or HTML bodies fail), scans all prose files for em AND en dashes, requires skill_use per source, and validates README/CONTRIBUTING file links; PR-check workflow added (runs on every pull request); monthly workflow scoped with add-paths so automation can only touch manifest.json and maintenance-reports/; MAINTENANCE.md description matched to reality; Mellow llms.txt removed (empty body).

## 1.5.2 (2026-08-28)
- Morpho GraphQL recipe fixed: `vaults` returns only Vault V1 (MetaMorpho); Vault V2 strategy vaults live under the separate `vaultV2s` query. The recipe now requires querying both and cross-checking against DefiLlama. Found in field use: an agent following the old recipe missed every V2 book.
- Merkl recipe: compare campaigns by USD daily-reward fields, never raw token amounts (decimal normalization), and report tranche structure plus renewal history, not just an end date.

## 1.5.1 (2026-08-28)

Initial public release. Eval-gated before publish: paired with-skill vs no-skill runs across assessment, allocation, content, and execution-refusal cases; a look-through regression gate; adversarial audits by a panel of independent models; and live verification of every manifest source and data recipe.
