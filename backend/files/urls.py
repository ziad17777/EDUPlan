from django.urls import path
from .views import (
    UploadFileView, UserFilesListView, FileDetailView,
    DeleteFileView, SendFileToAIView, AISummaryWebhookView
)

urlpatterns = [
    path('', UserFilesListView.as_view(), name='user_files'),
    path('upload/', UploadFileView.as_view(), name='upload_file'),
    path('<uuid:file_id>/', FileDetailView.as_view(), name='file_detail'),
    path('<uuid:file_id>/delete/', DeleteFileView.as_view(), name='delete_file'),
    # AI Integration
    path('<uuid:file_id>/send-to-ai/', SendFileToAIView.as_view(), name='send_file_to_ai'),
    path('<uuid:file_id>/ai-summary/', AISummaryWebhookView.as_view(), name='ai_summary_webhook'),
]
