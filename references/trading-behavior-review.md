# Trading behavior review: your own record, and any backtest claim someone hands you

## 1. What this file serves, and when it triggers

This file holds two related models. First, a read-only review of the user's own onchain trade record: profile the recurring behavior, extract the implicit rules the person seems to be following, and compare the actual path against that rule set. Second, a due-diligence model for judging any backtest or track-record claim a DeFi strategy product waves around. Both are descriptive, not advisory: this file names patterns and asks questions, it never tells the user what to trade next.

Load this file when the user asks to review their own trading (a wallet's swap, perp, or liquidity-provider (LP) history), asks whether they overtrade, chase pumps, or hold losers too long, or hands over a backtest, a track record, or a strategy's historical Sharpe ratio and asks whether the number is real. It does not cover strategy or vault blowups (that is `references/trade-anatomy.md`, which asks what a PRODUCT'S book is short) or market monitoring (that is `references/market-pulse.md`, which watches the market, not one person's record). This file is about the user's own hand on the wheel, and about the honesty of a performance claim, never about a product's mechanics.

The pattern (self-diagnosis from a trade journal, then a rule-based shadow to compare against) is translated from HKUDS/Vibe-Trading (MIT license), a TradFi and equities trading-behavior tool. Nothing here reuses its code; the idea is applied to onchain records instead of a brokerage statement, and the trade roster and rule set below are DeFi-native, not a broker's categories.

## 2. The journal: what counts as a trade record onchain, and how to source it read-only

A trade record is the decoded, timestamped history of what a wallet actually did: swaps, perpetual futures (perps) fills, LP position entries and exits, vault deposits and withdrawals, and claims. Build the journal read-only, from whatever `api-routes.json` resolves for the named wallet this session: a labeled transaction-history row when a quality key unlocks one, a keyless block-explorer fallback otherwise, and a perps venue's own read-only info endpoint for fills on that venue. Route by what each row IS, the same discipline the portfolio-intelligence section of SKILL.md already applies: a swap is a trade, a deposit into a vault is an entry into a position, a claim is a reward leg, and an LP position's legs share one group so sum them before reading the position as one trade.

Do not hardcode one provider. The row that answers "give me this wallet's history" changes as the manifest changes; match the question to whatever tier api-routes.json currently offers (MCP, then keyed, then keyless), the same order the portfolio-intelligence rule already sets, and say which tier the record came from. Read only the wallet the user named, never enumerate others, and never echo the address into printed URLs or logs (the same rule that governs any wallet read in this skill).

A usable journal needs enough closed positions to say anything. State the sample size (how many closed trades, over what date range) before naming any pattern. A handful of trades is a story, not a record; say so rather than forcing a verdict.

## 3. Behavior diagnostics: patterns and their onchain detection signature

Each row below is a hypothesis to test against the journal, not a label to apply on sight. State the signature that was actually measured (with the sample size and date range) whenever a pattern is named; a bare adjective ("you overtrade") is not a finding.

| Pattern | Onchain detection signature | Not this |
|---|---|---|
| Disposition effect (holding losers, selling winners early) | Average holding period for positions closed at a loss is longer than for positions closed at a profit, computed on a first-in-first-out (FIFO) cost basis per position, across several closed trades on both sides | One long-held position, alone, proves nothing; the comparison needs both a losing and a winning group |
| Overtrading | Trade count per active week is high relative to position size, and net profit and loss (PnL) after gas and fees falls as frequency rises within the same journal | High frequency backed by a stated market-making or arbitrage rule is a strategy the user chose, not a bias, unless the rule itself cannot be named |
| Momentum chasing | Entries land high in the asset's trailing price range (most entries follow a run-up rather than precede one), repeated across several entries on different assets | Entering after a stated breakout rule, applied consistently, is a strategy; the signature is entries with no stated rule behind them |
| Anchoring | Exits cluster tightly around each position's own cost basis (breakeven) rather than around any market level, and the clustering holds across both winning and losing positions | Exiting near a stated stop-loss or take-profit level tied to the market (not the entry price) is a rule, not anchoring |
| Loss-chasing (averaging down without a rule) | Position size on the same asset increases after a loss, and increases again after the next loss, with no stated sizing schedule | A fixed-schedule dollar-cost-average buy is a rule the user chose in advance, even when it happens to average down |
| Leverage or size creep | Average position size or leverage rises through a run of wins and falls through a run of losses, tracking recent PnL rather than any stated sizing rule | Sizing that scales with a stated volatility or portfolio-risk rule is a rule, not creep, even if the size also happens to rise |

These six are what onchain records can actually show: timing, sizing, and holding duration. They cannot show INTENT. A pattern in the data is evidence for a hypothesis about behavior, never proof of a psychological state; say "the record shows X" rather than "you feel Y."

## 4. Rule extraction: turning a recurring pattern into an explicit strategy profile

Before comparing the actual trades against anything, state what the implicit rule set looks like, in the user's own revealed behavior, not an assumed textbook strategy. For the closed positions in the journal, group by asset class and venue, then look for a repeated shape in four places: the entry trigger (what tends to be true right before this person opens a position), the exit trigger (what tends to be true right before they close one), the sizing rule (position size as a share of the portfolio, and whether it is fixed or drifts), and the typical holding period (a range, not one number).

State each inferred rule with its sample size and how consistent it is (for example: "in most of the closed longs in this window, exits happened within a narrow band above the entry price," naming the count). Where the sample is too small or the pattern is inconsistent, the honest output is "no discernible rule," which is itself a finding: a trader with no stable rule set has nothing to hold themselves to, and no rule breaks are even measurable yet.

The output of this section is a short, explicit profile: entry trigger, exit trigger, sizing rule, typical holding period, each labeled with confidence and sample size. This profile is the SHADOW the next section compares the real path against.

## 5. Shadow comparison: the actual path against the person's own implied rules

Apply the extracted rule set mechanically and consistently to the same journal: this is the shadow account, the path the person's own stated (or revealed) rules would have produced if followed every time. Diff the real trades against it and name three categories, each purely descriptive:

- RULE BREAKS: a real trade that departs from the extracted rule (an entry with none of the usual triggers present, a sizing decision well outside the usual range, an exit far outside the usual holding period).
- EARLY EXITS: a position closed well before the extracted exit rule would have triggered it.
- MISSED EXITS: a position held well past the point the extracted exit rule would have triggered it (the disposition-effect signature, made concrete for this one position).

State each instance with its dates, prices, and the size of the departure. Do not append "you should have held" or "you should have sold": that is forward-looking trading advice, and this file never gives it. Close each instance with a question back to the user instead: was this a deliberate override of your own pattern, or something that happened without you noticing at the time? The value of the shadow comparison is making the gap visible, not judging it.

## 6. Backtest honesty: judging a performance claim, not building one

When a DeFi strategy product, a vault pitch, or a trading tool shows a historical return, run these as due-diligence questions before treating the number as real. This is a checklist for reading a claim, not a guide to constructing a backtest.

- Point-in-time (PIT) data: was the test run only on data that existed and was known AT each historical date, or does it quietly use information only available later (a pool that later grew large, a token that survived a rug wave that delisted its peers, a rate that was restated after the fact)? A backtest over "the top pools today" run backward in time is survivorship bias by construction.
- Overfitting: how many parameters does the strategy have relative to the number of independent trades in the sample, and was the best-looking configuration picked after trying many? A strategy tuned on the same data it is graded on will always look good on that data.
- Walk-forward: does the claim re-fit on a rolling window and then test, out of sample, on the window immediately after, repeated forward through time, or is it one single fit graded on the same stretch it was built from? A single in-sample fit is not a backtest of anything that has not already happened.
- Monte Carlo or bootstrap resampling: does the claim show a distribution of outcomes (resampling the trade order, or the return sequence) or one single equity curve? One path can be luck; a distribution with a stated range tells you how much of the result depends on the exact sequence of events.
- Benchmark context: return against what? A raw annual percentage yield (APY) with no stated benchmark (buy-and-hold on the same asset, a T-bill proxy, a passive LP baseline) is unfalsifiable; ask what it beat and by how much, over the same window.
- The run card: the minimum spine any backtest claim should carry before it is worth a size decision: the exact date range and universe tested, position sizing used, fee and slippage and gas assumptions, the split date between simulated and live results (if any), the sample size in number of independent trades, and the realized maximum drawdown. A claim missing most of this is a marketing number, not a track record; say so and ask for the run card rather than accepting the headline figure.
- Factor decay classification: once a strategy or signal is published or copied widely, its edge does one of three things: stays ALIVE (out-of-sample results since publication still show the edge), REVERSES (the edge flips sign, often because the trade became crowded and the same crowd that pushed the trade also unwinds it together, see the crowding overlay in `references/trade-anatomy.md`), or goes DEAD (the edge decays to noise as everyone trades it). Ask whether anyone has tested the strategy out of sample since the pitch was made, and which of the three describes what happened.

## 7. Discriminating questions and limits

Close a behavior review or a backtest read with the questions the user (or the counterparty) should answer next, never with a verdict framed as advice.

For a behavior review: What does your own record say your usual entry and exit triggers are, and did you know that before seeing this? Which of the rule breaks above were deliberate, and which happened without you noticing? Is your position sizing following a rule you set in advance, or the size of your last win or loss? How many closed trades is this profile actually based on, and would you trust a pattern built on that many?

For a backtest claim: What date range and universe was this run on, and is any of that data known only in hindsight? How many variations were tried before this one was shown? Is this a single equity curve or a distribution across many resampled paths? What is it being compared against? Has anyone re-run this out of sample since it was first shown, and did the edge survive, reverse, or die?

Limits, stated plainly. This file reads records, it does not read minds: a timing or sizing pattern is evidence for a hypothesis, never a diagnosis, and every finding should be offered as "the record shows X," not "you are Y." Small samples produce no reliable pattern; say "insufficient data" rather than force a verdict on a handful of trades. This file never recommends a trade, a strategy, or a change to the user's behavior, and it never constructs, signs, or proposes a transaction; it names patterns, builds the shadow, and hands the user the questions. Any recommendation-shaped output belongs to the opportunities playbook (`references/defi-opportunities-playbook.md`) and its directive-7 protocol, not here.
