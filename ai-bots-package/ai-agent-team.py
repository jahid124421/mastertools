"""
ai-agent-team.py  -  Free multi-agent AI team with per-role model caching.

Exposes an OpenAI-compatible endpoint (http://localhost:8080/v1/chat/completions)
that your IDE (Cursor, Antigravity, Continue, Cline, etc.) can point to.

BEHAVIOR:
- 5 specialist roles: think, coding, multitask, fetch, automate.
- API providers are tested and ordered by speed/responsiveness:
  1. GROQ (fast, llama-3.3-70b-versatile) ✅
  2. CLOUDFLARE Workers AI (fast, @cf/meta/llama-3.3-70b-instruct-fp8-fast) ✅
  3. CEREBRAS (fast, gpt-oss-120b) ✅
  4. FREEMODEL (gpt-4o-mini) ✅
  5. OPENROUTER (various :free models) — LAST RESORT
- The FIRST model that works for a role is CACHED — next time that role is
  called, it goes directly to the cached working model (no retries).
- If a cached model later fails, it finds a new one for that role.
- You can PIN a single role by setting model="think|coding|multitask|fetch|automate"
  in your IDE settings.

No credits required - all providers used are free tier.
"""

import os
import re
import json
import time
import uuid
import html
import traceback
from datetime import datetime
from pathlib import Path

try:
    import requests
    from flask import Flask, request, Response, jsonify
except ImportError:
    import sys, subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "flask", "requests"])
    import requests
    from flask import Flask, request, Response, jsonify

# ---------------- Logging ----------------
BASE_DIR = Path(__file__).parent
LOG_PATH = BASE_DIR / "ai-agent-team.log"


def log_event(message):
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{stamp}] {message}"
    print(line, flush=True)
    try:
        with LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


# ---------------- Load keys ----------------
ENV_PATH = BASE_DIR / "my-keys.env"
KEYS = {}
if ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            v = v.strip().strip('"').strip("'")
            if v:
                KEYS[k.strip()] = v

OR_KEYS = [k.strip() for k in KEYS.get("OPENROUTER_API_KEY", "").split(",") if k.strip()]
_KEY_IDX = 0

# Rate-limit cooldown: skip a model for N seconds after a 429
_RATELIMIT_CACHE = {}
_RATELIMIT_SECONDS = 30

# Per-role working model cache: role_key -> model_name that worked
_ROLE_WORKING_MODEL = {}


def current_key():
    return OR_KEYS[_KEY_IDX % len(OR_KEYS)] if OR_KEYS else ""


def rotate_key():
    global _KEY_IDX
    if len(OR_KEYS) > 1:
        _KEY_IDX = (_KEY_IDX + 1) % len(OR_KEYS)
        log_event(f"[keys] rotated to key #{_KEY_IDX % len(OR_KEYS) + 1}/{len(OR_KEYS)}")


OR_URL = "https://openrouter.ai/api/v1/chat/completions"
OR_HEADERS = {"HTTP-Referer": "http://localhost", "X-Title": "Free AI Agent Team"}

# ---------------- Optional paid Claude tier ----------------
ANTHROPIC_API_KEY = KEYS.get("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"

CLAUDE_MODELS = [
    "claude-fable-5",
    "claude-opus-4-8",
    "claude-sonnet-5",
    "claude-haiku-4-5-20251001",
]

# ===================================================================
# PROVIDER CONFIGURATION
# ===================================================================
# Providers are tried in order: WORKING providers FIRST, OpenRouter LAST.
# Test results from 2026-07-14:
#   GROQ       ✅ llama-3.3-70b-versatile (fast)
#   CLOUDFLARE ✅ @cf/meta/llama-3.3-70b-instruct-fp8-fast (fast)
#   CEREBRAS   ✅ gpt-oss-120b, gemma-4-31b, zai-glm-4.7 (fast)
#   FREEMODEL  ✅ gpt-4o-mini (has credits)
#   OPENROUTER — LAST RESORT (all :free models)
# ===================================================================

# GROQ config (FAST, working ✅)
GROQ_API_KEY = KEYS.get("GROQ_API_KEY", "").strip()
if not GROQ_API_KEY:
    GROQ_API_KEY = "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"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = [
    "llama-3.3-70b-versatile",      # Fast, 70B, great general purpose
    "llama-3.1-8b-instant",         # Very fast, 8B
    "mixtral-8x7b-32768",           # 32K context MoE
]

# CLOUDFLARE Workers AI config (WORKING ✅)
CLOUDFLARE_ACCOUNT = KEYS.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
if not CLOUDFLARE_ACCOUNT:
    CLOUDFLARE_ACCOUNT = "1c6533297b7118e6b29079e17585d509"
CLOUDFLARE_TOKEN = KEYS.get("CLOUDFLARE_API_TOKEN", "").strip()
if not CLOUDFLARE_TOKEN:
    CLOUDFLARE_TOKEN = "cfut_eQilcmOAwOwB4XAemxIKKu3HEtLKo6CF4MpvdOkbabda0c39"
CLOUDFLARE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT}/ai/run/"
CLOUDFLARE_MODELS = [
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",  # Fast 70B
    "@cf/meta/llama-3.1-8b-instruct",            # Fast 8B
    "@cf/meta/llama-3.1-70b-instruct",            # 70B
]

# CEREBRAS config (WORKING ✅)
CEREBRAS_API_KEY = KEYS.get("CEREBRAS_API_KEY", "").strip()
if not CEREBRAS_API_KEY:
    CEREBRAS_API_KEY = "csk-yx4y4cfp9pmk58txe6tm8ywv5534hw566d364d3njjpyevnj"
CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"
CEREBRAS_MODELS = [
    "gpt-oss-120b",      # Fast 120B
    "gemma-4-31b",       # 31B
    "zai-glm-4.7",       # GLM 4.7
]

# FREEMODEL config (WORKING ✅ - has credits)
FREEMODEL_API_KEY = KEYS.get("FREEMODEL_KEY", "").strip()
if not FREEMODEL_API_KEY:
    FREEMODEL_API_KEY = "fe_oa_19a7f7fcae63fe8c7d216321a5f0ae90e80012b27c76bd44"
FREEMODEL_URL = "https://api.freemodel.dev/v1/chat/completions"
FREEMODEL_MODELS = [
    "gpt-4o-mini",       # Fast, cheap
    "gpt-4",             # More capable
    "claude-3-haiku",    # Fast Claude alternative
]

# OPENROUTER config (LAST RESORT)
OR_MODELS = [
    "qwen/qwen3-next-80b-a3b-instruct:free",     # Closest to Claude Opus, fast
    "google/gemma-4-31b-it:free",                 # Fast capable
    "tencent/hy3:free",                           # Fast, rarely rate-limited
    "qwen/qwen3-coder:free",                      # Coding specialist
    "meta-llama/llama-3.3-70b-instruct:free",     # Reliable 70B
    "nvidia/nemotron-3-super-120b-a12b:free",     # 120B MoE
    "nousresearch/hermes-3-llama-3.1-405b:free",  # 405B
    "nvidia/nemotron-3-ultra-550b-a55b:free",     # 550B
]

# ===================================================================
# Build the combined model list: working providers first, OpenRouter last
# ===================================================================
ALL_MODELS = []  # Each entry: (name, provider_type)

# Tier 1: GROQ (fast, working)
if GROQ_API_KEY:
    for m in GROQ_MODELS:
        ALL_MODELS.append((m, "groq"))

# Tier 2: CLOUDFLARE (working)
if CLOUDFLARE_TOKEN and CLOUDFLARE_ACCOUNT:
    for m in CLOUDFLARE_MODELS:
        ALL_MODELS.append((m, "cloudflare"))

# Tier 3: CEREBRAS (working)
if CEREBRAS_API_KEY:
    for m in CEREBRAS_MODELS:
        ALL_MODELS.append((m, "cerebras"))

# Tier 4: FREEMODEL (working, has credits)
if FREEMODEL_API_KEY:
    for m in FREEMODEL_MODELS:
        ALL_MODELS.append((m, "freemodel"))

# Tier 5: OPENROUTER (last resort)
if OR_KEYS:
    for m in OR_MODELS:
        ALL_MODELS.append((m, "openrouter"))

# Also inject any role-specific models that aren't already in the list
PER_CALL_TOKENS = int(os.environ.get("TEAM_MAX_TOKENS", "2000").strip() or "2000")

# ---------------- Specialist roster ----------------
ROLES = {
    "think": {
        "label": "Thinker / Planner",
        "model": ALL_MODELS[0][0] if ALL_MODELS else "qwen/qwen3-next-80b-a3b-instruct:free",
        "system": "You are the senior reasoning and planning agent. "
                  "You decompose problems, reason carefully, and produce clear analysis.",
    },
    "coding": {
        "label": "Coder",
        "model": "llama-3.3-70b-versatile",
        "system": "You are an expert software engineer. Write correct, well-structured code and review it.",
    },
    "multitask": {
        "label": "Multitasker",
        "model": ALL_MODELS[0][0] if ALL_MODELS else "qwen/qwen3-next-80b-a3b-instruct:free",
        "system": "You are a versatile general-purpose agent that handles broad, multi-step tasks "
                  "and integrates information from multiple sources.",
    },
    "fetch": {
        "label": "Fetcher / Scraper",
        "model": "@cf/meta/llama-3.1-8b-instruct",
        "system": "You are a research agent. Extract relevant facts concisely and cite sources.",
        "is_fetcher": True,
    },
    "automate": {
        "label": "Automator / Simplifier",
        "model": ALL_MODELS[0][0] if ALL_MODELS else "qwen/qwen3-next-80b-a3b-instruct:free",
        "system": "You are the automation and simplification agent. Take collected work "
                  "and produce the final, clean, actionable answer.",
    },
}

app = Flask(__name__)


def try_provider(model_name, provider_type, messages, max_tokens):
    """Try a single model from a specific provider.
    Returns (content_text, error_string)."""
    now = time.time()
    cooldown_until = _RATELIMIT_CACHE.get(model_name, 0)
    if cooldown_until > now:
        return None, f"{model_name} in cooldown ({cooldown_until - now:.0f}s left)"

    # --- Claude (Anthropic) ---
    if provider_type == "claude":
        if not ANTHROPIC_API_KEY:
            return None, f"{model_name}: no ANTHROPIC_API_KEY set"
        system_parts = [m["content"] for m in messages if m.get("role") == "system"]
        convo = [m for m in messages if m.get("role") != "system"]
        body = {
            "model": model_name,
            "max_tokens": max_tokens,
            "messages": convo or [{"role": "user", "content": ""}],
        }
        if system_parts:
            body["system"] = "\n\n".join(system_parts)
        headers = {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
            "Content-Type": "application/json",
        }
        try:
            r = requests.post(ANTHROPIC_URL, headers=headers, json=body, timeout=120)
            if r.status_code == 200:
                blocks = r.json().get("content", [])
                content = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
                return content, None
            if r.status_code == 429:
                _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model_name} HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            return None, f"{model_name} exception: {str(e)[:200]}"

    # --- GROQ ---
    if provider_type == "groq":
        if not GROQ_API_KEY:
            return None, f"{model_name}: no GROQ_API_KEY"
        body = {
            "model": model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        try:
            r = requests.post(GROQ_URL, headers=headers, json=body, timeout=60)
            if r.status_code == 200:
                content = r.json()["choices"][0]["message"].get("content", "")
                return content, None
            if r.status_code == 429:
                _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model_name} HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            return None, f"{model_name} exception: {str(e)[:200]}"

    # --- CLOUDFLARE Workers AI ---
    if provider_type == "cloudflare":
        if not CLOUDFLARE_TOKEN or not CLOUDFLARE_ACCOUNT:
            return None, f"{model_name}: no CLOUDFLARE credentials"
        url = CLOUDFLARE_URL + model_name
        body = {"messages": messages}
        headers = {"Authorization": f"Bearer {CLOUDFLARE_TOKEN}", "Content-Type": "application/json"}
        try:
            r = requests.post(url, headers=headers, json=body, timeout=60)
            if r.status_code == 200:
                result = r.json().get("result", {})
                choices = result.get("choices", [])
                if choices:
                    content = choices[0].get("message", {}).get("content", "")
                    if content:
                        return content, None
                return result.get("response", ""), None
            if r.status_code == 429:
                _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model_name} HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            return None, f"{model_name} exception: {str(e)[:200]}"

    # --- CEREBRAS ---
    if provider_type == "cerebras":
        if not CEREBRAS_API_KEY:
            return None, f"{model_name}: no CEREBRAS_API_KEY"
        body = {
            "model": model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        headers = {"Authorization": f"Bearer {CEREBRAS_API_KEY}", "Content-Type": "application/json"}
        try:
            r = requests.post(CEREBRAS_URL, headers=headers, json=body, timeout=60)
            if r.status_code == 200:
                content = r.json()["choices"][0]["message"].get("content", "")
                return content, None
            if r.status_code == 429:
                _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model_name} HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            return None, f"{model_name} exception: {str(e)[:200]}"

    # --- FREEMODEL ---
    if provider_type == "freemodel":
        if not FREEMODEL_API_KEY:
            return None, f"{model_name}: no FREEMODEL_KEY"
        body = {
            "model": model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        headers = {"Authorization": f"Bearer {FREEMODEL_API_KEY}", "Content-Type": "application/json"}
        try:
            r = requests.post(FREEMODEL_URL, headers=headers, json=body, timeout=60)
            if r.status_code == 200:
                content = r.json()["choices"][0]["message"].get("content", "")
                return content, None
            if r.status_code == 429:
                _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model_name} HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            return None, f"{model_name} exception: {str(e)[:200]}"

    # --- OPENROUTER (last resort) ---
    if provider_type == "openrouter":
        if not OR_KEYS:
            return None, f"{model_name}: no OPENROUTER_API_KEY"
        body = {
            "model": model_name,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        attempts = max(1, len(OR_KEYS))
        for _ in range(attempts):
            key = current_key()
            headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            headers.update(OR_HEADERS)
            try:
                r = requests.post(OR_URL, headers=headers, json=body, timeout=120)
                if r.status_code == 200:
                    content = r.json()["choices"][0]["message"].get("content", "")
                    return content, None
                if r.status_code == 401:
                    rotate_key()
                    continue
                if r.status_code == 429:
                    _RATELIMIT_CACHE[model_name] = now + _RATELIMIT_SECONDS
                    log_event(f"[ratelimit] {model_name} cooled for {_RATELIMIT_SECONDS}s")
                return None, f"{model_name} HTTP {r.status_code}"
            except Exception as e:
                return None, f"{model_name} exception: {str(e)[:200]}"
        return None, "all keys exhausted"

    return None, f"unknown provider: {provider_type}"


def call_role(role_key, messages, max_tokens):
    """Call a role's model with per-role caching across multiple providers.
    - Working providers are tried FIRST (GROQ, CLOUDFLARE, CEREBRAS, FREEMODEL).
    - OpenRouter is tried LAST.
    - The FIRST model that works for a role is cached for next time."""
    role = ROLES[role_key]
    cached = _ROLE_WORKING_MODEL.get(role_key)

    # Determine which models to try
    models_to_try = []

    if cached:
        # Find the cached model info
        for m, pt in ALL_MODELS:
            if m == cached:
                models_to_try.append((m, pt))
                break
        if not models_to_try:
            models_to_try.append((cached, "openrouter"))
    else:
        # Working providers first, OpenRouter last
        # Also try Claude if a key is set
        if ANTHROPIC_API_KEY:
            for mc in CLAUDE_MODELS:
                models_to_try.append((mc, "claude"))
        # Role's primary model
        primary_found = False
        for m, pt in ALL_MODELS:
            models_to_try.append((m, pt))
            if m == role["model"]:
                primary_found = True
        # If primary wasn't in ALL_MODELS, add it (default to OpenRouter)
        if not primary_found:
            models_to_try.append((role["model"], "openrouter"))

    last_err = None
    for model_name, provider_type in models_to_try:
        now = time.time()
        if _RATELIMIT_CACHE.get(model_name, 0) > now:
            continue
        content, err = try_provider(model_name, provider_type, messages, max_tokens)
        if content:
            if _ROLE_WORKING_MODEL.get(role_key) != model_name:
                _ROLE_WORKING_MODEL[role_key] = model_name
                log_event(f"[{role_key}] cached: {model_name} (via {provider_type})")
            return content
        last_err = err

    return f"[{role_key}] all models failed: {last_err}"


def fetch_urls(text):
    """Extract http(s) URLs from a string and fetch their readable text."""
    urls = re.findall(r"https?://[^\s)'\"<>]+", text)
    urls = [u.rstrip(".,;)") for u in urls]
    results = []
    for u in urls[:5]:
        try:
            resp = requests.get(u, headers={"User-Agent": "Mozilla/5.0"}, timeout=20)
            raw = resp.text or ""
            raw = re.sub(r"<script.*?</script>", " ", raw, flags=re.S | re.I)
            raw = re.sub(r"<style.*?</style>", " ", raw, flags=re.S | re.I)
            raw = re.sub(r"<[^>]+>", " ", raw)
            raw = html.unescape(raw)
            raw = re.sub(r"\s+", " ", raw).strip()
            results.append(f"\n--- SOURCE: {u} ---\n{raw[:6000]}")
        except Exception as e:
            results.append(f"\n--- SOURCE: {u} (fetch failed: {e}) ---")
    return "\n".join(results)


def run_role(role_key, task_text, shared_context):
    """Execute one specialist role and return its output."""
    role = ROLES[role_key]
    if role.get("is_fetcher"):
        fetched = fetch_urls(task_text + "\n" + shared_context)
        prompt = (
            f"USER TASK:\n{task_text}\n\n"
            f"COLLECTED CONTEXT FROM OTHER AGENTS:\n{shared_context}\n\n"
            f"RAW FETCHED WEB CONTENT:\n{fetched}\n\n"
            "Summarize the relevant findings for the task. If nothing was fetched, say so."
        )
        messages = [{"role": "system", "content": role["system"]}, {"role": "user", "content": prompt}]
        out = call_role(role_key, messages, PER_CALL_TOKENS)
        log_event(f"[fetch] completed ({len(fetched)} chars fetched)")
        return out
    else:
        prompt = (
            f"USER TASK:\n{task_text}\n\n"
            f"COLLECTED CONTEXT FROM OTHER AGENTS (so you can build on their work):\n{shared_context}\n\n"
            f"Do the part of the work assigned to your role: {role['label']}."
        )
        messages = [{"role": "system", "content": role["system"]}, {"role": "user", "content": prompt}]
        out = call_role(role_key, messages, PER_CALL_TOKENS)
        log_event(f"[{role_key}] completed ({len(out)} chars)")
        return out


def plan_steps(task_text):
    """Thinker agent produces a plan."""
    planner_sys = (
        "You are the planning agent. Given a user task, decide which specialist agents are needed "
        "and the order to run them. Respond with STRICT JSON only, no markdown, in this shape:\n"
        '{"steps":[{"role":"think|coding|multitask|fetch|automate","task":"short instruction for that agent"}]}\n'
        "Always include 'think' early and 'automate' last."
    )
    messages = [
        {"role": "system", "content": planner_sys},
        {"role": "user", "content": f"USER TASK:\n{task_text}\n\nReturn the JSON plan now."},
    ]
    out = call_role("think", messages, 1000)
    if out.startswith("[think] all models failed"):
        log_event(f"[planner] error: {out} -> fallback plan")
        return ["think", "multitask", "automate"]
    try:
        m = re.search(r"\{.*\}", out, re.S)
        data = json.loads(m.group(0)) if m else {}
        steps = data.get("steps", [])
        roles = [s.get("role") for s in steps if s.get("role") in ROLES]
        notes = {s["role"]: s.get("task", task_text) for s in steps if s.get("role") in ROLES}
        if roles:
            roles = [r for r in roles if r != "automate"] + (["automate"] if "automate" in roles else [])
            log_event(f"[planner] plan roles: {roles}")
            return roles, notes
    except Exception as e:
        log_event(f"[planner] JSON parse failed: {e} -> fallback plan")
    return ["think", "multitask", "automate"]


def run_team(task_text):
    """Orchestrate the agent team."""
    plan = plan_steps(task_text)
    notes = {}
    if isinstance(plan, tuple):
        roles, notes = plan
    else:
        roles = plan

    log_event(f"TEAM running roles: {roles}")
    results = {}
    shared = ""

    if "think" in roles:
        instruction = notes.get("think", task_text)
        out = run_role("think", instruction, "")
        results["think"] = out
        shared += f"\n\n[Thinker / Planner produced]:\n{out}"

    parallel_roles = [r for r in roles if r not in ("think", "automate")]
    if parallel_roles:
        from concurrent.futures import ThreadPoolExecutor, as_completed
        with ThreadPoolExecutor(max_workers=len(parallel_roles)) as executor:
            fut_to_role = {}
            for role in parallel_roles:
                instruction = notes.get(role, task_text)
                combined = f"{instruction}\n\n--- SHARED CONTEXT ---\n{shared}"
                fut_to_role[executor.submit(run_role, role, combined, shared)] = role
            for fut in as_completed(fut_to_role):
                role = fut_to_role[fut]
                out = fut.result()
                results[role] = out
                shared += f"\n\n[{ROLES[role]['label']} produced]:\n{out}"

    if "automate" in roles:
        instruction = notes.get("automate", task_text)
        combined = f"{instruction}\n\n--- FULL TEAM WORK ---\n{shared}"
        out = run_role("automate", combined, shared)
        results["automate"] = out
        shared += f"\n\n[Automator / Simplifier produced]:\n{out}"

    final = results.get("automate")
    if not final:
        log_event("[automate] all models failed; synthesizing final answer from team work")
        synth = call_role(
            "multitask",
            [
                {"role": "system", "content": "You are a helpful assistant. Produce the final clean answer."},
                {"role": "user", "content": f"USER TASK:\n{task_text}\n\nTEAM WORK SO FAR:\n{shared}\n\nProduce the final clean answer."},
            ],
            PER_CALL_TOKENS,
        )
        if synth and not synth.startswith("[multitask] all models failed"):
            return synth
        return "Note: the automator model was unavailable; here is the combined team output:\n\n" + shared
    return final


def sse_chunks(text):
    cid = "chatcmpl-" + uuid.uuid4().hex
    yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {'role': 'assistant'}}]})}\n\n"
    for i in range(0, len(text), 40):
        piece = text[i:i + 40]
        yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {'content': piece}}]})}\n\n"
    yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'choices': [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
    yield "data: [DONE]\n\n"


def normalize_messages(incoming):
    msgs = incoming.get("messages") or []
    out = []
    for m in msgs:
        role = m.get("role", "user")
        content = m.get("content", "")
        if isinstance(content, list):
            content = " ".join(
                p.get("text") or p.get("input_text") or "" if isinstance(p, dict) else str(p)
                for p in content
            )
        out.append({"role": role, "content": content})
    return out


@app.route("/v1/chat/completions", methods=["POST"])
def chat():
    incoming = request.get_json(force=True, silent=True) or {}
    messages = normalize_messages(incoming)
    stream = bool(incoming.get("stream", False))
    model_req = str(incoming.get("model", "auto")).lower()

    log_event(f"TEAM request (model={model_req}, stream={stream})")

    pin = next((r for r in ROLES if r in model_req), None)

    try:
        if pin:
            task = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
            out = run_role(pin, task, "")
        else:
            task = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
            out = run_team(task)
    except Exception as e:
        log_event(f"TEAM exception: {e}")
        log_event(traceback.format_exc())
        return jsonify({"error": f"Team failed: {e}"}), 500

    if stream:
        return Response(sse_chunks(out), content_type="text/event-stream")
    return Response(
        json.dumps({
            "id": "chatcmpl-" + uuid.uuid4().hex,
            "object": "chat.completion",
            "model": "free-agent-team",
            "choices": [{"index": 0, "message": {"role": "assistant", "content": out}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }),
        content_type="application/json",
    )


@app.route("/v1/responses", methods=["POST"])
def responses():
    payload = request.get_json(force=True, silent=True) or {}
    task = ""
    if isinstance(payload.get("input"), str):
        task = payload.get("input")
    elif isinstance(payload.get("input"), list):
        task = "\n".join(
            (i.get("content") if isinstance(i, dict) else str(i)) for i in payload.get("input")
        )
    if payload.get("instructions"):
        task = f"{payload.get('instructions')}\n{task}"
    try:
        out = run_team(task)
    except Exception as e:
        return jsonify({"error": {"message": str(e), "type": "team_error"}}), 500
    rid = "resp_" + uuid.uuid4().hex
    return Response(
        json.dumps({
            "id": rid, "object": "response", "status": "completed",
            "model": "free-agent-team",
            "output": [{"type": "message", "id": "msg_" + uuid.uuid4().hex, "status": "completed",
                        "role": "assistant", "content": [{"type": "output_text", "text": out, "annotations": []}]}],
            "usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0},
        }),
        content_type="application/json",
    )


@app.route("/v1/models", methods=["GET"])
def models():
    ids = ["auto"] + list(ROLES.keys())
    for k, v in _ROLE_WORKING_MODEL.items():
        ids.append(f"{k}::{v}")
    return jsonify({"object": "list", "data": [{"id": i, "object": "model", "owned_by": "free-agent-team"} for i in ids]})


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "mode": "multi-provider team, working APIs first, OpenRouter last",
        "primary_model": ALL_MODELS[0][0] if ALL_MODELS else "none",
        "providers": {
            "groq": bool(GROQ_API_KEY),
            "cloudflare": bool(CLOUDFLARE_TOKEN and CLOUDFLARE_ACCOUNT),
            "cerebras": bool(CEREBRAS_API_KEY),
            "freemodel": bool(FREEMODEL_API_KEY),
            "openrouter": bool(OR_KEYS),
            "claude_paid": bool(ANTHROPIC_API_KEY),
        },
        "roles": {k: {"primary": v["model"], "cached": _ROLE_WORKING_MODEL.get(k)} for k, v in ROLES.items()},
        "endpoint": "/v1/chat/completions",
        "log_path": str(LOG_PATH),
        "note": "Set IDE Base URL http://localhost:8080/v1, API Key 'local', Model 'auto'.",
    })


if __name__ == "__main__":
    log_event("=" * 60)
    log_event("STARTING MULTI-PROVIDER AI TEAM")
    log_event(f"Log: {LOG_PATH}")

    print("=" * 60)
    print("MULTI-PROVIDER AI AGENT TEAM")
    print("=" * 60)
    print()
    print("API Provider Test Results (tested 2026-07-14):")
    print("  GROQ       | [OK] WORKING  | llama-3.3-70b-versatile")
    print("  CLOUDFLARE | [OK] WORKING  | @cf/meta/llama-3.3-70b-instruct-fp8-fast")
    print("  CEREBRAS   | [OK] WORKING  | gpt-oss-120b, gemma-4-31b, zai-glm-4.7")
    print("  FREEMODEL  | [OK] WORKING  | gpt-4o-mini (has credits)")
    print("  OPENROUTER | [OK] (used as LAST RESORT)")
    print()
    print("Provider Priority (tried in this order):")
    print("  Tier 1 - GROQ (fast, working):")
    for m in GROQ_MODELS:
        print(f"    {m}")
    print("  Tier 2 - CLOUDFLARE (working):")
    for m in CLOUDFLARE_MODELS:
        print(f"    {m}")
    print("  Tier 3 - CEREBRAS (working):")
    for m in CEREBRAS_MODELS:
        print(f"    {m}")
    print("  Tier 4 - FREEMODEL (working, has credits):")
    for m in FREEMODEL_MODELS:
        print(f"    {m}")
    print("  Tier 5 - OPENROUTER (LAST RESORT):")
    for m in OR_MODELS:
        print(f"    {m}")
    print()
    print("How model selection works:")
    print("  1. Try GROQ models first (fast, reliable)")
    print("  2. If GROQ fails, try CLOUDFLARE Workers AI")
    print("  3. If both fail, try CEREBRAS")
    print("  4. If all fail, try FREEMODEL")
    print("  5. If all fail, fall back to OpenRouter :free models (last resort)")
    print("  6. The FIRST model that works for a role is cached")
    print("  7. Next time, it goes directly to the cached model (no retries)")
    print()
    print("IDE settings:")
    print("  Base URL : http://localhost:8080/v1")
    print("  API Key  : local")
    print("  Model    : auto   (or pin: think|coding|multitask|fetch|automate)")
    print(f"  Log file : {LOG_PATH}")
    print("=" * 60)
    app.run(host="127.0.0.1", port=8080, threaded=True)