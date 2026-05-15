
# EDUPlan — Backend

This repository contains the backend for the EDUPlan project (Django + Django REST Framework).

This README explains how to set up the project on Windows (PowerShell), apply database migrations, run the development server, and use the available API endpoints.

## Requirements

- Python 3.10+ (project contains .pyc files from CPython 3.13 but any modern Python 3.10+ should work)
- pip
- (recommended) a virtual environment
- Django and Django REST Framework (see installation below)

If you prefer, create a `requirements.txt` with pinned versions and install from that. Example minimal requirements:

```
Django
djangorestframework
```

## Quick start (Windows PowerShell)

Open PowerShell and run the following commands from the project root (where `manage.py` is located).

1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies (either from `requirements.txt` or directly):

```powershell
# If you have a requirements.txt
pip install -r requirements.txt

# Or install minimum required packages
pip install Django djangorestframework
```

3. Apply migrations and create the database schema:

```powershell
# If you changed models, create migrations (optional)
python manage.py makemigrations

# Apply migrations to create/update tables
python manage.py migrate
```

4. (Optional) Create a Django superuser to access the admin UI:

```powershell
python manage.py createsuperuser
```

5. Run the development server:

```powershell
python manage.py runserver 0.0.0.0:8000
# or for local only
python manage.py runserver
```

The API will be available under: `http://127.0.0.1:8000/api/` and the Django admin at `http://127.0.0.1:8000/admin/`.

## API Endpoints

All API endpoints are mounted under `/api/` as defined in `myproject/urls.py`.

Base URL (dev): `http://127.0.0.1:8000/api/`

Endpoints provided by the `students` app:

1) Register a new user

- URL: `POST /api/register/`
- Description: Create a Django `User` and a `Student` profile.
- Request JSON:

```json
{
	"username": "alice",
	"password": "secret",
	"email": "alice@example.com",
	"available_time": 120,
	"goals": "Finish semester with A grades"
}
```

- Success response (201-like message body):

```json
{
	"message": "registration successful",
	"student_id": 1,
	"username": "alice"
}
```

2) Login

- URL: `POST /api/login/`
- Description: Authenticate username & password. Note: this project returns a success message but does not issue an auth token by default.
- Request JSON:

```json
{
	"username": "alice",
	"password": "secret"
}
```

- Success response:

```json
{
	"message": "login successful",
	"user_id": 1,
	"username": "alice"
}
```

3) Add a subject for a student

- URL: `POST /api/subjects/add/`
- Description: Add a `Subject` linked to a `Student`.
- Request JSON:

```json
{
	"student_id": 1,
	"name": "Calculus",
	"hours_needed": 300,
	"priority": 8
}
```

- Success response:

```json
{
	"message": " subject Calculus added successfully",
	"subject_id": 2
}
```

4) Get subjects for a student

- URL: `GET /api/subjects/<student_id>/`
- Description: Retrieve all subjects for a given student id.
- Example:

Request: `GET /api/subjects/1/`

- Success response:

```json
{
	"student_name": "alice",
	"subjects": [
		{
			"id": 2,
			"name": "Calculus",
			"hours_per_week": 300,
			"priority": 8
		}
	]
}
```

5) Create a study plan

- URL: `POST /api/plan/create/`
- Description: Build a simple study plan that allocates a student's `available_time` across their subjects based on subject `priority`.
- Request JSON:

```json
{
	"student_id": 1
}
```

- Success response:

```json
{
	"student": "alice",
	"available_minutes_daily": 120,
	"study_plan": [
		{
			"subject_name": "Calculus",
			"daily_minutes": 96,
			"priority_level": 8
		}
	]
}
```

Notes about authentication and security

- The current implementation uses Django's `authenticate()` for login and returns a success message but does not issue an auth token or session cookie by default. If you need token-based auth (recommended for APIs), add Django REST Framework's TokenAuthentication or JWT and update the views to require authentication.

Example curl (replace host/port if needed)

```bash
curl -X POST http://127.0.0.1:8000/api/register/ -H "Content-Type: application/json" -d '{"username":"alice","password":"secret","email":"alice@example.com","available_time":120,"goals":"Finish semester"}'
```

Or with PowerShell using Invoke-RestMethod:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/register/ -Method Post -ContentType 'application/json' -Body (@{ username='alice'; password='secret'; email='alice@example.com'; available_time=120; goals='Finish semester' } | ConvertTo-Json)
```

## Troubleshooting

- If you see errors about missing packages, ensure you've activated the virtual environment and installed dependencies.
- If migrations are out of sync, run `python manage.py makemigrations` then `python manage.py migrate`.
- If you get `OperationalError` about the database, check that `db.sqlite3` is writable and not corrupted; delete and recreate if appropriate (only in development).

### CORS errors (frontend <-> backend)

If your browser blocks requests with a CORS error (for example: "No 'Access-Control-Allow-Origin' header is present"), enable CORS on the Django API.

Quick setup using `django-cors-headers`:

1. Install the package in your backend virtualenv:

```powershell
pip install django-cors-headers
```

2. Add it to `INSTALLED_APPS` and `MIDDLEWARE` in `settings.py` (place middleware high in the list):

```python
INSTALLED_APPS = [
	# ...
	'corsheaders',
	'rest_framework',
	# other apps
]

MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware',
	'django.middleware.common.CommonMiddleware',
	# existing middleware
]
```

3. Configure allowed origins in `settings.py` (development example):

```python
# allow local dev frontend
CORS_ALLOWED_ORIGINS = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
]

# or to allow all origins during development ONLY
# CORS_ALLOW_ALL_ORIGINS = True
```

4. Restart the Django dev server. The browser preflight should now succeed and requests from your Vite frontend will be allowed.

Security note: Do not use `CORS_ALLOW_ALL_ORIGINS = True` in production. Instead whitelist the specific origins your app uses.

## Next steps / Improvements

- Add token authentication (DRF TokenAuth or JWT) to secure the API.
- Add input validation and serializers (using DRF `serializers.Serializer` / `ModelSerializer`) instead of direct `request.data` handling.
- Add unit tests for each endpoint (see `students/tests.py`).

---

If you'd like, I can also:
- add a `requirements.txt` with pinned versions,
- add DRF serializers and update views to use them,
- or create simple API tests and run them.

