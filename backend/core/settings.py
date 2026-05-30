import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent


def _env_int(name, default):
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _env_float(name, default):
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-change-this-in-production-use-env-variable')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    # Local apps
    'users',
    'files',
    'chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

# --- DRF ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ),
}

# --- JWT ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- CORS ---
CORS_ALLOW_ALL_ORIGINS = True  # Lock down in production

# ─────────────────────────────────────────────────────────────────────────────
# AI Provider Configuration
# Supports:
#   - azure       (default)
#   - huggingface
#
# Shared tuning options:
#   AI_PROVIDER                  defaults to "azure"
#   AI_SYSTEM_PROMPT             overrides assistant instruction/preferences
#   AI_TEMPERATURE               defaults to 0.7
#   AI_MAX_TOKENS                defaults to 1024
#   AI_REQUEST_TIMEOUT_SECONDS   defaults to 60
#
# Azure OpenAI:
# Set these in your .env file or shell environment — never hard-code keys.
#
# Required:
#   AZURE_OPENAI_ENDPOINT      e.g. https://my-resource.openai.azure.com/
#   AZURE_OPENAI_API_KEY       your Azure OpenAI key
#   AZURE_OPENAI_DEPLOYMENT    your deployment name, e.g. gpt-4o
#
# Optional:
#   AZURE_OPENAI_API_VERSION   defaults to 2024-02-01
#
# Hugging Face:
#   HUGGINGFACE_API_KEY        your Hugging Face token
#   HUGGINGFACE_MODEL          defaults to meta-llama/Llama-3.3-70B-Instruct
#   HUGGINGFACE_API_URL        optional override, defaults to
#                              https://api-inference.huggingface.co/models/<model>
# ─────────────────────────────────────────────────────────────────────────────
AI_PROVIDER = os.getenv('AI_PROVIDER', 'azure').lower()
AI_SYSTEM_PROMPT = os.getenv(
    'AI_SYSTEM_PROMPT',
    (
        "You are Phoenix, an AI study assistant inside EDUPlan.\n"
        "You help students with:\n"
        "- Creating personalised study plans (daily / weekly)\n"
        "- Breaking topics into clear learning steps\n"
        "- Explaining difficult concepts simply\n"
        "- Answering questions about uploaded course materials\n\n"
        "Be concise, encouraging, and academically accurate.\n"
        "If a document was uploaded, refer to it when answering relevant questions."
    ),
)
AI_TEMPERATURE = _env_float('AI_TEMPERATURE', 0.7)
AI_MAX_TOKENS = _env_int('AI_MAX_TOKENS', 1024)
AI_REQUEST_TIMEOUT_SECONDS = _env_int('AI_REQUEST_TIMEOUT_SECONDS', 60)

AZURE_OPENAI_ENDPOINT    = os.getenv('AZURE_OPENAI_ENDPOINT', '')
AZURE_OPENAI_API_KEY     = os.getenv('AZURE_OPENAI_API_KEY', '')
AZURE_OPENAI_DEPLOYMENT  = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4o')
AZURE_OPENAI_API_VERSION = os.getenv('AZURE_OPENAI_API_VERSION', '2024-02-01')

HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
HUGGINGFACE_MODEL = os.getenv('HUGGINGFACE_MODEL', 'meta-llama/Llama-3.3-70B-Instruct')
HUGGINGFACE_API_URL = os.getenv(
    'HUGGINGFACE_API_URL',
    f'https://api-inference.huggingface.co/models/{HUGGINGFACE_MODEL}',
)

# --- File Upload Config ---
MAX_UPLOAD_SIZE_MB = 20
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

ALLOWED_FILE_TYPES = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/csv': 'csv',
    'image/jpeg': 'jpg',
    'image/png': 'png',
}

ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'jpg', 'jpeg', 'png']
