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
from core.ai_client import (
    AIServiceError,
    send_chat_message,
    upload_file as upload_file_to_ai,
    health_check,
)


def build_ai_history(session, exclude_message_id=None):
    history = []
    messages = session.messages.order_by('created_at')
    for msg in messages:
        if exclude_message_id and msg.id == exclude_message_id:
            continue
        if msg.message_type == 'file':
            continue
        if msg.sender == 'user':
            role = 'user'
        elif msg.sender == 'ai':
            role = 'assistant'
        else:
            continue
        if not msg.content:
            continue
        history.append({'role': role, 'content': msg.content})
    return history


# ─────────────────────────────────────────────────────────────
# CHAT SESSION MANAGEMENT
# ─────────────────────────────────────────────────────────────

class ChatSessionListView(APIView):
    """
    GET  /api/chat/sessions/        — List all chat sessions for the user.
    POST /api/chat/sessions/create/ — Explicitly create a new empty session.
    
    Note: Sessions are also auto-created when the user sends their first message.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response({
            'count': sessions.count(),
            'sessions': serializer.data
        })


class CreateChatSessionView(APIView):
    """POST /api/chat/sessions/create/ — Explicitly create a new chat session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', '')
        session = ChatSession.objects.create(user=request.user, title=title)
        serializer = ChatSessionDetailSerializer(session)
        return Response({
            'message': 'Chat session created.',
            'session': serializer.data
        }, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    """
    GET    /api/chat/sessions/<session_id>/ — Full session details + all messages.
    DELETE /api/chat/sessions/<session_id>/delete/ — Delete session + all messages.
    """
    permission_classes = [IsAuthenticated]

    def _get_session(self, session_id, user):
        try:
            return ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            return None

    def get(self, request, session_id):
        session = self._get_session(session_id, request.user)
        if not session:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data)


class DeleteChatSessionView(APIView):
    """DELETE /api/chat/sessions/<session_id>/delete/ — Delete a session."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response({'message': 'Chat session deleted.'}, status=status.HTTP_200_OK)


class ChatHistoryView(APIView):
    """GET /api/chat/sessions/<session_id>/history/ — Full message history for a session."""
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
    """
    POST /api/chat/sessions/<session_id>/attach-file/
    
    Attach a previously uploaded file to a chat session.
    This creates a 'file' type message in the session timeline,
    so the chat history reflects the file was shared at that point.
    
    Body: { "file_id": "<uuid>" }
    """
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

        ai_status = None
        ai_error = None
        try:
            upload_file_to_ai(
                session_id=str(session.id),
                username=request.user.email,
                file_path=uploaded_file.file.path,
                filename=uploaded_file.original_filename,
                content_type=uploaded_file.mime_type,
            )
            ai_status = "indexed"
        except AIServiceError:
            ai_status = "error"
            ai_error = "AI service upload failed."

        serializer = ChatMessageSerializer(message, context={'request': request})
        return Response({
            'message': 'File attached to chat session.',
            'chat_message': serializer.data,
            'ai_status': ai_status,
            **({'ai_error': ai_error} if ai_error else {})
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────
# MESSAGING
# ─────────────────────────────────────────────────────────────

class SendMessageView(APIView):
    """
    POST /api/chat/messages/send/
    
    Send a user message. If no session_id is provided, a new session is
    auto-created and the session_id is returned to the frontend.
    
    Body:
    {
        "content": "Hello, summarize this file.",
        "attached_file_id": "<uuid>",   // optional
        "session_id": "<uuid>"           // optional — omit to start a new session
    }
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
            # Auto-create session on first message
            content_preview = data.get('content', '')[:50] or 'New conversation'
            session = ChatSession.objects.create(
                user=request.user,
                title=content_preview
            )
            session_created = True

        # Resolve optional file attachment
        attached_file = None
        if data.get('attached_file_id'):
            try:
                attached_file = UploadedFile.objects.get(
                    id=data['attached_file_id'],
                    user=request.user
                )
            except UploadedFile.DoesNotExist:
                return Response({'error': 'Attached file not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Determine message type
        msg_type = 'file' if attached_file and not data.get('content') else 'text'

        # Store user message
        message = ChatMessage.objects.create(
            session=session,
            sender='user',
            message_type=msg_type,
            content=data.get('content', ''),
            attached_file=attached_file
        )
        session.update_activity()

        msg_serializer = ChatMessageSerializer(message, context={'request': request})

        if attached_file:
            try:
                upload_file_to_ai(
                    session_id=str(session.id),
                    username=request.user.email,
                    file_path=attached_file.file.path,
                    filename=attached_file.original_filename,
                    content_type=attached_file.mime_type,
                )
            except AIServiceError:
                return Response({
                    'session_id': str(session.id),
                    'session_created': session_created,
                    'message': msg_serializer.data,
                    'ai_status': 'error',
                    'ai_error': 'AI file upload failed.',
                }, status=status.HTTP_502_BAD_GATEWAY)

        history = build_ai_history(session, exclude_message_id=message.id)
        try:
            ai_payload = send_chat_message(
                session_id=str(session.id),
                username=request.user.email,
                message=message.content,
                history=history,
            )
        except AIServiceError:
            return Response({
                'session_id': str(session.id),
                'session_created': session_created,
                'message': msg_serializer.data,
                'ai_status': 'error',
                'ai_error': 'AI service unavailable.',
            }, status=status.HTTP_502_BAD_GATEWAY)

        if 'reply' not in ai_payload:
            return Response({
                'session_id': str(session.id),
                'session_created': session_created,
                'message': msg_serializer.data,
                'ai_status': 'error',
                'ai_error': 'AI service returned no reply.',
            }, status=status.HTTP_502_BAD_GATEWAY)
        ai_reply = ai_payload.get('reply')
        if ai_reply is None:
            return Response({
                'session_id': str(session.id),
                'session_created': session_created,
                'message': msg_serializer.data,
                'ai_status': 'error',
                'ai_error': 'AI service returned no reply.',
            }, status=status.HTTP_502_BAD_GATEWAY)

        ai_message = ChatMessage.objects.create(
            session=session,
            sender='ai',
            message_type='ai_response',
            content=ai_reply,
        )
        session.update_activity()
        ai_serializer = ChatMessageSerializer(ai_message, context={'request': request})

        return Response({
            'session_id': str(session.id),
            'session_created': session_created,
            'message': msg_serializer.data,
            'ai_message': ai_serializer.data,
            'ai_status': 'ok'
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────
# AI INTEGRATION ENDPOINTS (Placeholders)
# ─────────────────────────────────────────────────────────────

class AIResponseWebhookView(APIView):
    """
    POST /api/chat/sessions/<session_id>/ai-response/
    
    AI INTEGRATION PLACEHOLDER — WEBHOOK RECEIVER
    ──────────────────────────────────────────────
    The AI service calls this endpoint to deliver its response.
    The response is stored as a ChatMessage with sender='ai'.
    
    Expected payload:
    {
        "session_id": "<uuid>",
        "content": "Here is the AI response...",
        "message_type": "ai_response" | "ai_summary"
    }
    """
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
        return Response({
            'message': 'AI response stored in chat history.',
            'ai_message': msg_serializer.data
        }, status=status.HTTP_201_CREATED)


class AIHealthProxyView(APIView):
    """GET /api/chat/ai/health/ — Proxy health check to the AI service."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = health_check()
        except AIServiceError:
            return Response(
                {'status': 'error', 'detail': 'AI service unavailable.'},
                status=status.HTTP_502_BAD_GATEWAY
            )
        return Response(data, status=status.HTTP_200_OK)
