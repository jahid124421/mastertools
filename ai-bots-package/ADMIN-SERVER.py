"""
ADMIN-SERVER.py - Web-based admin UI for managing the AI Agent Team
Features from free-claude-code integrated:
- Provider management UI
- Model-tier routing (Fable/Opus/Sonnet/Haiku equivalents)
- Token authentication
- Real-time status monitoring
"""

from flask import Flask, render_template_string, request, jsonify, redirect, url_for
import json
import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "admin_config.json"
MODEL_OVERRIDE_FILE = BASE_DIR / "current_model.txt"

app = Flask(__name__)
app.secret_key = 'free-ai-team-admin-secret'

# Default configuration
DEFAULT_CONFIG = {
    "providers": {
        "groq": {"enabled": True, "api_key": ""},
        "cerebras": {"enabled": True, "api_key": ""},
        "cloudflare": {"enabled": True, "account_id": "", "api_token": ""},
        "freemodel": {"enabled": True, "api_key": ""},
        "openrouter": {"enabled": True, "api_key": ""},
    },
    "model_tiers": {
        "fable": {"model": "llama-3.3-70b-versatile", "provider": "groq"},
        "opus": {"model": "gpt-oss-120b", "provider": "cerebras"},
        "sonnet": {"model": "llama-3.1-8b-instant", "provider": "groq"},
        "haiku": {"model": "@cf/meta/llama-3.1-8b-instruct", "provider": "cloudflare"},
    },
    "current_model": "auto",
    "auth_token": "freeai",
    "server_port": 8080,
}

def load_config():
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                # Merge with defaults
                for key in DEFAULT_CONFIG:
                    if key not in config:
                        config[key] = DEFAULT_CONFIG[key]
                return config
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

# Load config on startup
config = load_config()

# Admin UI HTML template
ADMIN_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Free AI Team - Admin</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        .card { 
            background: white; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h2 { color: #555; margin-bottom: 15px; font-size: 18px; }
        .provider { 
            display: flex; 
            align-items: center; 
            padding: 10px; 
            margin: 10px 0;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .provider input[type="checkbox"] { margin-right: 10px; }
        .provider label { flex: 1; }
        .provider input[type="text"] { 
            flex: 2; 
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover { background: #45a049; }
        .status { 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        select { 
            padding: 8px; 
            border: 1px solid #ddd; 
            border-radius: 4px;
            min-width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Free AI Team - Admin Panel</h1>
        
        {% if message %}
        <div class="status {{ 'success' if success else 'error' }}">
            {{ message }}
        </div>
        {% endif %}
        
        <div class="card">
            <h2>📊 Server Status</h2>
            <p><strong>Status:</strong> {{ status }}</p>
            <p><strong>Current Model:</strong> {{ current_model }}</p>
            <p><strong>Server URL:</strong> http://localhost:{{ port }}/v1</p>
            <p><strong>Admin URL:</strong> http://localhost:{{ port }}/admin</p>
        </div>
        
        <div class="card">
            <h2>🎯 Quick Model Switch</h2>
            <form method="POST" action="/switch_model">
                <select name="model">
                    <option value="auto">Auto (Best Available)</option>
                    {% for provider, models in available_models.items() %}
                    <optgroup label="{{ provider }}">
                        {% for model in models[:10] %}
                        <option value="{{ model }}" {{ 'selected' if model == current_model }}>
                            {{ model }}
                        </option>
                        {% endfor %}
                    </optgroup>
                    {% endfor %}
                </select>
                <button type="submit">Switch Model</button>
            </form>
        </div>
        
        <div class="card">
            <h2>🏢 Provider Configuration</h2>
            <form method="POST" action="/save_providers">
                {% for provider, info in providers.items() %}
                <div class="provider">
                    <input type="checkbox" id="{{ provider }}" name="{{ provider }}_enabled" 
                           {{ 'checked' if info.enabled }}>
                    <label for="{{ provider }}">{{ provider.upper() }}</label>
                    <input type="text" name="{{ provider }}_key" value="{{ info.api_key }}" 
                           placeholder="API Key">
                </div>
                {% endfor %}
                <button type="submit">Save Providers</button>
            </form>
        </div>
        
        <div class="card">
            <h2>🎨 Model Tier Routing</h2>
            <p style="color: #666; margin-bottom: 15px;">
                Route different task types to different models for optimal performance.
            </p>
            <form method="POST" action="/save_tiers">
                {% for tier, info in tiers.items() %}
                <div class="provider">
                    <label style="font-weight: bold; width: 80px;">{{ tier.upper() }}</label>
                    <input type="text" name="{{ tier }}_model" value="{{ info.model }}" 
                           style="flex: 2; margin-right: 10px;">
                    <select name="{{ tier }}_provider" style="flex: 1;">
                        {% for prov in ['groq', 'cerebras', 'cloudflare', 'freemodel', 'openrouter'] %}
                        <option value="{{ prov }}" {{ 'selected' if prov == info.provider }}>
                            {{ prov }}
                        </option>
                        {% endfor %}
                    </select>
                </div>
                {% endfor %}
                <button type="submit">Save Tiers</button>
            </form>
        </div>
        
        <div class="card">
            <h2>📝 Instructions</h2>
            <p><strong>Base URL for IDE:</strong> http://localhost:{{ port }}/v1</p>
            <p><strong>API Key:</strong> {{ auth_token }}</p>
            <p><strong>Model:</strong> auto (or use /model command in Claude Code)</p>
            <p style="margin-top: 10px; color: #666;">
                Use the model picker in Claude Code or Codex to switch models on the fly.
                The server will automatically route to the best available provider.
            </p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/admin')
def admin():
    # Load available models
    available_models = {}
    try:
        with open(BASE_DIR / 'available_models.json', 'r') as f:
            available_models = json.load(f)
    except Exception:
        pass
    
    return render_template_string(ADMIN_HTML,
        status="Running",
        current_model=config.get('current_model', 'auto'),
        port=config.get('server_port', 8080),
        auth_token=config.get('auth_token', 'freeai'),
        providers=config.get('providers', {}),
        tiers=config.get('model_tiers', {}),
        available_models=available_models,
        message=None,
        success=False
    )

@app.route('/save_providers', methods=['POST'])
def save_providers():
    try:
        for provider in config['providers']:
            config['providers'][provider]['enabled'] = request.form.get(f'{provider}_enabled') == 'on'
            config['providers'][provider]['api_key'] = request.form.get(f'{provider}_key', '')
        save_config(config)
        return redirect(url_for('admin', message='Providers saved!', success=True))
    except Exception as e:
        return redirect(url_for('admin', message=f'Error: {str(e)}', success=False))

@app.route('/save_tiers', methods=['POST'])
def save_tiers():
    try:
        for tier in config['model_tiers']:
            config['model_tiers'][tier]['model'] = request.form.get(f'{tier}_model', '')
            config['model_tiers'][tier]['provider'] = request.form.get(f'{tier}_provider', 'groq')
        save_config(config)
        return redirect(url_for('admin', message='Model tiers saved!', success=True))
    except Exception as e:
        return redirect(url_for('admin', message=f'Error: {str(e)}', success=False))

@app.route('/switch_model', methods=['POST'])
def switch_model():
    try:
        model = request.form.get('model', 'auto')
        config['current_model'] = model
        save_config(config)
        
        # Write to override file
        with open(MODEL_OVERRIDE_FILE, 'w') as f:
            f.write(model)
        
        return redirect(url_for('admin', message=f'Switched to: {model}', success=True))
    except Exception as e:
        return redirect(url_for('admin', message=f'Error: {str(e)}', success=False))

@app.route('/api/status')
def api_status():
    return jsonify({
        'status': 'running',
        'current_model': config.get('current_model', 'auto'),
        'providers': {k: v['enabled'] for k, v in config.get('providers', {}).items()}
    })

if __name__ == '__main__':
    print("=" * 60)
    print("FREE AI TEAM - ADMIN SERVER")
    print("=" * 60)
    print(f"Admin UI: http://127.0.0.1:{config.get('server_port', 8080)}/admin")
    print(f"API: http://127.0.0.1:{config.get('server_port', 8080)}/v1")
    print("=" * 60)
    app.run(host='127.0.0.1', port=config.get('server_port', 8080), threaded=True)