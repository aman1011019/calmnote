# CalmNote — FastAPI + PostgreSQL Backend

Privacy-first AI mental health companion backend.  
All data stays local — no external API calls, no cloud dependencies.

---

## Quick Start

### 1. Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| PostgreSQL | 15 / 16 / 17 / 18 (local install) |

### 2. Configure the database password

Open **`backend/.env`** and update the password to match your PostgreSQL installation:

```
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/calmnote
```

> **Default password on most PostgreSQL installs is `postgres`.**  
> Change `YOUR_PASSWORD` accordingly.

### 3. Install Python dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 4. Start the server

```powershell
python run_server.py
```

This single command will:
1. ✅ Connect to your local PostgreSQL server
2. 🆕 Create the `calmnote` database (if it doesn't exist)
3. 🗄️ Create all tables (`moods`, `diary`, `chat_history`)
4. 🚀 Start FastAPI on `http://localhost:8000`

---

## Alternative: Manual start

```powershell
# Create database manually first
psql -U postgres -c "CREATE DATABASE calmnote;"

# Start server with auto-reload (development)
uvicorn app.main:app --reload
```

---

## Interactive API Docs

Once the server is running, open:

| URL | Description |
|---|---|
| http://localhost:8000/docs | Swagger UI (interactive) |
| http://localhost:8000/redoc | ReDoc |
| http://localhost:8000/ | Health check |

---

## API Endpoints

### Mood

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/mood` | Log emoji mood check-in |
| `GET` | `/mood` | Get mood history |

**POST /mood** — Request body:
```json
{ "emoji": "😊" }
```

**Response:**
```json
{ "id": 1, "emoji": "😊", "mood_label": "happy", "created_at": "2024-01-15T14:30:00" }
```

---

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Send message, get AI response |
| `GET` | `/chat/history` | Get previous conversations |

**POST /chat** — Request body:
```json
{ "message": "I feel anxious today", "mood": "sad" }
```

**Response:**
```json
{
  "id": 1,
  "response_text": "I'm here for you 💙 Want to talk about your day?",
  "mood": "sad",
  "created_at": "2024-01-15T14:30:00"
}
```

---

### Diary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/diary` | Save a journal entry |
| `GET` | `/diary` | Get all entries |
| `DELETE` | `/diary/{id}` | Delete entry by ID |

**POST /diary** — Request body:
```json
{ "date": "2024-01-15", "mood": "happy", "text": "Today was a great day..." }
```

---

### Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/insights` | 7-day mood summary |

**Response:**
```json
{
  "period_days": 7,
  "total_checkins": 12,
  "mood_counts": { "happy": 7, "neutral": 3, "sad": 2 },
  "dominant_mood": "happy",
  "daily_breakdown": { "2024-01-15": ["happy", "neutral"] }
}
```

---

## Project Structure

```
backend/
├── .env                        # ← Set your DATABASE_URL here
├── requirements.txt
├── run_server.py               # ← Single command to start everything
└── app/
    ├── main.py                 # FastAPI app, CORS, error handlers, router registration
    ├── database/
    │   └── database.py         # SQLAlchemy engine + session + Base
    ├── models/                 # SQLAlchemy ORM models (tables)
    │   ├── mood.py             →  moods table
    │   ├── diary.py            →  diary table
    │   └── chat.py             →  chat_history table
    ├── schemas/                # Pydantic request/response schemas
    │   ├── mood.py
    │   ├── diary.py
    │   └── chat.py
    ├── routes/                 # FastAPI routers (HTTP endpoints)
    │   ├── mood.py
    │   ├── chat.py
    │   ├── diary.py
    │   └── insights.py
    ├── controllers/            # Orchestration layer (validates, combines services)
    │   ├── mood_controller.py
    │   ├── chat_controller.py
    │   └── diary_controller.py
    ├── services/               # Business logic + DB persistence
    │   ├── mood_service.py     # Emoji → mood detection + DB save
    │   ├── chat_service.py     # Rule-based AI + ML_HOOK comments
    │   └── diary_service.py    # CRUD helpers
    └── utils/
        └── error_handlers.py   # Consistent JSON error envelope

frontend/src/services/
    └── api.ts                  # ← React Native / Expo API client (axios)
```

---

## Database Schema

### `moods`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| emoji | VARCHAR | e.g. `😊` |
| mood_label | VARCHAR | `happy` \| `neutral` \| `sad` |
| created_at | DATETIME | Auto-set on insert |

### `diary`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| date | VARCHAR | ISO date `YYYY-MM-DD` |
| mood | VARCHAR | `happy` \| `neutral` \| `sad` |
| text | TEXT | Journal content |
| created_at | DATETIME | Auto-set on insert |

### `chat_history`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| user_message | TEXT | User's message |
| ai_response | TEXT | AI-generated reply |
| mood | VARCHAR | Mood context at time of message |
| created_at | DATETIME | Auto-set on insert |

---

## AI Response Logic

Responses are rule-based and live in `app/services/chat_service.py`.

```python
if mood == "sad":
    return "I'm here for you 💙 Want to talk about your day?"

if mood == "happy":
    return "That's wonderful to hear 😊 What made your day good?"
```

The file is annotated with `# ML_HOOK` comments — replace `generate_response()` with any ML model (Hugging Face, llama.cpp, OpenAI) without changing any routes or controllers.

---

## React Native Frontend Connection

See **`frontend/src/services/api.ts`** for the full typed API client.

```typescript
import api from './services/api';

// Log a mood
const mood = await api.sendMood('😊');

// Send a message
const reply = await api.sendMessage('I feel anxious', 'sad');

// Save diary entry
await api.saveDiaryEntry('2024-01-15', 'happy', 'Great day today!');

// Get all diary entries
const entries = await api.getDiaryEntries();

// Get mood insights (last 7 days)
const insights = await api.getMoodInsights();
```

> **Physical device note:** Replace `localhost` in `api.ts` with your machine's LAN IP (e.g. `192.168.1.5`). Android emulators should use `10.0.2.2`.

---

## Troubleshooting

### `could not connect to server: Connection refused`
- Make sure PostgreSQL is running: `pg_isready` or check Windows Services
- Verify the port: default is `5432`

### `password authentication failed for user "postgres"`
- Update `DATABASE_URL` in `.env` with the correct password

### `database "calmnote" does not exist`
- Run `python run_server.py` — it creates the database automatically
- Or manually: `psql -U postgres -c "CREATE DATABASE calmnote;"`

### Tables not being created
- Ensure `DATABASE_URL` points to the `calmnote` database (not `postgres`)
- Check for import errors in the terminal output
