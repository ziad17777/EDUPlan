import uuid
import os
from django.db import models
from django.conf import settings


def upload_to(instance, filename):
    """Store files in: media/uploads/<user_id>/<uuid>_<filename>"""
    ext = filename.rsplit('.', 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    return os.path.join('uploads', str(instance.user.id), unique_name)


class UploadedFile(models.Model):
    """
    Stores metadata for every file uploaded by a user.
    The actual file is stored on disk (or S3 in production).
    """
    FILE_STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_files'
    )
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to)
    file_type = models.CharField(max_length=10)       # e.g. 'pdf', 'docx'
    mime_type = models.CharField(max_length=100)      # e.g. 'application/pdf'
    file_size = models.PositiveBigIntegerField()      # bytes
    status = models.CharField(
        max_length=20,
        choices=FILE_STATUS_CHOICES,
        default='uploaded'
    )

    # AI integration fields — populated by the AI team's service
    ai_summary = models.TextField(null=True, blank=True)
    ai_processed_at = models.DateTimeField(null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'uploaded_files'
        ordering = ['-uploaded_at']
        verbose_name = 'Uploaded File'
        verbose_name_plural = 'Uploaded Files'

    def __str__(self):
        return f"{self.original_filename} ({self.user.email})"

    @property
    def file_size_kb(self):
        return round(self.file_size / 1024, 2)

    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)

    def delete(self, *args, **kwargs):
        """Delete actual file from disk when the record is deleted."""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
