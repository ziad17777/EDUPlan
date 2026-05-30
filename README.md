# EDUPlan

A full-stack education productivity platform that combines a modern React frontend with a Django REST backend to support authentication, file uploads, and AI-chat-ready study workflows.

![EDUPlan Banner](./unnamed.jpg)

## Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview
EDUPlan is designed as a monorepo with:
- **Frontend**: React + Vite interface for marketing pages, auth screens, and app shell
- **Backend**: Django REST API with JWT auth, chat sessions/messages, and file upload endpoints
- **AI Module**: reserved area for model and assistant integrations

## Core Features
### Available now
- JWT-based authentication (`register`, `login`, `refresh`)
- User-scoped file uploads for `pdf`, `docx`, and `pptx`
- Chat session creation and message history APIs
- Responsive React UI with route-based app layout

### In progress / planned
- Real AI response integration (backend currently returns placeholder chat responses)
- Expanded study-planning intelligence
- Rich analytics and personalization modules

## Tech Stack
### Frontend
- React 19
- Vite 7
- React Router
- Tailwind CSS 4
- Radix UI
- Framer Motion

### Backend
- Django 5
- Django REST Framework
- SimpleJWT (`djangorestframework-simplejwt`)
- CORS headers (`django-cors-headers`)
- SQLite (default development database)

## Architecture
```text
EDUPlan/
├── frontend/   # React application
├── backend/    # Django API server
└── ai_model/   # AI integration space
```

## Quick Start
### 1) Clone the repository
```bash
git clone https://github.com/ziad17777/EDUPlan.git
cd EDUPlan
```

### 2) Run the backend (Django)
```bash
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py runserver
```

Backend base URL: `http://127.0.0.1:8000`

### AI provider setup (Azure OpenAI or Hugging Face Llama 3.3)
In `backend/`, copy `.env.example` to `.env` and set your provider variables:
- `AI_PROVIDER=azure` (default) or `AI_PROVIDER=huggingface`
- For Hugging Face Llama 3.3, set:
  - `HUGGINGFACE_API_KEY`
  - `HUGGINGFACE_MODEL=meta-llama/Llama-3.3-70B-Instruct`
- Optional preference tuning:
  - `AI_SYSTEM_PROMPT` (custom assistant behavior)
  - `AI_TEMPERATURE`
  - `AI_MAX_TOKENS`

### 3) Run the frontend (React)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## API Overview
Base path: `http://127.0.0.1:8000/api/`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `auth/register/` | Create user and return JWT tokens | No |
| POST | `auth/login/` | Authenticate user and return JWT tokens | No |
| POST | `auth/refresh/` | Refresh access token | No |
| GET / POST | `files/` | List uploads / upload file | Yes |
| GET / POST | `chat/sessions/` | List chat sessions / create new session | Yes |
| GET / POST | `chat/sessions/<session_id>/messages/` | List session messages / send message | Yes |

### Auth Header
Use a JWT access token in the `Authorization` header for protected endpoints.

### Example: Register
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "student1",
  "email": "student1@example.com",
  "password": "your_strong_password"
}
```

### Example: Upload File
```http
POST /api/files/
Authorization: ******
Content-Type: multipart/form-data

file=<your_file.pdf>
```

## Project Structure
```text
backend/
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── mysite/
│   ├── settings.py
│   └── urls.py
└── manage.py

frontend/
├── src/
│   ├── components/
│   ├── routes/
│   ├── Provider/
│   └── store/
└── package.json
```

## Development Commands
### Frontend
```bash
cd frontend
npm run dev
npm run lint
npm run build
```

### Backend
```bash
cd backend
python manage.py migrate
python manage.py test
python manage.py runserver
```

## Roadmap
- Connect chat endpoint to real AI responses
- Add robust validation and error handling across frontend/backend
- Add PostgreSQL and production deployment configuration
- Add automated test coverage for API and UI workflows

## Contributing
Contributions are welcome.
1. Fork the repository
2. Create a feature branch
3. Make changes and validate locally
4. Open a pull request with clear context

## License
This project is licensed under the MIT License. See [`LICENSE`](./LICENSE).
