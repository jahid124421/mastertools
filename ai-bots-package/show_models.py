import json, sys

with open('available_models.json', 'r') as f:
    providers = json.load(f)

choice_num = 1
choices = []

for provider, models in providers:
    print(f'{provider} ({len(models)} models):')
    for i, model in enumerate(models[:10], 1):
        print(f'  {i}. {model}')
    if len(models) > 10:
        print(f'  ... and {len(models) - 10} more')
    print()

print('=' * 60)
print('SELECT A MODEL:')
print('=' * 60)
print('0. Use default (auto-select best model)')
print()

choice_num = 1
for provider, models in providers:
    for model in models[:5]:
        print(f'{choice_num}. {provider}: {model}')
        choices.append((provider, model))
        choice_num += 1
    if len(models) > 5:
        print(f'... ({len(models) - 5} more from {provider})')
        choice_num += len(models) - 5