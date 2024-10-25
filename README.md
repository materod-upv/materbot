# materbot

Materbot is a useful bot with IA for Discord.

# Deployment
## LLM Model

1) Go to [HuggingFace](https://huggingface.co/) and create a new space.
2) Clone the repository https://huggingface.co/spaces/_username_/_spacename_ 
3) Add this requiriments.txt file:
```txt
huggingface_hub
```
4) Add this app.py file:
```python
import gradio as gr
from huggingface_hub import InferenceClient

client = InferenceClient("HuggingFaceH4/zephyr-7b-beta")

system_message = """Set the bot character in this system prompt."""
max_tokens = 250
temperature = 0.8
top_p = 0.95

def respond(
    message,
    history: list[tuple[str, str]]
):
    messages = [{"role": "system", "content": system_message}]

    for val in history:
        if val[0]:
            messages.append({"role": "user", "content": val[0]})
        if val[1]:
            messages.append({"role": "assistant", "content": val[1]})
    messages.append({"role": "user", "content": message})
    response = ""
    for message in client.chat_completion(
        messages,
        max_tokens=max_tokens,
        stream=True,
        temperature=temperature,
        top_p=top_p,
    ):
        token = message.choices[0].delta.content

        response += token
        yield response

demo = gr.ChatInterface(
    respond
)

if __name__ == "__main__":
    demo.launch()
```
5) Git add, commit and push the files to the repository.
6) Test the model.

## Materbot
1) Install [flyctl](https://fly.io/docs/flyctl/install/)
2) Create an account with:
```bash
fly auth signup
```
3) login with:
```bash
fly auth login
```
4) Go inside the project directory and run:
```bash
fly launch --name <your-app-name>
```
5) To deploy/update your new app use:
```bash
fly deploy
```


