# AI Question Audit System

An AI-powered faculty review platform that helps faculty audit examination questions and student-submitted error reports using Google Gemini. Faculty can review AI suggestions, approve or reject them, and track review actions through audit logs.

## Features

### Authentication

- Firebase Authentication
- Email and password login
- Protected student and faculty views

### Question Management

- Browse and search questions
- Filter by subject and question type
- Paginated question and report APIs

### AI Review

- Google Gemini powered report analysis
- Issue categorization and suggested corrections
- Confidence scoring and faculty review routing
- Analyze only reports without an existing AI review

### Faculty Console

- Dashboard and review queue
- Approve, reject, or edit AI suggestions
- Audit logging for faculty decisions

### Reports

- Student error report submission
- AI review history stored in MongoDB
- Review and audit history APIs

## Tech Stack

**Frontend:** React, Vite, TailwindCSS

**Backend:** FastAPI, Python, Pydantic

**Database:** MongoDB Atlas, Motor async driver

**Authentication:** Firebase Authentication

**AI:** Google Gemini via the `google-genai` SDK

## Project Structure

```text
Backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── data/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── main.py
├── requirements.txt
└── README_BACKEND.md

frontend/
├── public/
├── src/
├── package.json
└── vite.config.js
```

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Configure environment variables

Copy `Backend/.env.example` to `Backend/.env` and `frontend/.env.example` to `frontend/.env.local`. Set `VITE_API_BASE_URL` to `http://127.0.0.1:8000` for local development or to your deployed backend URL in Render. Configure the same variable in the Render frontend service for production. Fill in each file's other values locally and do not commit populated env files. The root `.env.example` lists all supported variables together for reference.

The backend requires a MongoDB connection string. Set `GEMINI_API_KEY` to enable AI reviews. The frontend Firebase variables are the Firebase web app configuration used by the client.

### Backend

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at <http://127.0.0.1:8000>. Interactive API documentation is at <http://127.0.0.1:8000/docs>.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the frontend at <http://localhost:3000>.

## Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `DATABASE_NAME` | Backend | MongoDB database name |
| `GEMINI_API_KEY` | Backend | Google Gemini API access |
| `VITE_API_BASE_URL` | Frontend | FastAPI base URL; set locally or in the Render frontend environment |
| `VITE_FIREBASE_API_KEY` | Frontend | Firebase web app configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Firebase web app configuration |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Firebase web app configuration |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Firebase web app configuration |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Firebase web app configuration |
| `VITE_FIREBASE_APP_ID` | Frontend | Firebase web app configuration |

## Workflow

Student submits a report → the AI review pipeline analyzes new reports → faculty reviews and decides on suggestions → the decision is saved and an audit entry is recorded.

## API

Common endpoints include:

- `GET /questions`
- `GET /reports`
- `POST /reports`
- `POST /ai/review/{reportId}`
- `POST /ai/analyze-pending`
- `GET /faculty/dashboard`
- `GET /faculty/reports`

See the Swagger UI at `/docs` for the full endpoint list and request schemas.

## Screenshots

Add product screenshots here.

## Future Improvements

- Bulk review optimization
- Dashboard analytics
- Review history filters
- Role-based access control
- Report exports
- Email notifications

## License

This project is developed for educational and demonstration purposes.
