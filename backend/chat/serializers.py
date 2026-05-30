from rest_framework import serializers
from .models import ChatSession, ChatMessage
from files.serializers import UploadedFileSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    attached_file = UploadedFileSerializer(read_only=True)
    attached_file_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender', 'message_type', 'content',
            'attached_file', 'attached_file_id',
            'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at']


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing all sessions."""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'title', 'message_count',
            'last_message', 'created_at', 'last_activity_at'
        ]

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'sender': last.sender,
                'content': last.content[:100],
                'created_at': last.created_at
            }
        return None


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Full serializer including all messages for a session."""
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = [
            'id', 'title', 'message_count',
            'messages', 'created_at', 'last_activity_at'
        ]

    def get_message_count(self, obj):
        return obj.messages.count()


class SendMessageSerializer(serializers.Serializer):
    """Validates incoming user message payload."""
    content = serializers.CharField(required=False, allow_blank=True, default='')
    attached_file_id = serializers.UUIDField(required=False, allow_null=True)
    session_id = serializers.UUIDField(required=False, allow_null=True,
                                        help_text="Optional. If not provided, a new session is created.")

    def validate(self, attrs):
        if not attrs.get('content') and not attrs.get('attached_file_id'):
            raise serializers.ValidationError(
                'A message must contain either text content or a file attachment.'
            )
        return attrs


class AIResponseWebhookSerializer(serializers.Serializer):
    """
    Used by the AI service to deliver its response back.
    The AI team calls: POST /api/chat/sessions/<session_id>/ai-response/
    """
    session_id = serializers.UUIDField()
    content = serializers.CharField()
    message_type = serializers.ChoiceField(
        choices=['ai_response', 'ai_summary'],
        default='ai_response'
    )
