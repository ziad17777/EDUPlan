from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UploadedFile, ChatSession, ChatMessage
from .serializers import *

ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx']

# ── AUTH ──────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ── FILES ─────────────────────────────────────────────

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        ext = file.name.split('.')[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return Response({'error': 'Only PDF, DOCX, and PPTX allowed'}, status=400)

        uploaded = UploadedFile.objects.create(
            user=request.user,
            file=file,
            original_name=file.name,
            file_type=ext
        )
        return Response(UploadedFileSerializer(uploaded).data, status=201)

    def get(self, request):
        files = UploadedFile.objects.filter(user=request.user).order_by('-uploaded_at')
        return Response(UploadedFileSerializer(files, many=True).data)


# ── CHAT ──────────────────────────────────────────────

class ChatSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user).order_by('-created_at')
        return Response(ChatSessionSerializer(sessions, many=True).data)

    def post(self, request):
        session = ChatSession.objects.create(
            user=request.user,
            title=request.data.get('title', 'New Chat')
        )
        return Response(ChatSessionSerializer(session).data, status=201)


class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = ChatSession.objects.get(id=session_id, user=request.user)
        messages = session.messages.all().order_by('created_at')
        return Response(ChatMessageSerializer(messages, many=True).data)

    def post(self, request, session_id):
        session = ChatSession.objects.get(id=session_id, user=request.user)
        
        # Save the user message
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            content=request.data.get('content', ''),
            file_id=request.data.get('file_id')  # optional: attach a file
        )

        # ← AI team plugs in here. For now return a placeholder.
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='ai',
            content='[AI response goes here — AI team will fill this in]'
        )

        return Response({
            'user_message': ChatMessageSerializer(user_msg).data,
            'ai_message': ChatMessageSerializer(ai_msg).data,
        }, status=201)