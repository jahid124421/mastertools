import requests, json, sys

providers = []

# 1. GROQ
try:
    r = requests.get('https://api.groq.com/openai/v1/models',
        headers={'Authorization': 'Bearer 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'},
        timeout=10)
    if r.status_code == 200:
        models = [m['id'] for m in r.json().get('data', [])]
        providers.append(('GROQ', models))
        print(f'[OK] GROQ: {len(models)} models')
    else:
        print(f'[XX] GROQ: HTTP {r.status_code}')
except Exception as e:
    print(f'[XX] GROQ: {str(e)[:50]}')

# 2. CEREBRAS
try:
    r = requests.get('https://api.cerebras.ai/v1/models',
        headers={'Authorization': 'Bearer csk-yx4y4cfp9pmk58txe6tm8ywv5534hw566d364d3njjpyevnj'},
        timeout=10)
    if r.status_code == 200:
        models = [m['id'] for m in r.json().get('data', [])]
        providers.append(('CEREBRAS', models))
        print(f'[OK] CEREBRAS: {len(models)} models')
    else:
        print(f'[XX] CEREBRAS: HTTP {r.status_code}')
except Exception as e:
    print(f'[XX] CEREBRAS: {str(e)[:50]}')

# 3. CLOUDFLARE (use hardcoded models since API endpoint varies)
try:
    # Cloudflare Workers AI has a fixed set of models
    cf_models = [
        '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        '@cf/meta/llama-3.1-8b-instruct',
        '@cf/meta/llama-3.1-70b-instruct',
        '@cf/meta/llama-2-7b-chat-int8',
        '@cf/meta/llama-2-13b-chat-int8',
    ]
    providers.append(('CLOUDFLARE', cf_models))
    print(f'[OK] CLOUDFLARE: {len(cf_models)} models (hardcoded)')
except Exception as e:
    print(f'[XX] CLOUDFLARE: {str(e)[:50]}')

# 4. OPENROUTER
try:
    r = requests.get('https://openrouter.ai/api/v1/models',
        headers={'Authorization': 'Bearer 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'},
        timeout=10)
    if r.status_code == 200:
        models = [m['id'] for m in r.json().get('data', [])]
        providers.append(('OPENROUTER', models))
        print(f'[OK] OPENROUTER: {len(models)} models')
    else:
        print(f'[XX] OPENROUTER: HTTP {r.status_code}')
except Exception as e:
    print(f'[XX] OPENROUTER: {str(e)[:50]}')

# 5. FREEMODEL
try:
    r = requests.get('https://api.freemodel.dev/v1/models',
        headers={'Authorization': 'Bearer fe_oa_19a7f7fcae63fe8c7d216321a5f0ae90e80012b27c76bd44'},
        timeout=10)
    if r.status_code == 200:
        models = [m['id'] for m in r.json().get('data', [])]
        providers.append(('FREEMODEL', models))
        print(f'[OK] FREEMODEL: {len(models)} models')
    else:
        print(f'[XX] FREEMODEL: HTTP {r.status_code}')
except Exception as e:
    print(f'[XX] FREEMODEL: {str(e)[:50]}')

# Save to temp file
with open('available_models.json', 'w') as f:
    json.dump(providers, f)
print(f'\nTotal providers: {len(providers)}')