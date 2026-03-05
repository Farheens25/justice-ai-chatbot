# Quick Start Guide - Justice AI Chatbot

## For Backend Team

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the Backend Server
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Server will run at**: `http://localhost:8000`

### Step 3: Test the API
Open your browser and go to: `http://localhost:8000/docs` for interactive documentation

**Example API Test:**
```bash
curl -X POST "http://localhost:8000/api/v1/chatbot/process" \
  -H "Content-Type: application/json" \
  -d '{"complaint": "I was scammed online"}'
```

### API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Home/Status |
| GET | `/health` | Health Check |
| POST | `/api/v1/chatbot/process` | Process complaint |
| GET | `/api/v1/chatbot/categories` | Get complaint categories |
| POST | `/api/v1/chatbot/test` | Test chatbot |
| POST | `/api/v1/chatbot/chat` | GPT-style chat proxy (optional, requires API key) |

**Optional GPT integration**: if you want ChatGPT-like conversational behavior, obtain an OpenAI API key (or another compatible service) and export it before running the server:

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="your_api_key_here"

# Linux/macOS
export OPENAI_API_KEY="your_api_key_here"
```

The `chat` endpoint will forward supplied messages to the external API.

---

## For Frontend Team

### Step 1: Open Frontend
1. Open `frontend/index.html` in your web browser, OR
2. Serve it with a local server:

```bash
# Using Python 3
python -m http.server 3000 --directory frontend

# Using Python 2
python -m SimpleHTTPServer 3000
```

Then visit: `http://localhost:3000`

### Step 2: Connect to Backend API
Make sure the backend is running on `http://localhost:8000`

The frontend automatically makes API calls to:
```
http://localhost:8000/api/v1/chatbot/process
```

### Step 3: Test Interaction
1. Enter a complaint (e.g., "I was scammed online")
2. Click "Get Legal Guidance"
3. See the categorized response with legal advice

### How to Integrate into Your Website

If you're building your own frontend:

```javascript
// Simple example
async function getJusticeAIGuidance(complaint) {
    const response = await fetch('http://localhost:8000/api/v1/chatbot/process', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ complaint: complaint })
    });
    return await response.json();
}

// Usage
getJusticeAIGuidance('I was harassed online').then(result => {
    console.log(result.response.advice);
});
```

---

## Project Structure Overview

```
justice-ai/
├── backend/
│   ├── main.py              ← Main FastAPI app - modify endpoints here
│   ├── services/
│   │   └── chatbot_service.py   ← Core logic - modify categories/advice here
│   └── models/
│       └── schemas.py       ← API request/response models
├── frontend/
│   └── index.html           ← Standalone chat UI
├── chatbot/
│   └── chatbot_logic.py     ← Original demo (reference only)
├── requirements.txt         ← Python dependencies
└── README.md               ← Full documentation
```

---

## Common Tasks

### Add a New Complaint Category

1. **Edit** `backend/services/chatbot_service.py`:
   - Add keywords to `detect_category()`
   - Add response data to `generate_response()`

2. **Example:**
```python
# In detect_category()
property_keywords = ["property", "land", "real estate", "boundary"]
if any(keyword in text for keyword in property_keywords):
    return "Property Dispute"

# In generate_response()
"Property Dispute": {
    "section": "IPC 426, 427",
    "advice": "File property dispute case in civil court...",
    "escalation": "Escalate to higher court if needed.",
    "helpline": "100 (Police Emergency)"
}
```

### Modify Legal Advice

Edit the `responses` dictionary in `backend/services/chatbot_service.py`

### Change Frontend Styling

Edit `frontend/index.html` - CSS is in the `<style>` tag

### Add New API Endpoints

Edit `backend/main.py` - add new `@app.post()` or `@app.get()` routes

---

## Troubleshooting

### Backend won't start?
- Check if port 8000 is available
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Frontend can't connect to API?
- Make sure backend is running
- Check that API URL is correct (should be `http://localhost:8000`)
- Check browser console for CORS errors

### API returns 500 error?
- Check backend terminal for error messages
- Ensure the complaint text is valid

---

## Next Steps

1. ✅ Backend team: Modify `chatbot_service.py` with more accurate legal data
2. ✅ Frontend team: Style the UI to match your brand
3. ✅ Both: Test integration thoroughly
4. ✅ Deploy to production with proper configuration

Good luck! 🚀
