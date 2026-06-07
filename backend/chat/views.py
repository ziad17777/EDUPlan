import requests as http_requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionListSerializer, ChatSessionDetailSerializer,
    ChatMessageSerializer, SendMessageSerializer, AIResponseWebhookSerializer
)
from files.models import UploadedFile

HF_BASE_URL = "https://ziad177777-eduplan.hf.space"


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

        # Call Hugging Face AI
        ai_reply = None
        ai_error = None
        try:
            hf_response = http_requests.post(
                f"{HF_BASE_URL}/api/chat",
                json={
                    "username": str(request.user.id),
                    "message": data.get('content', ''),
                    "history": history
                },
                timeout=30
            )
            if hf_response.status_code == 200:
                ai_reply = hf_response.json().get('reply', '')
            else:
                ai_error = f"AI service returned status {hf_response.status_code}"
        except http_requests.exceptions.Timeout:
            ai_error = "AI service timed out."
        except http_requests.exceptions.ConnectionError:
            ai_error = "Could not connect to AI service."

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
