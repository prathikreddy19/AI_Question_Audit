# CONTRIBUTING.md

# Contributing

Thank you for your interest in contributing to AI Question Audit.

This project was developed as an assignment and follows a modular architecture to make future enhancements straightforward.

---

## Getting Started

### 1. Fork the Repository

Create your own fork of the repository.

### 2. Clone

```bash
git clone https://github.com/your-username/AI_Question_Audit.git
```

### 3. Install Dependencies

#### Backend

```bash
cd Backend

pip install -r requirements.txt
```

#### Frontend

```bash
cd Frontend

npm install
```

---

## Environment Variables

### Backend

Create a `.env` file.

```env
MONGODB_URI=

DATABASE_NAME=

GEMINI_API_KEY=
```

### Frontend

Create a `.env` file.

```env
VITE_API_BASE_URL=

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```

---

## Running the Project

### Backend

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm run dev
```

---

## Coding Guidelines

### Backend

- Keep API routes lightweight.
- Place business logic inside the `services` layer.
- Validate all requests using Pydantic schemas.
- Write asynchronous code where applicable.
- Follow FastAPI best practices.

---

### Frontend

- Use reusable React components.
- Keep API logic inside the `services` directory.
- Avoid hardcoded URLs.
- Use environment variables for configuration.
- Maintain consistent component structure.

---

## Pull Requests

Before creating a pull request:

- Ensure the project builds successfully.
- Test all modified features.
- Keep commits focused and descriptive.
- Update documentation if required.

Example commit messages:

```
Add Gemini review retry logic

Fix faculty report filtering

Improve MongoDB connection handling
```

---

## Reporting Issues

When reporting an issue, include:

- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser and operating system

---

## Suggestions

Feature requests and improvements are welcome.

Examples include:

- Performance optimizations
- UI improvements
- Additional AI capabilities
- Better accessibility
- Enhanced filtering and search

---

## Code Style

This project follows:

- Clear folder organization
- Meaningful variable names
- Modular design
- Separation of concerns
- Consistent formatting

---

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
