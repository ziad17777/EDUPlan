import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import UploadedFile
from .serializers import UploadedFileSerializer, AISummaryWebhookSerializer
from .validators import validate_uploaded_file, get_mime_type_from_extension
from chat.models import ChatSession
from core.ai_client import AIServiceError, upload_file as upload_file_to_ai

logger = logging.getLogger(__name__)


class UploadFileView(APIView):
    """
    POST /api/files/upload/
    Upload a file. Validates type (PDF, DOCX, PPTX, XLSX, CSV, JPG, JPEG, PNG)
    and size (max 20MB). Returns file metadata.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        session_id = request.data.get('session_id')
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ext = validate_uploaded_file(file)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        mime_type = get_mime_type_from_extension(ext)
        uploaded_file = UploadedFile.objects.create(
            user=request.user,
            original_filename=file.name,
            file=file,
            file_type=ext,
            mime_type=mime_type,
            file_size=file.size,
            status='uploaded'
        )

        ai_status = None
        ai_error = None
        if session:
            try:
                upload_file_to_ai(
                    session_id=str(session.id),
                    username=request.user.email,
                    file_path=uploaded_file.file.path,
                    filename=uploaded_file.original_filename,
                    content_type=uploaded_file.mime_type,
                )
                ai_status = 'indexed'
            except AIServiceError:
                logger.exception("AI upload failed for file upload.")
                ai_status = 'error'
                ai_error = 'AI service upload failed.'

        serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
        return Response({
            'message': 'File uploaded successfully.',
            'file': serializer.data,
            **({'ai_status': ai_status} if ai_status else {}),
            **({'ai_error': ai_error} if ai_error else {})
        }, status=status.HTTP_201_CREATED)


class UserFilesListView(APIView):
    """GET /api/files/ — Retrieve all files belonging to the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = UploadedFile.objects.filter(user=request.user)
        serializer = UploadedFileSerializer(files, many=True, context={'request': request})
        return Response({
            'count': files.count(),
            'files': serializer.data
        })


class FileDetailView(APIView):
    """GET /api/files/<file_id>/ — Retrieve a single file's metadata."""
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UploadedFileSerializer(file, context={'request': request})
        return Response(serializer.data)


class DeleteFileView(APIView):
    """DELETE /api/files/<file_id>/delete/ — Delete a file and remove it from disk."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file.delete()  # Calls custom delete() that removes file from disk
        return Response({'message': 'File deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# AI INTEGRATION ENDPOINTS (Placeholders)
# ─────────────────────────────────────────────────────────────

class SendFileToAIView(APIView):
    """
    POST /api/files/<file_id>/send-to-ai/
    
    AI INTEGRATION PLACEHOLDER
    ──────────────────────────
    This endpoint is the trigger point for the AI team's file processing pipeline.
    
    What happens here (to be implemented by AI team):
    1. Retrieve the file from storage.
    2. Send the file (or a signed URL) to the AI service.
    3. The AI service processes the file asynchronously.
    4. The AI service calls POST /api/files/<file_id>/ai-summary/ with the result.
    
    Current behavior: Marks the file as 'processing' and returns a placeholder response.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        try:
            file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        file.status = 'processing'
        file.save(update_fields=['status'])

        try:
            upload_file_to_ai(
                session_id=str(session.id),
                username=request.user.email,
                file_path=file.file.path,
                filename=file.original_filename,
                content_type=file.mime_type,
            )
        except AIServiceError:
            logger.exception("AI upload failed for send-to-ai request.")
            file.status = 'failed'
            file.save(update_fields=['status'])
            return Response(
                {'error': 'AI upload failed.'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({
            'message': 'File sent to AI processing.',
            'file_id': str(file.id),
            'status': file.status,
        })


class AISummaryWebhookView(APIView):
    """
    POST /api/files/<file_id>/ai-summary/
    
    AI INTEGRATION PLACEHOLDER — WEBHOOK RECEIVER
    ──────────────────────────────────────────────
    The AI service calls this endpoint to deliver the file summary back to our backend.
    
    Expected payload:
    {
        "file_id": "<uuid>",
        "summary": "This document contains...",
        "status": "processed" | "failed"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        serializer = AISummaryWebhookSerializer(data=request.data)
        if serializer.is_valid():
            try:
                file = UploadedFile.objects.get(id=file_id, user=request.user)
            except UploadedFile.DoesNotExist:
                return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

            file.ai_summary = serializer.validated_data['summary']
            file.status = serializer.validated_data['status']
            file.ai_processed_at = timezone.now()
            file.save()

            return Response({
                'message': 'AI summary stored successfully.',
                'file_id': str(file.id),
                'status': file.status,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
