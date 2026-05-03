from django.db import models
from django.contrib.auth.models import User

class UploadedFile(models.Model):
    FILE_TYPES = [('pdf', 'PDF'), ('docx', 'Word'), ('pptx', 'PowerPoint')]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.original_name}"


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default='New Chat')
    created_at = models.DateTimeField(auto_now_add=True)


class ChatMessage(models.Model):
    ROLE_CHOICES = [('user', 'User'), ('ai', 'AI')]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    file = models.ForeignKey(UploadedFile, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)