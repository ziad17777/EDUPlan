from django.contrib import admin
from .models import UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'user', 'file_type', 'file_size_mb', 'status', 'uploaded_at')
    list_filter = ('file_type', 'status')
    search_fields = ('original_filename', 'user__email')
    readonly_fields = ('id', 'uploaded_at', 'updated_at', 'file_size', 'mime_type')
    ordering = ('-uploaded_at',)
