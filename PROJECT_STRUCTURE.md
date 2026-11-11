# PROJECT_STRUCTURE.md

# Project Structure

This document explains the organization of the AI Question Audit project and the responsibility of each directory and module.

---

# Overall Structure

```
AI_Question_Audit/
│
├── Backend/
├── Frontend/
├── README.md
├── DEPLOYMENT.md
├── PROJECT_STRUCTURE.md
├── PROMPTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

---

# Backend

```
Backend/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── data/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── requirements.txt
├── seed.py
└── .env.example
```

## app/api/

Contains all FastAPI route definitions.

Examples:

- Questions API
- Reports API
- AI Review API
- Faculty APIs

---

## app/core/

Contains application-wide configuration.

Examples:

- Environment variable loading
- Global settings
- Configuration management

---

## app/data/

Stores static data used by the application.

Examples:

- Sample questions
- Sample reports
- AI taxonomy

---

## app/database/

Responsible for MongoDB connectivity.

Includes:

- Database connection
- MongoDB client
- Dependency injection

---

## app/models/

Contains MongoDB document models.

Examples:

- Question
- Report
- AIReview
- User
- AuditLog

---

## app/schemas/

Contains Pydantic schemas used for:

- Request validation
- Response models
- Serialization

---

## app/services/

Contains the application's business logic.

Examples:

- Question Service
- Report Service
- AI Service
- Review Service
- Prompt Service
- Validation Service
- Taxonomy Service

Business logic is intentionally separated from API routes.

---

## app/utils/

Reusable helper functions.

Examples:

- HTML utilities
- Formatting helpers
- Common utility methods

---

# Frontend

```
Frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── .env.example
```

---

## components/

Reusable UI components.

Examples:

- Navbar
- Cards
- Tables
- Buttons
- Modals
- Loaders

---

## pages/

Application screens.

Examples:

- Login
- Student Dashboard
- Faculty Dashboard
- Review Queue
- Question Details

---

## contexts/

Global state management using React Context.

Examples:

- Authentication Context
- Audit Context

---

## services/

Responsible for all API communication.

Examples:

- Axios Client
- Questions Service
- Reports Service
- Faculty Service

---

## config/

Application configuration.

Examples:

- Firebase Configuration
- Axios Configuration

---

## utils/

Reusable utility functions.

Examples:

- HTML sanitization
- Math rendering
- Formatting helpers

---

## styles/

Contains reusable styling and global CSS.

---

# Application Flow

```
Student / Faculty
        │
        ▼
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Business Services
        │
        ▼
MongoDB Atlas
        │
        ▼
Gemini AI (when required)
```

---

# Architecture

The application follows a layered architecture:

- **Presentation Layer** – React frontend
- **API Layer** – FastAPI endpoints
- **Service Layer** – Business logic
- **Data Layer** – MongoDB Atlas
- **AI Layer** – Google Gemini for automated report analysis

---

# Design Principles

- Modular architecture
- Separation of concerns
- Reusable components
- Maintainable codebase
- Scalable folder structure
- Environment-based configuration
- Production-ready deployment

---

# Naming Conventions

- Components use **PascalCase**
- Functions use **camelCase**
- Constants use **UPPER_SNAKE_CASE**
- Services encapsulate business logic
- API routes remain lightweight

---

# Summary

The project is organized to keep the frontend, backend, business logic, database access, and AI integration independent. This structure improves readability, maintainability, scalability, and simplifies future enhancements.\
