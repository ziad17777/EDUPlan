import requests as http_requests
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import UploadedFile
from .serializers import UploadedFileSerializer, AISummaryWebhookSerializer
from .validators import validate_uploaded_file, get_mime_type_from_extension

HF_BASE_URL = "https://ziad177777-eduplan.hf.space"


class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
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
        serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
        return Response({'message': 'File uploaded successfully.', 'file': serializer.data}, status=status.HTTP_201_CREATED)


class UserFilesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = UploadedFile.objects.filter(user=request.user)
        serializer = UploadedFileSerializer(files, many=True, context={'request': request})
        return Response({'count': files.count(), 'files': serializer.data})


class FileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UploadedFileSerializer(file, context={'request': request})
        return Response(serializer.data)


class DeleteFileView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        file.delete()
        return Response({'message': 'File deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# AI INTEGRATION — CONNECTED TO HUGGING FACE
# ─────────────────────────────────────────────────────────────

class SendFileToAIView(APIView):
    """
    POST /api/files/<file_id>/send-to-ai/

    Sends the file to Hugging Face at:
    POST https://ziad177777-eduplan.hf.space/api/upload

    The AI processes it and the summary is stored back in the database.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, file_id):
        try:
            uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Mark as processing
        uploaded_file.status = 'processing'
        uploaded_file.save()

        # Send file to Hugging Face
        ai_error = None
        try:
            with open(uploaded_file.file.path, 'rb') as f:
                hf_response = http_requests.post(
                    f"{HF_BASE_URL}/api/upload?username={str(request.user.id)}",
                    files={"files": (uploaded_file.original_filename, f, uploaded_file.mime_type)},
                    timeout=60
                )
            if hf_response.status_code == 200:
                result = hf_response.json()
                uploaded_file.ai_summary = result.get('status', 'File processed by AI.')
                uploaded_file.status = 'processed'
                uploaded_file.ai_processed_at = timezone.now()
                uploaded_file.save()
            else:
                ai_error = f"AI service returned status {hf_response.status_code}"
                uploaded_file.status = 'failed'
                uploaded_file.save()
        except http_requests.exceptions.Timeout:
            ai_error = "AI service timed out."
            uploaded_file.status = 'failed'
            uploaded_file.save()
        except http_requests.exceptions.ConnectionError:
            ai_error = "Could not connect to AI service."
            uploaded_file.status = 'failed'
            uploaded_file.save()

        serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
        return Response({
            'message': 'File sent to AI.' if not ai_error else 'AI processing failed.',
            'file': serializer.data,
            'ai_error': ai_error
        })


class AISummaryWebhookView(APIView):
    """Kept for manual summary injection if needed."""
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
            return Response({'message': 'AI summary stored.', 'file_id': str(file.id), 'status': file.status})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
