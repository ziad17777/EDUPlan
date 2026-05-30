import os
from django.conf import settings
from rest_framework.exceptions import ValidationError


def validate_uploaded_file(file):
    """
    Validates file by extension and size.
    
    Extension-based validation is used here for simplicity and portability.
    In production, add MIME type sniffing using python-magic for stronger security.
    """
    # 1. Size check
    if file.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ValidationError(
            f"File size exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB limit. "
            f"Your file is {round(file.size / (1024*1024), 2)}MB."
        )

    # 2. Extension check
    filename = file.name
    if '.' not in filename:
        raise ValidationError("File must have an extension.")

    ext = filename.rsplit('.', 1)[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"File type '.{ext}' is not allowed. "
            f"Accepted types: {', '.join(settings.ALLOWED_EXTENSIONS)}."
        )

    return ext


def get_mime_type_from_extension(ext):
    """Map extension to MIME type for metadata storage."""
    mapping = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv': 'text/csv',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
    }
    return mapping.get(ext, 'application/octet-stream')
