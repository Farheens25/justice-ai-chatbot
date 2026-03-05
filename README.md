# Justice AI - Legal Guidance Chatbot

A comprehensive AI-powered legal guidance system for the Indian justice system.

## Project Structure

```
justice-ai/
├── backend/
│   ├── main.py                 # FastAPI application with chatbot endpoints
│   ├── services/
│   │   └── chatbot_service.py  # Chatbot logic and processing
│   └── models/
│       └── schemas.py          # Pydantic models for API
├── frontend/
│   └── index.html              # Web UI for chatbot
├── chatbot/                    # Demo chatbot (reference)
│   └── chatbot_logic.py
└── requirements.txt            # Python dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

The backend will be available at: `http://localhost:3000`

### 3. Access Frontend

Open `frontend/index.html` in your web browser or serve it with a local server:

```bash
# Using Python
python -m http.server 8080 --directory frontend

# Or using any other server (Node.js, etc.)
```

Then visit: `http://localhost:8080`

## API Endpoints

### Health Check
```
GET /health
```

### Process Complaint (Main Endpoint)
```
POST /api/v1/chatbot/process

Request:
{
    "complaint": "I was scammed online"
}

Response:
{
    "success": true,
    "category": "Cyber Fraud",
    "response": {
        "section": "IT Act 66C, IPC 420",
        "advice": "File complaint at nearest Cyber Cell immediately...",
        "escalation": "If FIR not registered within 7 days, escalate to SP.",
        "helpline": "1930 (Cyber Crime Helpline)"
    }
}
```

### GPT-Style Chat Endpoint
```
POST /api/v1/chatbot/chat

Request:
{
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, who won the world series in 2020?"}
    ],
    "model": "gpt-3.5-turbo"   # optional
}

Response:
{
    "success": true,
    "reply": "The Los Angeles Dodgers won the 2020 World Series.",
    "error": null
}
```

This endpoint acts as a proxy to an OpenAI-compatible chat API. Set your
API key in the `OPENAI_API_KEY` environment variable (see below).
### Get Available Categories
```
GET /api/v1/chatbot/categories
```

## Complaint Categories

1. **Cyber Fraud** - Online scams, phishing, malware, hacking
2. **Harassment** - Abusive behavior, stalking, bullying
3. **Domestic Violence** - Family abuse, domestic assault
4. **Theft** - Robbery, burglary, stolen items
5. **General Complaint** - Other legal issues

## Features

✅ AI-powered complaint categorization
✅ Relevant legal section identification
✅ Practical legal advice
✅ Escalation paths for unresolved cases
✅ Emergency helpline numbers
✅ RESTful API for integration
✅ Beautiful responsive frontend
✅ CORS enabled for cross-origin requests

## API Documentation

When the backend is running, access the interactive API docs at:
- **Swagger UI**: `http://localhost:3000/docs`
- **ReDoc**: `http://localhost:3000/redoc`

## Frontend Integration

The frontend is a standalone HTML/CSS/JavaScript application that can be:
- Served independently
- Embedded in a larger website
- Integrated into a React/Vue/Angular app

To integrate the API endpoints in your frontend:

```javascript
const API_BASE_URL = 'http://localhost:3000';

const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/process`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ complaint: userInput })
});

const data = await response.json();
```

## Extending the Chatbot

To add new complaint categories:

1. Add keywords in `ChatbotService.detect_category()` in `services/chatbot_service.py`
2. Add response data in `ChatbotService.generate_response()`
3. Update the categories list in `main.py`

## Production Deployment

Before deploying to production:

1. Change CORS origins to specific domains:
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

2. Use environment variables for configuration

3. Add authentication if needed

4. Deploy backend to cloud (AWS, GCP, Azure, etc.)

5. Deploy frontend to a CDN or web server

## Support

For issues or contributions, please contact the development team.
