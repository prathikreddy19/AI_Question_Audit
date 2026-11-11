# DEPLOYMENT.md

# Deployment Guide

This document describes how to deploy the AI Question Audit application.

---

# Tech Stack

## Frontend

- React
- Vite
- Render Static Site

## Backend

- FastAPI
- Uvicorn
- Render Web Service

## Database

- MongoDB Atlas

## AI

- Google Gemini API

---

# Backend Deployment

## 1. Create a Render Web Service

Connect the GitHub repository and configure:

**Root Directory**

```
Backend
```

**Build Command**

```bash
pip install -r requirements.txt
```

**Start Command**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Backend Environment Variables

Configure the following variables in Render:

```env
MONGODB_URI=<your_mongodb_connection_string>

DATABASE_NAME=AI_Question_Audit

GEMINI_API_KEY=<your_gemini_api_key>
```

---

# MongoDB Atlas Configuration

Create a MongoDB Atlas cluster.

Create a database:

```
AI_Question_Audit
```

Configure Network Access:

```
0.0.0.0/0
```

This allows the deployed backend to access MongoDB.

---

# Frontend Deployment

Deploy the frontend as a **Render Static Site**.

Configuration:

**Root Directory**

```
Frontend
```

**Build Command**

```bash
npm install && npm run build
```

**Publish Directory**

```
dist
```

---

## Frontend Environment Variables

```env
VITE_API_BASE_URL=https://your-backend.onrender.com

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```

---

# Firebase Setup

1. Create a Firebase project.
2. Enable **Email/Password Authentication**.
3. Create faculty and student accounts.
4. Copy the Firebase Web SDK configuration.
5. Add the configuration as frontend environment variables.

---

# CORS Configuration

The backend allows:

- Local development
- Production frontend domain

Example:

```python
allow_origins = [
    "http://localhost:5173",
    "https://your-frontend.onrender.com",
]
```

---

# API Documentation

Swagger UI:

```
https://your-backend.onrender.com/docs
```

---

# Deployment Verification

Verify the following after deployment:

- Backend is running
- Frontend loads successfully
- MongoDB connection succeeds
- Firebase authentication works
- Questions load correctly
- Student reports can be submitted
- Faculty can review reports
- AI analysis executes successfully

---

# Troubleshooting

## MongoDB Connection Issues

- Verify Atlas connection string.
- Ensure Network Access includes `0.0.0.0/0`.
- Confirm environment variables are correctly configured.

---

## CORS Errors

- Confirm the frontend URL is included in the backend CORS configuration.
- Verify the frontend uses `VITE_API_BASE_URL`.

---

## Gemini Errors

- Verify the Gemini API key.
- Ensure the API key is configured in Render.
- Check application logs for detailed error messages.

---

# Production URLs

## Frontend

```
https://<frontend>.onrender.com
```

## Backend

```
https://<backend>.onrender.com
```

## API Documentation

```
https://<backend>.onrender.com/docs
```

---

# Notes

- Sensitive credentials are managed using Render Environment Variables.
- No API keys or secrets are committed to the repository.
- MongoDB Atlas is used as the production database.
- The frontend and backend are deployed independently and communicate via REST APIs.
