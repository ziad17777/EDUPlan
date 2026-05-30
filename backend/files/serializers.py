from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.ReadOnlyField()

    class Meta:
        model = UploadedFile
        fields = [
            'id', 'original_filename', 'file_url', 'file_type',
            'mime_type', 'file_size', 'file_size_mb', 'status',
            'ai_summary', 'ai_processed_at', 'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'updated_at', 'ai_summary', 'ai_processed_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class AISummaryWebhookSerializer(serializers.Serializer):
    """
    Used by the AI service to POST the summary back to our backend.
    The AI team calls: POST /api/files/<file_id>/ai-summary/
    """
    file_id = serializers.UUIDField()
    summary = serializers.CharField()
    status = serializers.ChoiceField(choices=['processed', 'failed'])
