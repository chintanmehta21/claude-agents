---
name: BraveSearch MCP Integration
description: This skill should be used when a Scout agent needs to search the web for trading strategies, forum discussions, or financial articles using the Brave Search API. Trigger phrases include "search for strategies", "find trading discussions", "web research", "brave search", "search Reddit", "search forums".
version: 1.0.0
---

# BraveSearch MCP — Web Research Skill

## Purpose

Provides structured guidance for using the Brave Search API (via MCP client or direct WebSearch tool) to find recent, high-quality trading strategy content from Reddit, trading forums, financial blogs, and news sites. Handles rate limits, quota exhaustion, and CAPTCHA-blocked sources.

## Stakeholder

Used by **Scout agents** (`agents/scout.md`) across all four research domains (WebSearch, Reddit, Forums, TradingView). Referenced by the **ScoutLeader** when diagnosing search failures.

## Instructions

### 1. Search Query Construction

Build search queries that maximize relevance for Indian options trading:

**Query Templates by Domain:**

| Domain | Query Pattern | Example |
|--------|--------------|---------|
| WebSearch | `"[strategy_type] [underlying] options strategy India [year]"` | `"iron condor BankNifty options strategy India 2025"` |
| Reddit | `"site:reddit.com [subreddit] [strategy_keywords] [instrument]"` | `"site:reddit.com IndianStreetBets weekly expiry nifty options"` |
| Forums | `"site:[forum_domain] [strategy_keywords] options trading"` | `"site:traderji.com options selling strategy adjustment"` |
| TradingView | `"site:tradingview.com [indicator] [instrument] pine script India"` | `"site:tradingview.com RSI divergence nifty options pine script"` |

**Query Modifiers for Niche Results:**
- Add `"niche"`, `"unconventional"`, `"advanced"`, `"institutional"` to avoid basic results
- Add year filters: `"2024"`, `"2025"` to get recent content
- Add performance keywords: `"backtest"`, `"results"`, `"P&L"`, `"win rate"` to find evidence-backed strategies
- Negative filters: `-"basic"`, `-"beginner"`, `-"covered call tutorial"` to exclude introductory content

### 2. Rate Limit Handling

**BraveSearch API limits:**
- Free tier: 1 query/second, 2,000 queries/month `[VERIFY: current Brave Search API rate limits]`
- Pro tier: Higher limits, check current pricing

**Rate limit strategy:**
1. Space queries at minimum 1.5 seconds apart
2. Track query count per run in `shared_context.json` under `search_quota`
3. If approaching quota limit (>80% used), switch to targeted queries only — no exploratory searches
4. Log remaining quota after each search batch

### 3. Quota Exhaustion Fallback

When BraveSearch quota is exhausted mid-run:

1. **First fallback:** Switch to the WebSearch tool (Claude's built-in web search)
   - Same query patterns apply
   - Log: `[QUOTA_EXHAUSTED: BraveSearch — switched to WebSearch tool]`

2. **Second fallback:** Use WebFetch with direct URLs
   - Use known source URLs from `shared_context.json` source list
   - Fetch pages directly instead of searching
   - Log: `[QUOTA_EXHAUSTED: Both search APIs — using direct URL fetching]`

3. **Third fallback:** Use cached/archived content
   - Try Google Cache: `"cache:[URL]"` queries
   - Try web.archive.org/web/ + URL
   - Log: `[QUOTA_EXHAUSTED: All search — attempting cached content]`

4. **Complete exhaustion:** Mark domain as `UNAVAILABLE`
   - Log: `[DOMAIN_UNAVAILABLE: No search capability remaining]`
   - Report to ScoutLeader for degraded coverage handling

### 4. CAPTCHA and Anti-Bot Handling

When a source returns a CAPTCHA or blocks automated access:

1. Do NOT attempt to solve CAPTCHAs — this violates the system's ethical guidelines
2. Log: `[CAPTCHA_BLOCKED: [URL] — switching to alternative source]`
3. Try alternative sources for the same content:
   - Reddit content → Try old.reddit.com or reddit search API
   - Forum content → Try Google Cache or alternative forum
   - Blog content → Try web archive
4. If all alternatives blocked, skip the source and document the gap

### 5. Result Quality Assessment

For each search result, assess quality before extracting strategy content:

| Quality Signal | High Quality | Low Quality |
|----------------|-------------|-------------|
| Source type | Published article, research paper, detailed thread | Single comment, click-bait headline |
| Detail level | Specific entry/exit conditions, indicators, strike selection | Vague "buy calls when bullish" |
| Evidence | P&L screenshots, backtest results, real trade logs | "Trust me bro" anecdotes |
| Recency | Within last 18 months | Older than 18 months → `[STALE]` flag |
| Indian market focus | Specifically discusses NSE/BSE instruments | US-only without Indian context |

### 6. Search Result Documentation

For every search query executed, document:

```
SEARCH LOG:
  Query: "[exact query string]"
  Tool: BraveSearch | WebSearch | WebFetch
  Results: [count] results returned
  Relevant: [count] results meeting quality threshold
  Extracted: [count] strategies extracted
  Timestamp: [ISO]
  Quota remaining: [if trackable]
```

## Changelog

`[Built from scratch — v1.0]`
