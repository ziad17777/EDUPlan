from django.contrib import admin
from .models import ChatSession, ChatMessage


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'last_activity_at')
    search_fields = ('user__email', 'title')
    ordering = ('-last_activity_at',)
    readonly_fields = ('id', 'created_at', 'last_activity_at')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender', 'message_type', 'content_preview', 'created_at')
    list_filter = ('sender', 'message_type')
    search_fields = ('content', 'session__user__email')
    readonly_fields = ('id', 'created_at')

    def content_preview(self, obj):
        return obj.content[:60] + '...' if len(obj.content) > 60 else obj.content
    content_preview.short_description = 'Content'
