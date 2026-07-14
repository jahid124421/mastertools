# 🤖 24/7 AI Agents to Run MasterTools (and other things)

Research from GitHub + agent directories (2026). These are open-source agents you can **self-host**
so they run continuously — building tools, monitoring the site, generating content, and handling ops
while you sleep. Grouped by what you actually need them for.

> Reality check (from the sources): the agents that produce real results in 2026 are **narrow, boring,
> and supervised** — single-function agents on schedules, not one magic "do everything" bot. Give each
> agent one clear job, review its output, and chain them together.

---

## 1. Agent runtimes that run continuously (cron / always-on)
These give agents persistent memory + scheduled execution — exactly what "24/7" needs.

- **[ClickHouse/nerve](https://github.com/ClickHouse/nerve)** — Self-hosted agent runtime on the Claude
  Agent SDK. Persistent memory, **scheduled execution / cron jobs**, task management, learnable skills,
  reachable via web UI or Telegram. Best all-round pick for an always-on worker.
- **[aegra](https://github.com/aegra/aegra)** — Self-hosted agent backend (FastAPI + PostgreSQL),
  **scheduled cron jobs**, zero vendor lock-in. Good if you want full control of the infrastructure.
- **[lythelab/autonomous-agent](https://github.com/lythelab/autonomous-agent)** — Runs continuously,
  plans with LLMs, executes code in a **secure sandbox**, persistent memory, resumable sessions,
  API control, results-only output. Python backend + React frontend.
- **[swarmclawai/swarmclaw](https://github.com/swarmclawai/swarmclaw)** — Multi-agent runtime with
  memory, MCP tools, **schedules**, delegation, and 23+ LLM providers (Claude, GPT, Gemini, OpenRouter,
  **Ollama** for free local models). A practical Claude Code / LangChain alternative.
- **[MaxMiksa/Auto-Company](https://github.com/MaxMiksa/Auto-Company)** — An "auto-company" that works
  24/7 on your own PC. Interesting for a solo operator wanting a virtual team.

## 2. Autonomous coding agents (to build & maintain the website)
Point these at the MasterTools repo to add tools, fix bugs, and ship features on a schedule.

- **[keithbooher/autonomous-dev-agents-system](https://github.com/keithbooher/autonomous-dev-agents-system)**
  — Multi-agent Claude Code system: PRD → TRD → code pipeline, agents take tasks from a backlog,
  build features, review PRs, keep the queue stocked — all on **cron schedules**, inside a Discord bot.
- **[ColeMurray/background-agents](https://github.com/ColeMurray/background-agents)** — Open-source
  background coding agents system (inspired by Ramp's Inspect). Runs coding tasks in the background.
- **[DonTizi/CodeGeass](https://github.com/DonTizi/CodeGeass)** — Governs/orchestrates Claude Code &
  Codex: **schedule coding tasks across projects**, reusable skills, review changes before execution,
  monitor via a web dashboard. Great for supervised autonomy.
- **[Fr-e-d/GAAI-framework](https://github.com/Fr-e-d/GAAI-framework)** — Drop a `.gaai/` folder into
  any project; Discovery defines what to build, Delivery executes autonomously until tests pass.
  Works with Claude Code, Codex CLI, Gemini CLI, Cursor. No SDK — just Markdown + YAML + bash.
- **CLI agents to power the above** (from [awesome-cli-coding-agents](https://github.com/bradAGI/awesome-cli-coding-agents)):
  **Aider, OpenCode, Goose, Pi** (open source) and **Claude Code, Codex CLI, Gemini CLI** (platform).

## 3. Web / browser & scraping agents (research, competitor & content ops)
Use for: finding new high-traffic tool ideas, monitoring competitor tool sites, pulling keyword data.

- Curated, tested lists to pick from:
  - **[awesome-ai-agents-2026 (ARUNAGIRINATHAN-K)](https://github.com/ARUNAGIRINATHAN-K/awesome-ai-agents-2026)** — 300+ agents/frameworks with benchmarks.
  - **[AIMultiple: 30+ open-source web agents](https://www.research.aimultiple.com/open-source-web-agents/)** — autonomous agents, computer-use controllers, web scrapers, dev frameworks (tested).
  - **[77 best open-source agent repos](https://growthexe.substack.com/p/77-best-open-source-ai-agent-repositories)**.

## 4. Frameworks to build custom agents (if you want your own)
From the top-starred agent frameworks ([fungies ranking](https://fungies.io/top-github-repositories-ai-agent-frameworks-2026/)):
**LangChain / LangGraph, CrewAI, Microsoft AutoGen, OpenAI Agents SDK/Swarm, Dify, n8n** (visual, huge
for automations), and **Ollama** to run open-weight models locally for near-zero cost.

---

## Suggested 24/7 setup for MasterTools (cheap + supervised)
1. **Builder agent** — `nerve` or `CodeGeass` running an Aider/Claude Code loop against the repo on a
   cron: each night, pick the next "roadmap" tool from `tools-data.js`, implement it, open a PR for you to review.
2. **Content/SEO agent** — a scheduled web agent that finds trending tool keywords + writes a short
   how-to page per tool (feeds the SEO traffic engine).
3. **Ops/monitor agent** — a small cron agent that pings the site, checks tools load, and alerts you
   (Telegram/Discord) on failures.
4. **Model backend** — run **Ollama** (open-weight models) for the PRO tools' AI features to keep
   per-request cost ~10x below frontier APIs.

**Cost control:** keep humans in the loop on merges (review PRs), cap agent token budgets, and prefer
local/open-weight models for high-volume tasks. Never give an unsupervised agent deploy + billing access.

*Sources: linked inline. Content summarized/rephrased for licensing compliance.*
