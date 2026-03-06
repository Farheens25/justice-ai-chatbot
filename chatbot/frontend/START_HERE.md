# START HERE

Use this order:

1. Start backend from `chatbot/backend` on port `3000`
2. Start chatbot frontend from `chatbot/frontend` on port `5500`
3. Start website frontend from `website/frontend` on port `5501`

Commands:

```powershell
pip install -r d:\justice-ai\project\requirements.txt
cd d:\justice-ai\project\chatbot\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 3000
python -m http.server 5500 --directory d:\justice-ai\project\chatbot\frontend
python -m http.server 5501 --directory d:\justice-ai\project\website\frontend
```
