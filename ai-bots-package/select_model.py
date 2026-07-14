import json, sys

with open('available_models.json', 'r') as f:
    providers = json.load(f)

# Get choice from command line argument or environment variable
choice_num = 0
if len(sys.argv) > 1:
    choice_num = int(sys.argv[1])
else:
    import os
    choice_num = int(os.environ.get('MODEL_CHOICE', '0'))

if choice_num == 0:
    print('auto')
else:
    choices = []
    for provider, models in providers:
        for model in models[:5]:
            choices.append((provider, model))
    if 0 < choice_num <= len(choices):
        print(choices[choice_num - 1][1])
    else:
        print('auto')
