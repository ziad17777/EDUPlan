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
from gradio_client import Client, handle_file
_GRADIO_CLIENT = None


def get_gradio_client():
    """Lazily initialize and return a gradio_client.Client instance.

    Kept local to avoid circular imports with chat.views. Returns None
    when the client cannot be created so callers can respond with 502.
    """
    global _GRADIO_CLIENT
    if _GRADIO_CLIENT is not None:
        return _GRADIO_CLIENT
    try:
        _GRADIO_CLIENT = Client("ziad177777/EduPlan")
        return _GRADIO_CLIENT
    except Exception as e:
        print(f"Warning: could not initialize Gradio client: {e}")
        _GRADIO_CLIENT = None
        return None


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

        # Send file to Gradio Space (ziad177777/EduPlan) using gradio_client
        ai_error = None
        try:
            # Ensure we have a non-empty username to send to the Space.
            username = getattr(request.user, 'email', None)
            if not username:
                # Helpful response for testers (Postman) and for frontends that forgot to authenticate.
                ai_error = 'Missing authenticated username: please log in to the Django app before sending files to AI.'
                uploaded_file.status = 'failed'
                uploaded_file.save()
                serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
                print('SendFileToAIView: request.user.email is empty — aborting AI call')
                return Response({
                    'message': 'AI processing failed.',
                    'file': serializer.data,
                    'ai_error': ai_error
                }, status=status.HTTP_400_BAD_REQUEST)

            client = get_gradio_client()
            if client is None:
                ai_error = "AI backend unreachable."
                uploaded_file.status = 'failed'
                uploaded_file.save()
                serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
                return Response({
                    'message': 'AI processing failed.',
                    'file': serializer.data,
                    'ai_error': ai_error
                }, status=status.HTTP_502_BAD_GATEWAY)

            # Try the server-facing /django_process API first (files, username)
            result = None
            try:
                result = client.predict(
                    [handle_file(uploaded_file.file.path)],
                    request.user.email,
                    api_name="/django_process",
                )
            except Exception as e_primary:
                print(f"Primary /django_process call failed: {e_primary}")

            # If primary /django_process didn't return, fall back to /on_process and other variants
            summary = ''
            if not result:
                # try the traditional /on_process positional call
                try:
                    result = client.predict(
                        [handle_file(uploaded_file.file.path)],
                        request.user.email,
                        api_name="/on_process",
                    )
                except Exception as e_pos:
                    print(f"Positional /on_process call failed: {e_pos}")

            if not result:
                # try keyword-style call for /on_process
                try:
                    result = client.predict(
                        files=[handle_file(uploaded_file.file.path)],
                        api_name="/on_process",
                    )
                except Exception as e_kw:
                    print(f"Keyword /on_process call failed: {e_kw}")

            if not result:
                # experimental: try /django_on_process and /django_process (again)
                for alt_api in ("/django_on_process",):
                    try:
                        print(f"Trying fallback api_name={alt_api}")
                        result = client.predict(
                            [handle_file(uploaded_file.file.path)],
                            request.user.email,
                            api_name=alt_api,
                        )
                        if result:
                            break
                    except Exception as e_alt:
                        print(f"Fallback {alt_api} failed: {e_alt}")

            # Final attempt: call /on_process with files only
            if not result:
                try:
                    result = client.predict(
                        [handle_file(uploaded_file.file.path)],
                        api_name="/on_process",
                    )
                except Exception as e_final:
                    print(f"Final /on_process(files) attempt failed: {e_final}")

            # Interpret the result: according to the space, /on_process returns a tuple (markdown, markdown)
            if result:
                if isinstance(result, (list, tuple)):
                    # take first non-empty element
                    for item in result:
                        if item:
                            summary = str(item)
                            break
                else:
                    summary = str(result)

            # If the Space returned a login prompt, try a few server-side django_* fallbacks
            if summary and "Please log in" in summary:
                print("on_process returned a login prompt; attempting django_* fallbacks...")
                fallback_result = None
                try:
                    fallback_result = client.predict(
                        [handle_file(uploaded_file.file.path)],
                        request.user.email,
                        api_name="/django_on_process",
                    )
                    print("/django_on_process returned", type(fallback_result))
                except Exception as e_f1:
                    print(f"/django_on_process failed: {e_f1}")

                if not fallback_result:
                    try:
                        fallback_result = client.predict(
                            [handle_file(uploaded_file.file.path)],
                            request.user.email,
                            api_name="/django_process",
                        )
                    except Exception as e_f2:
                        print(f"/django_process failed: {e_f2}")

                if not fallback_result:
                    # try keyword variations
                    try:
                        fallback_result = client.predict(
                            files=[handle_file(uploaded_file.file.path)],
                            u=request.user.email,
                            api_name="/django_on_process",
                        )
                    except Exception as e_f3:
                        print(f"keyword django_on_process failed: {e_f3}")

                if fallback_result:
                    if isinstance(fallback_result, (list, tuple)):
                        for item in fallback_result:
                            if item:
                                summary = str(item)
                                break
                    else:
                        summary = str(fallback_result)

                # If still login prompt, surface a helpful ai_error
                if summary and "Please log in" in summary:
                    ai_error = "AI service requires a Hugging Face login for file processing; please follow the Space's authentication flow or use a server-capable endpoint."
            else:
                # no result at all
                if not summary:
                    ai_error = ai_error or "AI service did not return a summary; the Space may require login for file processing."
            uploaded_file.ai_summary = summary or 'File processed by AI.'
            uploaded_file.status = 'processed'
            uploaded_file.ai_processed_at = timezone.now()
            uploaded_file.save()
        except http_requests.exceptions.Timeout:
            ai_error = "AI service timed out."
            uploaded_file.status = 'failed'
            uploaded_file.save()
        except http_requests.exceptions.ConnectionError:
            ai_error = "Could not connect to AI service."
            uploaded_file.status = 'failed'
            uploaded_file.save()
        except Exception as e:
            ai_error = f"AI client error: {str(e)}"
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
