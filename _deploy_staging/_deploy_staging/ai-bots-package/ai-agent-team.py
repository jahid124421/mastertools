"""
ai-agent-team.py  -  Free multi-agent AI team with per-role model caching.

Exposes an OpenAI-compatible endpoint (http://localhost:8080/v1/chat/completions)
that your IDE (Cursor, Antigravity, Continue, Cline, etc.) can point to.

BEHAVIOR:
- 5 specialist roles: think, coding, multitask, fetch, automate.
- Each role has a primary model. If it fails (429/error), it falls back through
  a priority list of free models.
- The FIRST fallback that works for a role is CACHED — next time that role is
  called, it goes directly to the cached working model (no retries).
- If a cached model later fails, it finds a new one for that role.
- You can PIN a single role by setting model="think|coding|multitask|fetch|automate"
  in your IDE settings.

No credits required - only OpenRouter :free models are used.
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
OR_MODELS_URL = "https://openrouter.ai/api/v1/models"
OR_HEADERS = {"HTTP-Referer": "http://localhost", "X-Title": "Free AI Agent Team"}

# ---------------- Specialist roster (free models only) ----------------
ROLES = {
    "think": {
        "label": "Thinker / Planner",
        "model": "qwen/qwen3-next-80b-a3b-instruct:free",
        "system": "You are the senior reasoning and planning agent. "
                  "You decompose problems, reason carefully, and produce clear analysis.",
    },
    "coding": {
        "label": "Coder",
        "model": "qwen/qwen3-coder:free",
        "system": "You are an expert software engineer. Write correct, well-structured code and review it.",
    },
    "multitask": {
        "label": "Multitasker",
        "model": "openai/gpt-oss-120b:free",
        "system": "You are a versatile general-purpose agent that handles broad, multi-step tasks "
                  "and integrates information from multiple sources.",
    },
    "fetch": {
        "label": "Fetcher / Scraper",
        "model": "openai/gpt-oss-20b:free",
        "system": "You are a research agent. Extract relevant facts concisely and cite sources.",
        "is_fetcher": True,
    },
    "automate": {
        "label": "Automator / Simplifier",
        "model": "meta-llama/llama-3.2-3b-instruct:free",
        "system": "You are the automation and simplification agent. Take collected work "
                  "and produce the final, clean, actionable answer.",
    },
}

# ---------------- Model priority list (tried in order, fast/light first) ----------------
MODEL_PRIORITY = [
    "tencent/hy3:free",
    "poolside/laguna-xs-2.1:free",
    "poolside/laguna-m.1:free",
    "cohere/north-mini-code:free",
    "liquid/lfm-2.5-1.2b-instruct:free",
    "liquid/lfm-2.5-1.2b-thinking:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "nvidia/nemotron-3.5-content-safety:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free",
    "qwen/qwen3-coder:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
]

# Also inject any role-specific models that aren't already in the list
for r in ROLES.values():
    m = r["model"]
    if m not in MODEL_PRIORITY:
        MODEL_PRIORITY.append(m)

PER_CALL_TOKENS = int(os.environ.get("TEAM_MAX_TOKENS", "2000").strip() or "2000")

app = Flask(__name__)


def try_model(model, messages, max_tokens):
    """Try a single model. Returns (content_text, error_string).
    Skips models in rate-limit cooldown.
    On 429, adds to cooldown cache."""
    now = time.time()
    cooldown_until = _RATELIMIT_CACHE.get(model, 0)
    if cooldown_until > now:
        return None, f"{model} in cooldown ({cooldown_until - now:.0f}s left)"

    body = {
        "model": model,
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
                log_event(f"[auth] key rejected for {model}; rotating key")
                rotate_key()
                continue
            if r.status_code == 429:
                _RATELIMIT_CACHE[model] = now + _RATELIMIT_SECONDS
                log_event(f"[ratelimit] {model} cooled for {_RATELIMIT_SECONDS}s")
            return None, f"{model} HTTP {r.status_code}"
        except Exception as e:
            return None, f"{model} exception: {str(e)[:200]}"
    return None, "all keys exhausted"


def call_role(role_key, messages, max_tokens):
    """Call a role's model with per-role caching.
    - If the role has a cached working model, try it first (skip primary).
    - If no cache, try the role's primary model.
    - If primary fails, fall back through MODEL_PRIORITY.
    - Cache the first fallback that works for next time."""
    role = ROLES[role_key]
    cached = _ROLE_WORKING_MODEL.get(role_key)

    # Determine which models to try
    models_to_try = []
    if cached:
        # Skip primary, go straight to cached working model
        models_to_try.append(cached)
    else:
        # Try primary first
        models_to_try.append(role["model"])
        # Then the priority list (minus primary)
        for m in MODEL_PRIORITY:
            if m != role["model"]:
                models_to_try.append(m)

    last_err = None
    for model in models_to_try:
        now = time.time()
        if _RATELIMIT_CACHE.get(model, 0) > now:
            continue
        content, err = try_model(model, messages, max_tokens)
        if content:
            # Cache this model for this role
            if _ROLE_WORKING_MODEL.get(role_key) != model:
                _ROLE_WORKING_MODEL[role_key] = model
                log_event(f"[{role_key}] cached working model: {model}")
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
    """Thinker agent produces a plan: which roles to involve, in what order."""
    planner_sys = (
        "You are the planning agent. Given a user task, decide which specialist agents are needed "
        "and the order to run them. Respond with STRICT JSON only, no markdown, in this shape:\n"
        '{"steps":[{"role":"think|coding|multitask|fetch|automate","task":"short instruction for that agent"}]}\n'
        "Only include roles that are genuinely useful. 'fetch' is only needed if the task requires "
        "live web data (include the URL in the task text). 'automate' should usually be last to "
        "produce the final answer. Always include 'think' early and 'automate' last."
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
    """Orchestrate the agent team with per-role caching.
    Think runs first, then coding+multitask+fetch in parallel,
    then automate last with full context."""
    plan = plan_steps(task_text)
    notes = {}
    if isinstance(plan, tuple):
        roles, notes = plan
    else:
        roles = plan

    log_event(f"TEAM running roles: {roles}")
    results = {}
    shared = ""

    # 1. Think runs first
    if "think" in roles:
        instruction = notes.get("think", task_text)
        out = run_role("think", instruction, "")
        results["think"] = out
        shared += f"\n\n[Thinker / Planner produced]:\n{out}"

    # 2. Run coding/multitask/fetch in parallel
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

    # 3. Automate last (sees everything)
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
    """Flatten incoming messages into a list of {"role":..., "content":...} dicts."""
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

    # If user pinned a specific role, run only that role
    pin = next((r for r in ROLES if r in model_req), None)

    try:
        if pin:
            # Single role mode: just run that one role
            task = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
            out = run_role(pin, task, "")
        else:
            # Full team mode
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
    """Minimal Responses-API shim."""
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
        "mode": "free multi-agent team with per-role model caching",
        "roles": {k: {"primary": v["model"], "cached": _ROLE_WORKING_MODEL.get(k)} for k, v in ROLES.items()},
        "endpoint": "/v1/chat/completions",
        "log_path": str(LOG_PATH),
        "note": "Set IDE Base URL http://localhost:8080/v1, API Key 'local', Model 'auto'.",
    })


if __name__ == "__main__":
    log_event("=" * 60)
    log_event("STARTING FREE MULTI-AGENT TEAM (per-role caching)")
    log_event(f"Log: {LOG_PATH}")
    log_event(f"OpenRouter keys loaded: {len(OR_KEYS)}")
    log_event("Roles:")
    for k, v in ROLES.items():
        log_event(f"  {k:10s} -> {v['model']}")
    print("=" * 60)
    print("FREE MULTI-AGENT AI TEAM (per-role caching)")
    print("=" * 60)
    print("Specialist free agents (collaborate on every request):")
    for k, v in ROLES.items():
        print(f"  - {v['label']:22s}: {v['model']}")
    print()
    print("How per-role caching works:")
    print("  - Each role tries its primary model first.")
    print("  - If it fails, it falls back through the priority list.")
    print("  - The FIRST fallback that works is cached for that role.")
    print("  - Next time, it goes directly to the cached model (no retries).")
    print()
    print("IDE settings:")
    print("  Base URL : http://localhost:8080/v1")
    print("  API Key  : local")
    print("  Model    : auto   (or pin: think|coding|multitask|fetch|automate)")
    print(f"  Log file : {LOG_PATH}")
    print("=" * 60)
    app.run(host="127.0.0.1", port=8080, threaded=True)