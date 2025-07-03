from openai import OpenAI

client = OpenAI(
    base_url = "http://localhost:11434/v1",
    api_key = "unused", # required for the API but not used
)

response = client.chat.completions.create(
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "INSERT_INPUT_HERE",
                },
            ],
        },
    ],
    model = "devstral:latest",
    max_tokens = 4091236,
)

print(response.choices[0].message.content)