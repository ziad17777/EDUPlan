from django.urls import path
from .views import (
    ChatSessionListView, CreateChatSessionView,
    ChatSessionDetailView, DeleteChatSessionView,
    ChatHistoryView, AttachFileToChatView,
    SendMessageView, AIResponseWebhookView
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
]
