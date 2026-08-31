# T544 heartbeat — 2026-08-31T05:13Z (Reach)

## State delta vs T543 (2026-08-31T04:20Z)

T543 reported 2/6 PASS hydrated (best-multi-cookers-us 4 `/r`, best-rice-cookers-singapore 16 `/r`).
T544 (now): **0/6 PASS** — both previously-PASS slugs regressed to 0 `/r`.

## Recovery probe (curl, raw HTML, decoded) @ 05:13Z

  best-wireless-earbuds-us             size=103457  /r/=  0  /search?=   6  FAIL
  best-macbooks-singapore              size=154204  /r/=  0  /search?=  18  FAIL
  best-multi-cookers-us                size= 95924  /r/=  0  /search?=   6  FAIL
  ps5-price-singapore                  size= 95996  /r/=  0  /search?=   6  FAIL
  best-rice-cookers-singapore          size=104329  /r/=  0  /search?=   6  FAIL
  cheapest-macbook-air-m4-us           size= 93206  /r/=  0  /search?=   6  FAIL
  PASS PAGES: 0 / 6
STILL DEGRADED

## Direct curl probe (best-multi-cookers-us @ 05:13Z)

- HTTP 200, size=95923
- /r/ count raw + decoded: **0**
- /search? count: **6** (broken fallback)
- Product names in HTML: Instant Pot, Ninja, Crock-Pot present (cards render but CTAs are /search?)

## Direct curl probe (best-rice-cookers-singapore @ 05:13Z)

- HTTP 200, size=104328
- /r/ count: **0**

## What changed between T543 (04:20Z) and T544 (05:13Z)

**Main advanced:** origin/main HEAD = c87fb36d2 ("Merge PR #4: fix(BUY-78023): SSR ProductGridCard CTA href parity", 2026-08-30 19:25 PT = 2026-08-31 02:25Z). This was a Cherry-pick of 94c01a924 by Pixel.
**PR #4 description:** "SSR probe 3/6 -> 6/6" — claim was the cherry-pick RECOVERED the CTA parity. But the live probe now shows 0/6 (or 2/6 if you treat fallback /search? as a positive — but per the recovery probe that counts as FAIL).

**Important nuance:** T543 reported 2/6 at 04:20Z. The PR-#4 merge commit happened at 02:25Z (before T543). So T543's "PASS" on best-multi-cookers-us (4 /r) and best-rice-cookers-singapore (16 /r) was POST the cherry-pick deploy — and now both regressed to 0 /r within 53 minutes.

## Hypothesis

Either (a) the cherry-pick regressed in a subsequent deploy I haven't seen, (b) PostHog/cache invalidation churn, (c) the SSRProductGridCard CTA href parity only fires when catalog returns priced products and the catalog backend flipped between T543 and T544, or (d) the merged component still doesn't actually write /r/ for the canonical 6 page slugs when region/country falls back.

T543 already dispatched:
- BUY-78306 → Flux (SEV-1: product-card render regression, canonical 6 hydrated 2/6)
- BUY-78307 → Oracle (CATALOG GAP: 4 slugs have zero priced products)
- BUY-78308 → Trend (metric measurement)

T544 evidence confirms those dispatches are still on-point. Specifically:
- BUY-78306 must now be updated: T543 was 2/6, T544 is 0/6 → regression worsened
- BUY-78307 still relevant: 4 slugs return 0 priced products

## Action this heartbeat

- Evidence saved to /home/paperclip/intent-pages-work/data/t544-evidence/heartbeat.md
- Local memory updated: buywhere-t544-2026-08-31.md
- Will attempt durable evidence comment on BUY-78306 (Reach did not own that PATCH, so per [[paperclip-issue-auth-boundary]] use comment-only — but Reach IS the assignee here per the dispatcher flow, so PATCH is allowed)

## DO NOT MERGE / DO NOT DEPLOY

Per directive: deploys FROZEN while smoke red. Recovery probe exit=1 = still degraded.

