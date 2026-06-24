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
from files.models import UploadedFile

HF_BASE_URL = "https://ziad177777-eduplan.hf.space"
GRADIO_CLIENT = Client("ziad177777/EduPlan")


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
# MESSAGING — CONNECTED TO HUGGING FACE AI
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
            client = GRADIO_CLIENT
            # The space's /chat_logic endpoint expects 'message' and 'username'
            # history isn't accepted by the documented API, so we send the single
            # user message and the username. If you want to pass history, you
            # can combine it into the message string or update the space.
            result = client.predict(
                message=data.get('content', ''),
                username=str(request.user.id),
                api_name="/chat_logic",
            )
            # result can be many types depending on the space; normalize to str
            if isinstance(result, (list, tuple)):
                # take first element if a tuple/list
                ai_reply = result[0] if result else ''
            else:
                ai_reply = result
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


# ─────────────────────────────────────────────────────────────
# STUDY PLAN GENERATION  (/start_plan -> /on_gen_plan -> /end_plan)
# ─────────────────────────────────────────────────────────────

class GenerateStudyPlanView(APIView):
    """
    POST /api/chat/plan/generate/
    Body: { "duration": "1 week" | "2 weeks" | "1 month", "lang": "auto" | "en" | "ar" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        duration = request.data.get('duration', '2 weeks')
        lang = request.data.get('lang', 'auto')
        try:
            GRADIO_CLIENT.predict(api_name="/start_plan")
            result = GRADIO_CLIENT.predict(duration=duration, lang=lang, api_name="/on_gen_plan")
            GRADIO_CLIENT.predict(api_name="/end_plan")
            plan_markdown = _first_str(result)
            return Response({'duration': duration, 'lang': lang, 'plan': plan_markdown})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# ESSAY GRADING  (/start_grade -> /grade_essay -> /end_grade)
# ─────────────────────────────────────────────────────────────

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
        try:
            GRADIO_CLIENT.predict(api_name="/start_grade")
            result = GRADIO_CLIENT.predict(
                essay_text=essay_text, rubric=rubric, lang_choice=lang_choice,
                api_name="/grade_essay",
            )
            GRADIO_CLIENT.predict(api_name="/end_grade")
            feedback = _first_str(result)
            return Response({'feedback': feedback})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# AUDIO GENERATION  (/start_audio -> /on_gen_audio -> /end_audio)
# ─────────────────────────────────────────────────────────────

class GenerateAudioView(APIView):
    """
    POST /api/chat/audio/generate/
    Body: { "text": "...", "lang": "auto" | "en" | "ar" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        lang = request.data.get('lang', 'auto')
        if not text:
            return Response({'error': 'text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            GRADIO_CLIENT.predict(api_name="/start_audio")
            audio_path = GRADIO_CLIENT.predict(text=text, lang=lang, api_name="/on_gen_audio")
            GRADIO_CLIENT.predict(audio_path=handle_file(audio_path), api_name="/end_audio")
            url = _save_generated_file(audio_path, request.user.id, 'audio')
            if not url:
                return Response({'error': 'Audio generation failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({'audio_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# VIDEO GENERATION  (/start_video -> /on_gen_video -> /end_video)
# ─────────────────────────────────────────────────────────────

class GenerateVideoView(APIView):
    """
    POST /api/chat/video/generate/
    Body: { "text": "...", "lang": "auto" | "en" | "ar" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        lang = request.data.get('lang', 'auto')
        if not text:
            return Response({'error': 'text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            GRADIO_CLIENT.predict(api_name="/start_video")
            video_path = GRADIO_CLIENT.predict(text=text, lang=lang, api_name="/on_gen_video")
            GRADIO_CLIENT.predict(video_path=handle_file(video_path), api_name="/end_video")
            url = _save_generated_file(video_path, request.user.id, 'video')
            if not url:
                return Response({'error': 'Video generation failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({'video_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# VOCAB GENERATION  (/start_vocab -> /on_gen_vocab -> /end_vocab)
# ─────────────────────────────────────────────────────────────

class GenerateVocabView(APIView):
    """
    POST /api/chat/vocab/generate/
    Body: { "lang": "auto" | "en" | "ar" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = request.data.get('lang', 'auto')
        try:
            GRADIO_CLIENT.predict(api_name="/start_vocab")
            result = GRADIO_CLIENT.predict(lang=lang, api_name="/on_gen_vocab")
            GRADIO_CLIENT.predict(api_name="/end_vocab")
            vocab_markdown = _first_str(result)
            return Response({'lang': lang, 'vocab': vocab_markdown})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# ANALYTICS  (/on_analytics)
# ─────────────────────────────────────────────────────────────

class AnalyticsView(APIView):
    """GET /api/chat/analytics/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            result = GRADIO_CLIENT.predict(api_name="/on_analytics")
            return Response({'analytics': _first_str(result)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


# ─────────────────────────────────────────────────────────────
# EXPORTS  (/on_download_db, /on_download_hist)
# ─────────────────────────────────────────────────────────────

class DownloadDatabaseView(APIView):
    """GET /api/chat/export/db/ — proxies the AI service's SQLite DB download."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            file_path = GRADIO_CLIENT.predict(api_name="/on_download_db")
            url = _save_generated_file(file_path, request.user.id, 'exports')
            if not url:
                return Response({'error': 'Export failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({'download_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)


class DownloadHistoryView(APIView):
    """GET /api/chat/export/history/ — proxies the AI service's history ZIP download."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            file_path = GRADIO_CLIENT.predict(api_name="/on_download_hist")
            url = _save_generated_file(file_path, request.user.id, 'exports')
            if not url:
                return Response({'error': 'Export failed.'}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({'download_url': request.build_absolute_uri(url)})
        except Exception as e:
            return Response({'error': f'AI client error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)
