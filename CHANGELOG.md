# Changelog

## 1.5.1 (2026-08-28)
- analogs.md precision pass (user QA): shared-vocabulary caution added (DeFi uses haircut, margin, repo, tranche natively; the table maps objects, not dialects); stablecoin row split by claim design (payment stablecoin = banknote-style par claim, issuer keeps the yield; tokenized MMF / yield-bearing dollar = fund share, yield to holder); haircut row corrected to the advance-rate identity (an 80% LLTV is a 20% haircut).
- Concepts 16: execution quality and MEV block (sandwich cost, LVR, private order flow and protected RPC endpoints, batch auctions and solvers, protected exit routes); glossary adds LVR and extends MEV; playbook step 7 counts price impact plus MEV as exit costs.
- Concepts 5: underwritten credit added as the sixth lending architecture (Maple/3Jane-style: delegate or model underwriting, junior first-loss, recovery is a legal process, not a liquidation); design count corrected (header said four while listing five). Checklist updated for both additions.
- Fixes: manifest Curve row priority was "named", an invalid tier, set to core; data-sources source count 70+ corrected to 90+.

## 1.5.0 (2026-08-28)

Initial public release. Eval-gated before publish: paired with-skill vs no-skill runs across assessment, allocation, content, and execution-refusal cases; a look-through regression gate; a four-model adversarial audit; and live verification of every manifest source and data recipe.
