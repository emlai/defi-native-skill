# Launch microstructure

Load this file when the question involves: token launchpads, bonding curves, Doppler, Clanker, Bankr, Pons, pump.fun, four.meme, Virtuals, Zora, Flaunch, Uniswap v3 vs v4 launch pools, hooks that lock LP, slugs, multicurve, graduation, launch auctions (Dutch, uniform-price, fixed price), market-cap multipliers, "if I buy $1k where does mcap go", or why one factory's book is thinner than another's. It extends `concepts.md` sections 16 and 18 and `market-microstructure.md` from venue physics to the factories that stock those venues. Dated prints below are calibration examples. Re-pull before using as current truth.

The skill already has the evergreen machine: depth is a quantity, amplification is depth's inverse, a concentrated-liquidity position is a short option. This file is the factory layer. Who stocked the shelves, who is allowed to add more, whether the book ever migrates, and how that changes the multiplier.

## 1. Three layers. Do not mash them.

```
VENUE      Uniswap v2 / v3 / v4, PumpSwap, Meteora, a Raydium pool
           the shop and the price ruler

FACTORY    Doppler, Clanker, pump.fun, Pons, four.meme, Virtuals
           the program that mints the token and stocks the shop

STOREFRONT Bankr, Zora, Flaunch, Pools.trade, a Telegram bot
           the app that hired a factory and set the recipe
```

A token can be "a Bankr coin" and "a Doppler coin" at the same time. Bankr is the storefront. Doppler is the factory. Uniswap v4 is the shop. Mixing those names is how "7 Clanker rungs" gets pasted onto a 3-position Doppler pool.

Uniswap v4 is hardware: ticks, concentrated ranges, one PoolManager, optional hooks. It does not invent a bonding curve. Anyone can place one range or a hundred. v3 already had the ranges. v4 added the plugin socket (hooks), a singleton PoolManager, flash accounting, cheaper pool creates, and optional native ETH. The lock on a Doppler book is a hook behavior, not a v4 law.

## 2. Two launch families

Almost every famous pad is one of two machines.

**Family A. Curve then graduate.**
A bonding-curve contract (or a dedicated pool) sells tokens against a quote (SOL, BNB, ETH) until a threshold. Then leftover inventory plus raised quote are seeded into a DEX pool and the curve dies. pump.fun, four.meme, classic Pons v2, many Meteora DBC launches. The graduation print is a regime change: new venue, new fee, often a new chart. Ask: who owns the new LP, is it locked, can anyone add after.

**Family B. Live pool from block one.**
The factory opens a Uniswap (or equivalent) pool immediately and stocks it with a designed set of ranges. There is no separate curve contract. Clanker, Doppler multicurve, Bankr-on-Doppler, Zora content coins, Pons on Pons. Price discovery is the AMM itself. "Graduation" on a NoOp Doppler pool is a metaphor. The book never leaves.

**Family C. Auction first, then pool.**
No curve and no pool during the sale. A sealed or continuous auction clears one price for everyone in a window, then the proceeds and unsold tokens seed a Uniswap v4 pool. Uniswap Liquidity Launchpad runs a Continuous Clearing Auction (CCA): a uniform-price auction "in continuous time", supply released per block by a schedule to the highest max-price bids, one clearing price per block, tokens claimed after the pool exists (developers.uniswap.org, read 6 Sep 2026). CCA is a Uniswap Labs design. It is not a Doppler product. The launch-day tell is that there is nothing to chart until the auction closes.

A third cousin exists: Doppler's **dynamic auction**. The hook restacks liquidity every epoch (lower slug under price so sellers can exit, upper slug of tokens for sale now, discovery slugs staged above). If sales lag, the piles slide down (Dutch). If sales run hot, they slide up. Most Bankr Base agent tokens in 2026 used **multicurve** (static stacked ranges), not slugs. Do not call a multicurve position a slug.

## 3. How an AMM shop prices a new token

A constant-product bucket (Uniswap v2, many bonding curves under the hood) keeps `x * y = k`. Buy tokens, you add quote and remove tokens, so the next unit costs more. Sell, the reverse. That path is a bonding curve. v3 and v4 chop the same idea into ticks: each short range is its own tiny `x * y = k`. Walk off one range, you step onto the next. The path those ranges draw is the launch curve.

Three objects, not one:

```
STICKER    last price x total supply     = "market cap"
BUILDING   leftover tokens + leftover quote in the pool
THIS SHELF quote sitting at the current tick
```

Amplification lives in the third. The DexScreener "liquidity" number is the building. It is not the shelf.

```
amplification  =  change in market cap  /  net dollar flow
```

For a small clip against a v2-like local book:

```
amp  ≈  2 x market cap  /  quote reserve
```

Why twice: a buy adds quote and removes tokens. Price is quote/tokens. Both sides move by the same small percentage, and (1 + e) squared is about 1 + 2e when e is small.

Worked shape, not a live quote. A $240k sticker sitting on a $44k quote drawer has a floor near `2 x 240 / 44 ≈ 11x` if the whole drawer is on this shelf. If only a third of the drawer is on this shelf, the same $1,000 is a 3x harder shove and amp stretches toward ~30x. The extra mark is not cash that appeared in a vault. It is a new sticker on every token in existence, including vested tokens that cannot trade yet. Selling walks the same shelf down. Fees eat both trips.

Early vs late is two clocks:

- Inventory clock: tokens still in the shop / tokens originally put in. Small remainder = late on the pile.
- Dollar clock: current market cap versus the designed top of the current band. $200k on a band that runs to $1B is still early-mid on dollars.

Those clocks disagree on purpose. A launch can be late on inventory and early on the dollar print.

Position on a designed curve changes the same $1,000:

- Fat early rung: small tick move, amp near the floor formula.
- Thin late rung or a tail smeared to infinity: big tick move, amp stretches, fill gets worse.
- After a vertical, the staircase above is thinner and the staircase below (the exit) is the inventory just consumed.

## 4. TradFi analog

Not a mapping of products. A mapping of jobs.

| Onchain launch | TradFi job it is doing |
|---|---|
| Factory that mints and stocks the pool | Issuer + syndicate desk that sets the book |
| Designed curve / multicurve ranges | Indicative price talk, then a priced order book |
| Hook that reverts outsider LP | Stabilization agent who is the only official market maker, with no public specialist overlay |
| Quote reserve | Cash in the syndicate book, not enterprise value |
| Market cap | Last print x shares outstanding. Same fiction as a $2 microcap with a $40k tape |
| Vest + cliff | Lockup. Overhang, not float |
| Graduation into a new pool | Opening auction ending, continuous trading beginning on a new venue |
| Creator fee on every swap | Issuer selling the aftermarket, forever |
| Amplification ratio | How many dollars of cap appear per dollar of tape, the microcap tell |

The honest analog for most launch tokens is not an IPO of a company. It is a microcap with a thin specialist book, a large locked supply, and a promoter who is paid on volume. The sticker is a multiple of the last print. The cash that can pay a seller is the quote on the current shelf, plus whatever the next buyer brings.

## 5. Factory field guide

Mechanics below are the durable shape. Fees, graduation thresholds, and daily volume change. Re-pull DefiLlama / MemeFees / the factory docs before quoting them. Snapshot of pad fee share on 6 Sep 2026 (MemeFees): Pons led 24h fees among tracked pads that day. Rankings rotate. Do not freeze them.

### Doppler (Whetstone Research)

The launch protocol. Airlock mints the token, an initializer stocks Uniswap v3 or v4, a hook can lock the book, a migrator can move it or refuse. Whitepaper (Jan 2024) and Multicurve paper (Apr 2025) at doppler.lol. Integrators named in those papers and in Bankr's docs: Zora, Bankr. Others (Paragraph, Noice) re-verify before naming.

Products, do not mix:

- Static: older single-range, often v3.
- Dynamic auction: moving slugs + epochs. Better capital efficiency, worse intuition. Not most 2026 Bankr agent coins.
- Multicurve: stacked static v4 ranges. Integrator picks curves as market-cap bands or raw ticks, `numPositions` per curve, `shares` of sale tokens per curve. Inside one curve, tokens are split equally across overlapping positions that all end at the far tick (Multicurve paper, Apr 2025, eq. 3.1 and 3.2). That fixes the single-range failure: on one constant-liquidity position the amount of token sold per price bin falls as price rises, so the cheapest bins sell the most supply, mostly to snipers. Calibration print from the same paper: Zora cut its starting price 60x (from $1,320 to $22) with one curve at the same sniping cost as a single position. Tail curve with `end: max` and `numPositions: 1` is the thin infinite shelf.

Multicurve outfits: standard, scheduled (start-time gate), decay (swap fee starts high and fades over seconds; the wrapper Bankr adopted in Feb 2026), rehype (a Doppler Hook plugged into the initializer: decaying swap fee, fee split to beneficiaries and buybacks, LP fee reinvested as full-range liquidity; Bankr's recipe on Base by Aug 2026). Migration: noOp, Uniswap v2, v3, v4 with streamable fees. noOp is supported on multicurve and lockable v3 static pools, not on dynamic auctions (docs.doppler.lol, read 6 Sep 2026). NoOp means the book never leaves. That is a lock plus a chart that does not break.

Hook lock, verified in deployed code on Base (Sourcify, 6 Sep 2026). Two generations, and they answer "can someone else LP" differently:

- Older multicurve initializers (the standard, scheduled, and decay contracts the Doppler SDK lists for Base): `beforeAddLiquidity: true`, reverting `OnlyInitializer` for any sender but the initializer. Outsiders cannot add. `beforeRemoveLiquidity` is not hooked and does not need to be: the initializer owns every position and a pool in `Locked` status has no exit. The dynamic-auction hook reverts adds the same way (`CannotAddLiquidity`).
- `DopplerHookInitializer` (the current multicurve initializer, live on Base since at least 29 Aug 2026): `beforeAddLiquidity: false`. Anyone can add a range to the pool. What stays locked is the factory's own positions, which the initializer owns with no exit path. On these pools "nobody else can LP" is false. The right sentence is "nobody can pull the designed book, and anyone may add beside it." The Rehype Doppler Hook that Bankr attaches does exactly that: it reinvests the LP fee as full-range liquidity, thousands of small adds, so the pool deepens by a sliver on every swap.

So read the pool's hook address and call `getHookPermissions` before saying who can LP. The eval prompt "why can't someone else LP" may carry a false premise, and the agent should say so when it does. This is not an LP-NFT in a timelock either way.

Slugs live on the dynamic product only.

### Clanker

A different factory. Farcaster-native origin, later a general SDK. Deploys an ERC-20 plus a Uniswap v4 pool in one flow. v4 locker allows up to 7 LP positions with creator-chosen ranges and bps (Clanker v4 docs and the "Introducing Clanker v4" post; re-verify the cap). That is the "7 rungs" line. Short decaying sniper fee at launch (high start, fast decay) then a standing fee. Clanker protocol take is separate from the creator fee. Outside LPs can often join the pool after deploy, so the book can thicken. Bankr used Clanker first. Older Bankr tokens may still live there.

Better when you want a DIY ladder and extra human LPs. Worse when you wanted a hook-owned book nobody can pull or dilute.

### Bankr

A storefront and agent runtime, not a factory. Bankr docs (read 6 Sep 2026): default launch chain is Robinhood Chain, with Base and Arbitrum as options; 85% of a 100B supply seeds the Uniswap v4 pool and 15% vests to the creator over 1 year with a 30-day cliff, or vesting is off and 100% goes to the pool; partner-key launches sell 100% into the pool. Bankr launched on Clanker first, moved to Doppler in Feb 2026 (scheduled multicurve on 10 Feb, decay multicurve on 13 Feb, per a third-party deep dive dated 24 Feb 2026), and by 29 Aug 2026 a Base launch read from chain used `DopplerHookInitializer` plus the Rehype Doppler Hook (see section 7). The server auto-detects Doppler versus leftover Clanker tokens when claiming fees. Governance and migrator are noOp on the Doppler path. Two launch-week rules worth knowing: an anti-snipe swap fee that decays over about 10 seconds, and a five-minute cap of 2% of supply per wallet. "Degen mode" starts the pool at a $2,500 market cap instead of the standard opening valuation, which makes the early shelf far thinner in both directions.

Fee stack, calibration from docs.bankr.bot on 6 Sep 2026, fixed per token at launch: a 0.7% pool swap fee of which 95% (0.665% of volume) goes to the creator; the hook adds 0.285% LP fee that compounds as locked liquidity, 0.475% Bankr protocol, 0.2375% BNKR buyback, and about 0.0875% to Doppler; 1.75% all-in. Older tokens keep the schedule they launched with. Re-read the page before quoting any of these.

Why Bankr hired Doppler, as structure not a press quote: locked book, designed curve, creator fee stream, compounding LP fee, one chart. Cost: outsiders cannot thicken the drawer.

### Pons

Robinhood Chain launchpad. Independent of Robinhood the broker. Tokens are not Robinhood products.

A family, not one contract. Two shapes verified on their own sites, 6 Sep 2026:

- PonsPad (Pons v2): Family A. The whole supply is minted to a bonding curve; when the curve sells out, a Uniswap v4 pool is created and its liquidity is locked with no unlock for anyone, Pons included. Native ETH pair by default. Creator picks a fee strategy at launch (locked liquidity, buyback and burn, staking, holder dividends). Pair, creator tax, and graduation terms are fixed at creation.
- Pons on Pons: Family B with a twist. One transaction creates the token and a live Uniswap v4 pool quoted in ETH; the curve is that pool, tradeable from block one. At 4.2 ETH raised the curve closes, the raise market-buys a graduated Pons token in one public swap, and a new pool seeds at the final price, paired with that token, with the position minted into a contract with no way out. Fee modes (quote burn, holder rewards, none) are permanent from creation.

Do not call either one "Pons v1" without checking which contract the token came from. Uniswap Labs bought PONS tokens, announced 4 Sep 2026; amount, price, and venue were not disclosed (Pons announcement, reported by PANews and crypto.news). Pools.trade is Uniswap's own launch storefront on the same chain; verify which Uniswap launch path a given Pools token used before classifying it. Treat Pons as the default Robinhood Chain meme factory the way pump.fun is the default Solana meme factory, until the tape says otherwise.

### Other factories worth naming

| Factory | Home | Family | What to check first |
|---|---|---|---|
| pump.fun | Solana | A. curve then PumpSwap | Graduation mcap, who owns PumpSwap LP, current trade fee |
| four.meme | BNB Chain | A | Graduation in BNB, creator fee, whether LP is locked |
| Meteora DBC | Solana | A, configurable curve | Curve shape, migration target, fee share |
| Raydium LaunchLab | Solana | A | Which of their curve types this token used |
| Virtuals | Base, Solana, Robinhood | Agent-token economics | Pairing asset (VIRTUAL etc), agent fee, graduation |
| Zora | Base, Solana | B, Doppler integrator | Content-coin vs collectible, Doppler curve config |
| Flaunch | Base | B / fair-launch + fee share | Fee routing, who can LP |
| Uniswap Liquidity Launchpad (CCA) | multi-chain | C | Auction window, clearing price, release schedule, which v4 strategy seeds the pool |
| Pools.trade | Robinhood Chain | verify per token | Which Uniswap launch path it used, lock, fees |
| Flap.sh | BNB Chain / Robinhood | high-throughput pad | Factory address, fee, lock |
| Bags / Believe / Moonshot / Jupiter Studio | Solana cluster | variants of A | Do not assume pump.fun mechanics |

If a pad is not in this table, classify it with section 2 before memorizing a brand.

### Auction primitives (the four ways a first price gets found)

Not every launch is a curve. Name the primitive before naming the pad.

- Dutch clock: price starts high and steps down until buyers appear. Doppler's dynamic auction is this, with the bonding curve taking over once sales start (Doppler whitepaper, Jan 2024). Sellers who wait are rewarded until someone else moves first.
- Rising curve: price starts low and climbs with tokens sold. pump.fun, Doppler static and multicurve, Clanker ladders. Cheap early bins are the sniper's payday; multicurve exists to flatten how much supply sits in them.
- Uniform-price auction: everyone in a window pays one clearing price. CCA is the continuous version, one clearing price per block. Nothing trades until it closes, so there is no launch candle to chase.
- Fixed price: one posted price, first come first served. Adams' note (25 Aug 2025) argues it is "guaranteed to be wrong": too high and it never trades, too low and snipers take the difference. Treat a fixed-price sale as an unpriced sale.

Two results from the same paper trail that change how to read a launch tape. Price Discovery Auctions (Adams, 26 Nov 2025): the stable long-run price sits a little higher than the "cheap" clearing price, because expected underpricing is captured by resellers before believers can act, and the reseller exit is what collapses the first equilibrium. am-AMM (Adams, Moallemi, Reynolds, Robinson, arXiv 2403.03367, 2024 to 2025): an onchain auction for the right to be a pool's manager and set its fee, with the winner's rent paid to LPs. That is a fee-rights auction on a live pool, not a launch primitive, and not an options AMM. Do not mash it with Dutch auctions or with covered calls.

## 6. Discriminating questions

Run these on any launched token before talking about "liquidity" or "fair launch."

1. Venue or factory or storefront? Name all three.
2. Family A or family B? If A, has it graduated, and to which pool.
3. Who owns the LP. Hook, locker, creator, dead address, or open.
4. Can a stranger add a range today. If the hook reverts, the DexScreener LP list is not extra depth.
5. Quote reserve versus market cap. Compute amp floor `2 x MC / quote`. If spot is much richer than reserve ratio (quote / tokens in the pool), a lot of inventory is off this tick. Use a smaller effective drawer.
6. Inventory clock and dollar clock. Tokens left in the shop versus designed market-cap band.
7. Vest, cliff, team, treasury. Float versus supply.
8. Fee destination. Creator, protocol, buyback, compounding LP. Fees that leave the pool thin it. Fees that compound deepen it.
9. Hook powers. Who can change fee, pause, migrate, or pull. Timelock or none.
10. For a size: preview the buy on the venue. The quoted tokens / dollars is the real average price. `(new price / old price - 1) x MC / dollars` is the real amplification. Do not invent a fill.

## 7. How 95% can sit in a middle band

A multicurve (or Clanker multi-position) launch assigns `shares` of sale tokens to each curve. A common Bankr-style Doppler print is a small cheap pocket, a fat middle highway covering a wide market-cap band, and a thin tail to infinity. Example shape from one Base deploy on 29 Aug 2026 (calibration, pool not named here): 2.55B cheap, 80.75B middle, 1.70B tail, on an 85B sale inventory. An earlier Bankr print (Feb 2026, third-party deep dive) was one position holding 99% across roughly $27K to $1.66B of market cap plus a 1% tail. Configs change; read the launch `ModifyLiquidity` events. That 80.75B is not stacked at the current sticker. It is laid across the whole highway. Buys consume the current tick inside that range. What remains is still "in the middle band" until price walks out the top into the tail.

`numPositions` inside a curve is how many overlapping v4 ranges build that highway. One position means one wide shelf. Ten positions means a staircase of overlapping shelves that share the far tick. Both can be "the middle band."

Worked read of one pool, from chain, 6 Sep 2026 (Base block 50,960,149). Calibration, not a quote. Token: defi-native, 0xad46308a6f6999bacc099f3029b77c352e772ba3, launched 29 Aug 2026 00:44 UTC through Bankr's smart wallet (ERC-4337 EntryPoint) into Doppler's Airlock.

- Venue: Uniswap v4 PoolManager, WETH as currency0, dynamic-fee flag, tick spacing 200, initial tick 239,200.
- Factory: `DopplerHookInitializer` at 0xbdf9...6544 (hook and position owner) with the Rehype Doppler Hook at 0x9982...fdbb. Lock beneficiaries 95% creator, 5% Airlock owner. Fee schedule on the hook: 80% at launch decaying to 1.05% over 14 seconds, on top of a 0.7% pool fee. That is the 1.75% all-in.
- Storefront: Bankr. 100B supply, 85B to the pool, 15B vesting to the creator with a 30-day cliff over 365 days (VestingScheduleCreated in the launch tx).
- Three positions at launch, 85.00B total: [232,200 to 239,200] 2.55B, [122,200 to 232,200] 80.75B, [-887,200 to 122,200] 1.70B. Three positions means `numPositions: 1` per curve. The middle shelf is one constant-liquidity range.
- State on 6 Sep 2026: tick 208,555, price about 2.18e-6 USD, sticker about $217k. WETH inside the pool's positions 16.46 (about $40.8k at $2,480.63 per ETH): 15.12 on the middle shelf, 1.19 in the rehype full-range position, 0.15 left in the launch pocket. Tokens left: 24.5B of 80.75B on the middle shelf, 1.70B tail untouched, 1.36B in the rehype position.
- Amp floor `2 x 217 / 40.8` is about 10.7x if the whole drawer were on this tick. The middle shelf holds 92% of the WETH, so the floor is close to right here, and the fill still belongs to the venue preview.
- Two clocks disagree loudly. Inventory clock: 70% of the middle shelf's tokens are already sold. Dollar clock: price has covered about 10x of a band that runs another 5,600x to $1.23B. That is the single-range effect inside a multicurve: one constant-liquidity range from $21k to $1.23B sells most of its tokens in the cheap bins, exactly the failure the Multicurve paper describes, because the integrator chose one position for the wide curve. More positions per curve would have moved supply up the band.
- Who can LP: `getHookPermissions` on 0xbdf9...6544 returns `beforeAddLiquidity: false`. Anyone may add. Through 6 Sep 2026 only two senders ever had: the initializer (the three launch positions plus fee collections) and the rehype hook (9,356 full-range adds, zero removes). The designed book cannot be pulled. The premise "nobody else can LP" is wrong for this pool.

## 8. Task playbook

Learn: load this file plus concepts 16 and 18 plus `analogs.md` liquidity chapter. Draw the three layers, then the family, then the three objects (sticker, building, shelf).

Assess a named token: identify factory from the deploy-to address or Bankr/Clanker/Doppler docs, read the hook and its `getHookPermissions`, count positions from `ModifyLiquidity` at launch, pull DexScreener/GeckoTerminal for MC and quote reserve (the launch-pool forensics recipe in `data-sources.md` does this from raw logs), compute amp floor, state vest and lock, then preview size rather than guessing fill.

Content: use the shop / shelf / sticker language. Do not say 7 rungs unless the token is actually Clanker v4 with 7 positions. Do not say slug unless it is a Doppler dynamic auction.

Monitor: factory mix on the chain (Bankr-Clanker vs Bankr-Doppler, Pons vs Pools.trade), fee-share tape (MemeFees, DefiLlama), whether a pad changed migrator or fee this week.

## Sources (manifest candidates; cite, never reproduce)

- Uniswap v4 docs: hooks, singleton PoolManager, v4 vs v3, concentrated liquidity. https://docs.uniswap.org and https://developers.uniswap.org
- Uniswap Liquidity Launchpad / CCA overview. https://developers.uniswap.org/docs/liquidity/liquidity-launchpad/overview
- Doppler protocol docs and repo. https://docs.doppler.lol (llms.txt; migration options, doppler-hooks, multicurve example pages), https://github.com/whetstoneresearch/doppler
- Doppler whitepaper (Jan 2024). https://www.doppler.lol/whitepaper.pdf. Doppler Multicurve (Apr 2025). https://www.doppler.lol/multicurve.pdf
- Adams, Price Discovery Auctions (26 Nov 2025). https://aada.ms/pdfs/pda.pdf. Adams, A Note on Fixed Price Auctions (25 Aug 2025). https://aada.ms/pdfs/fp_auctions.pdf. Adams, Moallemi, Reynolds, Robinson, am-AMM. https://arxiv.org/abs/2403.03367
- Deployed Doppler initializer hooks on Base, verified source via Sourcify (6 Sep 2026): multicurve 0x65dE470Da664A5be139A5D812bE5FDa0d76CC951, scheduled 0xA36715dA46Ddf4A769f3290f49AF58bF8132ED8E, decay 0xD59cE43E53D69F190E15d9822Fb4540dCcc91178 (from the Doppler SDK address book), DopplerHookInitializer 0xbdf938149ac6a781f94faa0ed45e6a0e984c6544 and RehypeDopplerHookInitializer 0x9982538f41f2ae29ddb9d3d9307010052984fdbb (from the defi-native launch tx 0x8ff81dcd6d4a135dc1b072f0b8dd89fe408a07285a1060c2ebcae6a17cb9cf20)
- Whetstone Research product page. https://whetstone.cc/doppler
- Bankr token-launching overview and fee-splitting pages. https://docs.bankr.bot/token-launching/overview/ and https://docs.bankr.bot/token-launching/fee-splitting (llms.txt)
- Third-party deep dive on Bankr's Feb 2026 move to Doppler (ignaciopastorsanchez.com, 24 Feb 2026). Secondary source; use for dates, verify mechanics in code.
- Clanker v4 SDK and locker (MAX LP positions = 7). https://www.clanker.world/skill/skill.md, https://clanker.gitbook.io/clanker-documentation, Paragraph "Introducing Clanker v4"
- PonsPad docs. https://ponspad.app/docs. Pons on Pons. https://www.ponsonpons.com
- MemeFees launchpad fee and launch counts (live tape, not a mechanic). https://memefees.com
- DefiLlama fees by protocol
- concepts.md sections 16 and 18, options-and-liquidity.md (hooks as admin keys; CL = short options), market-microstructure.md (depth as quantity)
