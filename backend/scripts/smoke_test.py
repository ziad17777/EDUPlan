import os
import sys
import django
import json
from pathlib import Path

# Make sure the project root is on sys.path so `import core.settings` works
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from chat.views import (
    SendMessageView, GenerateAudioView, GenerateVideoView,
    GeneratePlanView, GenerateVocabView, get_gradio_client
)


def pretty_print(resp):
    try:
        data = resp.data
    except Exception:
        data = str(resp)
    print('STATUS:', getattr(resp, 'status_code', 'N/A'))
    print('DATA:', json.dumps(data, default=str, indent=2))
    print('-' * 60)


def main():
    User = get_user_model()
    user_email = 'smoketest@example.com'
    user, created = User.objects.get_or_create(
        email=user_email,
        defaults={'first_name': 'Smoke', 'last_name': 'Test'}
    )
    if created:
        user.set_password('testpass')
        user.save()

    print('Using HF_TOKEN present?:', bool(os.environ.get('HF_TOKEN')))
    print('Initializing gradio client...')
    client = get_gradio_client()
    print('Client initialized?:', bool(client))

    factory = APIRequestFactory()

    # 1) SendMessageView
    print('Calling SendMessageView...')
    req = factory.post('/api/chat/messages/send/', {'content': 'hello from smoke test'}, format='json')
    force_authenticate(req, user=user)
    resp = SendMessageView.as_view()(req)
    pretty_print(resp)

    # 2) GenerateAudioView
    print('Calling GenerateAudioView...')
    req = factory.post('/api/chat/audio/generate/', {'text': 'hello', 'lang': 'en'}, format='json')
    force_authenticate(req, user=user)
    resp = GenerateAudioView.as_view()(req)
    pretty_print(resp)

    # 3) GenerateVideoView
    print('Calling GenerateVideoView...')
    req = factory.post('/api/chat/video/generate/', {'text': 'hello', 'lang': 'en'}, format='json')
    force_authenticate(req, user=user)
    resp = GenerateVideoView.as_view()(req)
    pretty_print(resp)

    # 4) GeneratePlanView
    print('Calling GeneratePlanView...')
    req = factory.post('/api/chat/plan/generate/', {'duration': '2 weeks', 'lang': 'en'}, format='json')
    force_authenticate(req, user=user)
    resp = GeneratePlanView.as_view()(req)
    pretty_print(resp)

    # 5) GenerateVocabView
    print('Calling GenerateVocabView...')
    req = factory.post('/api/chat/vocab/generate/', {'lang': 'en'}, format='json')
    force_authenticate(req, user=user)
    resp = GenerateVocabView.as_view()(req)
    pretty_print(resp)


if __name__ == '__main__':
    main()
