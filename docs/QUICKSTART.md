# QUICKSTART

## 1) Install dependencies

```powershell
pip install -r d:\justice-ai\project\requirements.txt
```

## 2) Start chatbot backend

```powershell
cd d:\justice-ai\project\chatbot\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

## 3) Start chatbot frontend

```powershell
python -m http.server 5500 --directory d:\justice-ai\project\chatbot\frontend
```

Open: http://localhost:5500

## 4) Start website frontend

```powershell
python -m http.server 5501 --directory d:\justice-ai\project\website\frontend
```

Open: http://localhost:5501
