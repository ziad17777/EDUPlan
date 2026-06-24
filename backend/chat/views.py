import os
import shutil
import requests as http_requests
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from gradio_client import Client, handle_file

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionListSerializer, ChatSessionDetailSerializer,
    ChatMessageSerializer, SendMessageSerializer, AIResponseWebhookSerializer
)
from .serializers import (
    AudioGenSerializer, VideoGenSerializer, PlanGenSerializer, VocabGenSerializer
)
from files.models import UploadedFile

HF_BASE_URL = "https://ziad177777-eduplan.hf.space"
HF_TOKEN = ""
# Lazily initialize gradio client to avoid network calls at import time and
# to provide a safe fallback when the Hugging Face Space is unreachable.
_GRADIO_CLIENT = None
_GRADIO_LOCK = None

def get_gradio_client():
    global _GRADIO_CLIENT
    if _GRADIO_CLIENT is not None:
        return _GRADIO_CLIENT
    try:
        # Allow optional authentication using a Hugging Face token. This
        # lets the backend call the Space on behalf of the application
        # (useful if the Space requires a logged-in HF user).
        hf_token = getattr(settings, 'HF_TOKEN', None) or os.environ.get('HF_TOKEN')
        # Some gradio_client versions accept 'hf_token' kwarg, others expect
        # it via environment. Set it in env for compatibility, then create
        # the Client without the kwarg.
        if hf_token:
            os.environ['HF_TOKEN'] = hf_token
        _GRADIO_CLIENT = Client("ziad177777/EduPlan")
        return _GRADIO_CLIENT
    except Exception as e:
        # don't crash the whole app if the space is unreachable; callers should
        # handle a None return and respond with a 502 or friendly message.
        print(f"Warning: could not initialize Gradio client: {e}")
        _GRADIO_CLIENT = None
        return None


def _save_generated_file(src_path, user_id, subfolder):
    """
    Copies a file returned by the Gradio client (which lives in a temp dir)
    into MEDIA_ROOT/generated/<subfolder>/<user_id>/ so it can be served back
    to the frontend via a stable, permanent URL.
    Returns the absolute media URL (e.g. /media/generated/audio/<user_id>/file.mp3).
    """
    if not src_path or not os.path.isfile(src_path):
        return None
    dest_dir = os.path.join(settings.MEDIA_ROOT, 'generated', subfolder, str(user_id))
    os.makedirs(dest_dir, exist_ok=True)
    filename = os.path.basename(src_path)
    dest_path = os.path.join(dest_dir, filename)
    shutil.copyfile(src_path, dest_path)
    return f"{settings.MEDIA_URL}generated/{subfolder}/{user_id}/{filename}"


def _first_str(result):
    """Normalize a gradio_client result (which can be str/tuple/list) to a string."""
    if isinstance(result, (list, tuple)):
        for item in result:
            if item:
                return str(item)
        return ''
    return str(result) if result is not None else ''


def _resolve_file_path(maybe_path_or_file):
    """Resolve a result from gradio_client to a local filesystem path.

    Handles:
    - plain string local paths
    - tuple/list wrappers
    - http(s) URLs (downloaded to a temp file)
    - objects with a `name` attribute (FileData from gradio_client)
    Returns absolute local path or None.
    """

    # unwrap lists/tuples
    if isinstance(maybe_path_or_file, (list, tuple)):
        for item in maybe_path_or_file:
            p = _resolve_file_path(item)
            if p:
                return p
        return None

    # If it's already a path-like string
    if isinstance(maybe_path_or_file, str):
        # Local file
        if os.path.exists(maybe_path_or_file):
            return os.path.abspath(maybe_path_or_file)
        # Remote URL -> try download
        if maybe_path_or_file.startswith("http://") or maybe_path_or_file.startswith("https://"):
            try:
                r = http_requests.get(maybe_path_or_file, stream=True, timeout=15)
                if r.status_code == 200:
                    tmp = os.path.join(settings.MEDIA_ROOT, 'tmp')
                    os.makedirs(tmp, exist_ok=True)
                    fname = os.path.join(tmp, os.path.basename(maybe_path_or_file))
                    with open(fname, 'wb') as fh:
                        for chunk in r.iter_content(8192):
                            fh.write(chunk)
                    return os.path.abspath(fname)
            except Exception:
                return None
        return None

    # Objects with a 'name' attribute (FileData)
    if hasattr(maybe_path_or_file, 'name') and isinstance(getattr(maybe_path_or_file, 'name'), str):
        if os.path.exists(maybe_path_or_file.name):
            return os.path.abspath(maybe_path_or_file.name)
    return None

# ─────────────────────────────────────────────────────────────
# CHAT SESSION MANAGEMENT
# ─────────────────────────────────────────────────────────────

class ChatSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response({'count': sessions.count(), 'sessions': serializer.data})


class CreateChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', '')
        session = ChatSession.objects.create(user=request.user, title=title)
        serializer = ChatSessionDetailSerializer(session)
        return Response({'message': 'Chat session created.', 'session': serializer.data}, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data)


class DeleteChatSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response({'message': 'Chat session deleted.'}, status=status.HTTP_200_OK)


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        messages = session.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response({
            'session_id': str(session.id),
            'title': session.title,
            'message_count': messages.count(),
            'messages': serializer.data
        })


# ─────────────────────────────────────────────────────────────
# FILE ATTACHMENT TO SESSION
# ─────────────────────────────────────────────────────────────

class AttachFileToChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        file_id = request.data.get('file_id')
        if not file_id:
            return Response({'error': 'file_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found or does not belong to you.'}, status=status.HTTP_404_NOT_FOUND)

        message = ChatMessage.objects.create(
            session=session,
            sender='user',
            message_type='file',
            content=f"Attached file: {uploaded_file.original_filename}",
            attached_file=uploaded_file
        )
        session.update_activity()

        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response({'message': 'File attached to chat session.', 'chat_message': serializer.data}, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────
# MESSAGING - CONNECTED TO HUGGING FACE AI
# ─────────────────────────────────────────────────────────────

class SendMessageView(APIView):
    """
    POST /api/chat/messages/send/

    Sends the user message to the Hugging Face AI at:
    POST https://ziad177777-eduplan.hf.space/api/chat

    Then stores both the user message and the AI reply in the database.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # print ("Serializer is valid. Validated data:")
        # print(serializer.validated_data)
        data = serializer.validated_data
        session_id = data.get('session_id')
        session_created = False

        # Resolve or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            content_preview = data.get('content', '')[:50] or 'New conversation'
            session = ChatSession.objects.create(user=request.user, title=content_preview)
            session_created = True

        # Resolve optional file attachment
        attached_file = None
        if data.get('attached_file_id'):
            try:
                attached_file = UploadedFile.objects.get(id=data['attached_file_id'], user=request.user)
            except UploadedFile.DoesNotExist:
                return Response({'error': 'Attached file not found.'}, status=status.HTTP_404_NOT_FOUND)
        print(f"Session ID: {session.id}, User Message: {data.get('content', '')}, Attached File ID: {data.get('attached_file_id')}")
        # Determine message type
        msg_type = 'file' if attached_file and not data.get('content') else 'text'

        # Store user message in DB
        user_message = ChatMessage.objects.create(
            session=session,
            sender='user',
            message_type=msg_type,
            content=data.get('content', ''),
            attached_file=attached_file
        )
        session.update_activity()

        # Build chat history to send to Hugging Face
        history = [
            {"role": "user" if m.sender == "user" else "assistant", "content": m.content}
            for m in session.messages.exclude(id=user_message.id).order_by('created_at')
        ]

        # Call Gradio Space (ziad177777/EduPlan) using gradio_client
        ai_reply = None
        ai_error = None
        try:
            client = get_gradio_client()
            if client is None:
                ai_error = "AI backend unreachable (gradio client not initialized)."
            else:
                # Validate username before calling the Space — sending an empty
                # username triggers the Space's "Please log in" guard.
                username = getattr(request.user, 'email', None)
                if not username:
                    ai_error = 'Missing authenticated username: please log in to the Django app before sending chat messages to AI.'
                    print('SendMessageView: request.user.email is empty — aborting AI call')
                    # skip AI calls when there's no username
                    username = None
                # Call the Space's chat handler. The Space defines:
                # def chat_logic(message, history, username)
                # Use positional args (message, history, username) to match the
                # handler signature exposed by the Space and avoid invalid
                # keyword-name mismatches.
                # Primary call: message, history, username (keeps backward compatibility)
                ai_reply = None
                try:
                    if username:
                        result = client.predict(
                            data.get('content', ''),
                            history,
                            username,
                            api_name="/chat_logic",
                        )
                        ai_reply = _first_str(result)
                    else:
                        result = None
                        ai_reply = None
                except Exception as e_primary:
                    # capture and continue to try fallbacks
                    print(f"Primary chat predict failed: {e_primary}")

                # If the Space responded with a login prompt or primary call failed,
                # try a few fallback calling patterns the Space may accept.
                if ai_reply and "Please log in with Hugging Face" in ai_reply:
                    print("Space requested HF login; attempting fallback chat predict patterns...")
                    # try calling with message only (some space versions expect that)
                    try:
                        result_alt = client.predict(
                            data.get('content', ''),
                            api_name="/chat_logic",
                        )
                        ai_reply = _first_str(result_alt)
                        print("Fallback message-only returned:", ai_reply[:120])
                    except Exception as e_alt:
                        print(f"Fallback message-only predict failed: {e_alt}")

                    # if still asking to login, try passing message as keyword
                    if ai_reply and "Please log in with Hugging Face" in ai_reply:
                        try:
                            result_kw = client.predict(
                                message=data.get('content', ''),
                                api_name="/chat_logic",
                            )
                            ai_reply = _first_str(result_kw)
                            print("Fallback message= kw returned:", ai_reply[:120])
                        except Exception as e_kw:
                            print(f"Fallback keyword predict failed: {e_kw}")

                    # If after the chat_logic fallbacks we still have the login prompt,
                    # try the `/django_chat` endpoint which uses the (message, history, username)
                    # signature and may be exposed for server-side integrations.
                    if ai_reply and "Please log in with Hugging Face" in ai_reply:
                        try:
                            print("Attempting /django_chat fallback with (message, history, username)...")
                            if username:
                                result_django = client.predict(
                                    data.get('content', ''),
                                    history,
                                    username,
                                    api_name="/django_chat",
                                )
                            else:
                                result_django = None
                            ai_reply = _first_str(result_django)
                            print("/django_chat returned:", ai_reply[:120])
                        except Exception as e_dj:
                            print(f"/django_chat fallback failed: {e_dj}")

                    # If after all fallbacks we still have the login prompt, surface it as ai_error
                    if ai_reply and "Please log in with Hugging Face" in ai_reply:
                        ai_error = "AI service requires a Hugging Face login for chat; please follow the Space's authentication flow or provide a session-capable credential."
        except Exception as e:
            ai_error = f"AI client error: {str(e)}"

        # Store AI reply in DB
        ai_message = None
        if ai_reply:
            ai_message = ChatMessage.objects.create(
                session=session,
                sender='ai',
                message_type='ai_response',
                content=ai_reply
            )
            session.update_activity()

        user_msg_serializer = ChatMessageSerializer(user_message, context={'request': request})
        ai_msg_serializer = ChatMessageSerializer(ai_message, context={'request': request}) if ai_message else None

        return Response({
            'session_id': str(session.id),
            'session_created': session_created,
            'user_message': user_msg_serializer.data,
            'ai_message': ai_msg_serializer.data if ai_msg_serializer else None,
            'ai_error': ai_error
        }, status=status.HTTP_201_CREATED)


class AIResponseWebhookView(APIView):
    """Kept for manual AI response injection if needed."""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        serializer = AIResponseWebhookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        ai_message = ChatMessage.objects.create(
            session=session,
            sender='ai',
            message_type=serializer.validated_data['message_type'],
            content=serializer.validated_data['content']
        )
        session.update_activity()
        msg_serializer = ChatMessageSerializer(ai_message, context={'request': request})
        return Response({'message': 'AI response stored.', 'ai_message': msg_serializer.data}, status=status.HTTP_201_CREATED)


class GenerateAudioView(APIView):
    """POST /api/files/generate/audio/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AudioGenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        text = serializer.validated_data['text']
        lang = serializer.validated_data['lang']

        try:
            client = get_gradio_client()
            if client is None:
                return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
            # Space/django endpoint mapping expects (t, l, u) — use the
            # django-compatible API so the Space routes to the same handler.
            # Use positional args (text, lang, username).
            temp_result = client.predict(
                text,
                lang,
                request.user.email,
                api_name="/django_audio",
            )
            temp_path = _resolve_file_path(temp_result)
            if not temp_path:
                return Response({'error': 'Audio generation failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            url = _save_generated_file(temp_path, request.user.id, 'audio')
            return Response({"audio_url": request.build_absolute_uri(url)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateVideoView(APIView):
    """POST /api/files/generate/video/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VideoGenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        text = serializer.validated_data['text']
        lang = serializer.validated_data['lang']

        try:
            client = get_gradio_client()
            if client is None:
                return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
            temp_result = client.predict(
                text,
                lang,
                request.user.email,
                api_name="/django_video",
            )
            temp_path = _resolve_file_path(temp_result)
            if not temp_path:
                return Response({'error': 'Video generation failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            url = _save_generated_file(temp_path, request.user.id, 'video')
            return Response({"video_url": request.build_absolute_uri(url)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GeneratePlanView(APIView):
    """POST /api/files/generate/plan/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlanGenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        duration = serializer.validated_data['duration']
        lang = serializer.validated_data['lang']

        try:
            client = get_gradio_client()
            if client is None:
                return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
            result = client.predict(
                duration,
                lang,
                request.user.email,
                api_name="/django_plan",
            )
            return Response({"plan": _first_str(result)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateVocabView(APIView):
    """POST /api/files/generate/vocab/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VocabGenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lang = serializer.validated_data['lang']

        try:
            client = get_gradio_client()
            if client is None:
                return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
            result = client.predict(
                lang,
                request.user.email,
                api_name="/django_vocab",
            )
            return Response({"vocab": _first_str(result)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAnalyticsView(APIView):
    """GET /api/files/analytics/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            client = get_gradio_client()
            if client is None:
                return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
            result = client.predict(
                request.user.email,
                api_name="/django_analytics",
            )
            return Response({"analytics": _first_str(result)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Backwards-compatible aliases and missing views expected by chat/urls.py
# Some view names in the URL conf historically lived in the project root or
# used slightly different names; provide those names here so importing
# `from .views import ...` works without errors.
GenerateStudyPlanView = GeneratePlanView
AnalyticsView = GetAnalyticsView


class GradeEssayView(APIView):
    """
    POST /api/chat/grade/
    Body: { "essay_text": "...", "rubric": "...", "lang_choice": "auto" | "en" | "ar" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        essay_text = request.data.get('essay_text', '')
        rubric = request.data.get('rubric', '')
        lang_choice = request.data.get('lang_choice', 'auto')
        if not essay_text:
            return Response({'error': 'essay_text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        client = get_gradio_client()
        if client is None:
            return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)

        try:
            client.predict(api_name="/start_grade")
            result = client.predict(
                essay_text=essay_text, rubric=rubric, lang_choice=lang_choice,
                api_name="/grade_essay",
            )
            client.predict(api_name="/end_grade")
            feedback = _first_str(result)
            return Response({'feedback': feedback})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


class DownloadDatabaseView(APIView):
    """GET /api/chat/export/db/ - proxies the AI service's SQLite DB download."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = get_gradio_client()
        if client is None:
            return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
        try:
            file_result = client.predict(api_name="/on_download_db")
            file_path = _resolve_file_path(file_result)
            if not file_path:
                return Response({'error': 'Export failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            url = _save_generated_file(file_path, request.user.id, 'exports')
            return Response({'download_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


class DownloadHistoryView(APIView):
    """GET /api/chat/export/history/ - proxies the AI service's history ZIP download."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = get_gradio_client()
        if client is None:
            return Response({'error': 'AI backend unreachable.'}, status=status.HTTP_502_BAD_GATEWAY)
        try:
            file_result = client.predict(api_name="/on_download_hist")
            file_path = _resolve_file_path(file_result)
            if not file_path:
                return Response({'error': 'Export failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            url = _save_generated_file(file_path, request.user.id, 'exports')
            return Response({'download_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)