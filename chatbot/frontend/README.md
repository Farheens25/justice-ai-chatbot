# Justice AI

Updated structure:

- chatbot/backend: FastAPI backend for chatbot APIs
- chatbot/frontend: Chatbot web frontend
- website/frontend: Website frontend

## Run chatbot backend

```powershell
cd d:\justice-ai\project\chatbot\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

Backend URL: http://localhost:3000
Docs: http://localhost:3000/docs

## Run chatbot frontend

```powershell
python -m http.server 5500 --directory d:\justice-ai\project\chatbot\frontend
```

Frontend URL: http://localhost:5500

## Run website frontend

```powershell
python -m http.server 5501 --directory d:\justice-ai\project\website\frontend
```

Website URL: http://localhost:5501

## Notes

- Frontend files are currently configured to call backend at http://localhost:3000
- Install dependencies once from repo root:

```powershell
pip install -r d:\justice-ai\project\requirements.txt
```
