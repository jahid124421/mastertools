import requests, json

# Test passthrough mode with a tool-calling-style request (like Cline sends)
payload = {
    "model": "gpt-oss-120b",
    "messages": [
        {"role": "user", "content": "What model are you? Reply with only the model name."}
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "test_tool",
                "description": "A test tool",
                "parameters": {"type": "object", "properties": {}}
            }
        }
    ]
}

r = requests.post(
    "http://localhost:8080/v1/chat/completions",
    headers={"Authorization": "Bearer local", "Content-Type": "application/json"},
    json=payload,
    timeout=30
)

print("Status:", r.status_code)
if r.status_code == 200:
    d = r.json()
    print("Model in response:", d.get("model"))
    msg = d["choices"][0]["message"]
    print("Content:", msg.get("content", "")[:150])
    print("Has tool_calls:", "tool_calls" in msg)
else:
    print("Error:", r.text[:300])