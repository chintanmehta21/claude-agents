# Claude Agents

A collection of AI agents, plugins, and skills built for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Each subdirectory is a self-contained project — an agent pipeline, a Claude Code plugin, or a skill pack — designed to be installed and run independently.

## Projects

| Project | Description | Status |
|---------|-------------|--------|
| [`trading_research_agent`](./trading_research_agent/) | Four-tier multi-agent pipeline for Indian options trading strategy research. Spawns 8+ scouts across web, Reddit, forums, and TradingView to discover, enrich, and adversarially verify options strategies for NSE/BSE markets. | v1.1 |

## Structure

```
MyAgents/
  <project>/
    .claude-plugin/
      plugin.json          # Plugin manifest
    agents/                # Agent definitions (markdown prompts)
    skills/                # Reusable skill files
    hooks/                 # Lifecycle hooks (JS/Python)
    commands/              # Slash commands
    rules/                 # Domain knowledge files
    README.md              # Project-specific docs
```

> Not every project follows this exact layout. Each project's own README has the details.

## Getting Started

1. Clone this repo
2. Navigate to the project you want to use
3. Follow the project-specific README for installation

## License

Each project may have its own license. See individual project directories.
