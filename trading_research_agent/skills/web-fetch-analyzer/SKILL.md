---
name: Web Fetch Analyzer
description: This skill should be used when a Scout agent needs to fetch and analyze web page content, bypass SPA shells that return HTTP 200 with no rendered content, extract Pine Script logic from TradingView, or handle paywalled/anti-bot-protected sources. Trigger phrases include "fetch page", "extract pine script", "SPA shell", "no rendered content", "headless browser", "paywall bypass", "web scraping".
version: 1.0.0
---

# Web Fetch Analyzer — Content Extraction Skill

## Purpose

Provides structured guidance for fetching, rendering, and extracting meaningful content from web pages that may use JavaScript rendering (SPAs), anti-bot protection, or obfuscated code. Specializes in extracting Pine Script logic from TradingView and strategy details from trading forums.

## Stakeholder

Used by **Scout agents** (`agents/scout.md`), primarily the TradingView/Zerodha and Forums domain scouts. Referenced by the **ScoutLeader** when diagnosing content extraction failures.

## Instructions

### 1. Standard Web Fetch Protocol

For straightforward web pages (blogs, articles, static forums):

1. Use the **WebFetch** tool with the target URL
2. Provide a focused prompt: `"Extract all options trading strategy details including entry conditions, exit rules, strike selection, stop loss levels, and any backtest results"`
3. If the page returns meaningful content, extract strategy details
4. If the page returns an error or empty content, proceed to SPA handling

### 2. SPA Shell Detection and Handling

**Problem:** Many modern financial sites use JavaScript SPAs. WebFetch may receive an HTTP 200 response containing only the SPA shell (HTML with `<div id="app">` or similar) but no rendered content.

**Detection signals:**
- Response contains `<div id="root">` or `<div id="app">` with no sibling content
- Response body is less than 5KB despite being a content-heavy page
- Response contains only `<script>` tags and no visible text
- Response mentions "Loading..." or "Please enable JavaScript"

**Resolution protocol:**
1. **Attempt 1:** Use WebFetch with a more specific prompt asking to extract any visible text
2. **Attempt 2:** Try an alternative URL format:
   - For Reddit: Use `old.reddit.com` instead of `www.reddit.com`
   - For TradingView: Try the published idea/script direct URL with `/chart/` prefix
   - For forums: Try the mobile version URL if available
3. **Attempt 3:** Search for a cached version:
   - Google Cache: Search `"cache:[URL]"` via WebSearch
   - Web Archive: Try `https://web.archive.org/web/[URL]`
4. **Give up:** Log `[SPA_SHELL — no rendered content after 3 attempts]` and skip this source

### 3. Pine Script Extraction

For TradingView Pine Script sources:

**Step 1: Locate the script**
- TradingView scripts are at URLs like `tradingview.com/script/[ID]/`
- Published scripts may have source code visible
- Some scripts are compiled/obfuscated — these cannot be extracted

**Step 2: Extract logic**
- Use WebFetch to read the script page
- Look for Pine Script syntax markers:
  - `//@version=5` or `//@version=4` (version declaration)
  - `strategy(` or `indicator(` (script type)
  - `ta.rsi`, `ta.macd`, `ta.ema` (built-in indicators)
  - `strategy.entry`, `strategy.close` (entry/exit logic)
  - `input.int`, `input.float` (configurable parameters)

**Step 3: Translate to strategy**
- Convert Pine Script logic into the Strategy Output Schema:
  - `strategy.entry("Long", ...)` conditions → Entry Conditions
  - `strategy.close("Long", ...)` conditions → Exit Conditions
  - `strategy.risk.max_drawdown(...)` → Risk parameters
  - Input parameters → Configurable strategy parameters

**Step 4: Handle obfuscation**
- If the script source is not visible (compiled, invite-only, or protected):
  - Log `[OBFUSCATED — no recoverable logic]`
  - Extract whatever is visible from the script description and comments
  - If the description contains enough detail to reconstruct the strategy concept, document it as `[RECONSTRUCTED FROM DESCRIPTION — original source code not available]`
  - Otherwise, skip and move to the next script

### 4. Anti-Bot Protection Handling

**Cloudflare / generic WAF protection:**
- Do not attempt to bypass automated security measures
- Log: `[ANTI_BOT_BLOCKED: [URL] — Cloudflare/WAF protection]`
- Try alternative access methods:
  1. Direct API endpoint if the site has one
  2. RSS feed if available
  3. Google Cache
  4. Web Archive
  5. Alternative source with same content

**Rate-limited responses (HTTP 429):**
- Wait and retry is not practical in this pipeline context
- Switch to alternative source immediately
- Log: `[RATE_LIMITED: [URL] — switching to alternative]`

### 5. Paywall Handling

When encountering paywalled content:

1. **Check for free preview:** Many paywalled sites show the first paragraph or abstract
2. **Check Google Cache:** `"cache:[URL]"` sometimes has the full content
3. **Check Web Archive:** `web.archive.org/web/[URL]` may have a pre-paywall snapshot
4. **Extract from preview:** If only a preview is available, extract what strategy information is visible and note: `[PARTIAL_EXTRACTION — full content behind paywall]`
5. **Skip if nothing extractable:** Log `[PAYWALL — no cached preview available]` and move to next source

### 6. Content Validation

After fetching content, validate before extracting strategies:

- **Language check:** Content must be in English or translatable
- **Relevance check:** Content must discuss options trading (not just equity or forex)
- **Market check:** Content must be about Indian markets or translatable to Indian context
- **Recency check:** Publication date within 18 months, or flag `[STALE]`
- **Completeness check:** Content must contain enough detail to populate the Strategy Output Schema

## Changelog

`[Built from scratch — v1.0]`
