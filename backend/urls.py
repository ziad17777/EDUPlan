from django.urls import path
from .views import (
    ChatSessionListView, CreateChatSessionView,
    ChatSessionDetailView, DeleteChatSessionView,
    ChatHistoryView, AttachFileToChatView,
    SendMessageView, AIResponseWebhookView,
    GenerateStudyPlanView, GradeEssayView,
    GenerateAudioView, GenerateVideoView, GenerateVocabView,
    AnalyticsView, DownloadDatabaseView, DownloadHistoryView,
)

urlpatterns = [
    # Sessions
    path('sessions/', ChatSessionListView.as_view(), name='chat_sessions'),
    path('sessions/create/', CreateChatSessionView.as_view(), name='create_session'),
    path('sessions/<uuid:session_id>/', ChatSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<uuid:session_id>/delete/', DeleteChatSessionView.as_view(), name='delete_session'),
    path('sessions/<uuid:session_id>/history/', ChatHistoryView.as_view(), name='chat_history'),

    # File attachment
    path('sessions/<uuid:session_id>/attach-file/', AttachFileToChatView.as_view(), name='attach_file'),

    # Messaging
    path('messages/send/', SendMessageView.as_view(), name='send_message'),

    # AI Integration Webhooks (Placeholders)
    path('sessions/<uuid:session_id>/ai-response/', AIResponseWebhookView.as_view(), name='ai_response_webhook'),

    # Study plan
    path('plan/generate/', GenerateStudyPlanView.as_view(), name='generate_plan'),

    # Essay grading
    path('grade/', GradeEssayView.as_view(), name='grade_essay'),

    # Audio / video generation
    path('audio/generate/', GenerateAudioView.as_view(), name='generate_audio'),
    path('video/generate/', GenerateVideoView.as_view(), name='generate_video'),

    # Vocabulary
    path('vocab/generate/', GenerateVocabView.as_view(), name='generate_vocab'),

    # Analytics
    path('analytics/', AnalyticsView.as_view(), name='analytics'),

    # Exports
    path('export/db/', DownloadDatabaseView.as_view(), name='export_db'),
    path('export/history/', DownloadHistoryView.as_view(), name='export_history'),
]