import uuid
from django.db import models
from django.conf import settings
from files.models import UploadedFile


class ChatSession(models.Model):
    """
    Represents one complete conversation between a user and the AI.
    Every conversation is isolated in its own session.
    The session ID is auto-generated (UUID) and sent to the frontend on creation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Auto-generated from first message, or set by the user."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-last_activity_at']
        verbose_name = 'Chat Session'
        verbose_name_plural = 'Chat Sessions'

    def __str__(self):
        return f"Session {self.id} — {self.user.email}"

    def update_activity(self):
        """Call this whenever a new message is added to keep last_activity_at fresh."""
        self.save(update_fields=['last_activity_at'])


class ChatMessage(models.Model):
    """
    A single message within a ChatSession.
    Can be sent by the user or the AI. May optionally include a file attachment.
    """
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
        ('system', 'System'),
    ]

    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('ai_response', 'AI Response'),
        ('ai_summary', 'AI Summary'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField(blank=True, default='')

    # Optional file attachment
    attached_file = models.ForeignKey(
        UploadedFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_messages'
    )

    # Metadata
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"[{self.sender}] {self.content[:50]}"
