import uuid
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import (
    RegisterSerializer, UserProfileSerializer, UpdateProfileSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, ProfilePictureSerializer
)


class RegisterView(APIView):
    """POST /api/auth/register/ — Create a new user account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — Authenticate and return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Augment with user profile data
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(response.data['access'])
            user = User.objects.get(id=token['user_id'])
            response.data['user'] = UserProfileSerializer(user, context={'request': request}).data
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """GET /api/auth/profile/ — Retrieve authenticated user profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class UpdateProfileView(APIView):
    """PATCH /api/auth/profile/update/ — Update first_name and last_name."""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully.',
                'user': UserProfileSerializer(request.user, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadProfilePictureView(APIView):
    """POST /api/auth/profile/picture/ — Upload or replace profile picture."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ProfilePictureSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            # Delete old picture file from disk before saving new one
            user = request.user
            if user.profile_picture:
                user.profile_picture.delete(save=False)
            serializer.save()
            return Response({
                'message': 'Profile picture updated.',
                'user': UserProfileSerializer(user, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteProfilePictureView(APIView):
    """DELETE /api/auth/profile/picture/ — Remove profile picture."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if not user.profile_picture:
            return Response({'error': 'No profile picture to delete.'}, status=status.HTTP_404_NOT_FOUND)
        user.profile_picture.delete(save=False)
        user.profile_picture = None
        user.save()
        return Response({'message': 'Profile picture deleted.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — Change password while authenticated."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/ — Request a password reset token.
    
    NOTE: In production, this would send an email with the reset link.
    Here we return the token directly for development/testing purposes only.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = str(uuid.uuid4())
                user.password_reset_token = token
                user.password_reset_token_created_at = timezone.now()
                user.save()
                # TODO: Send email with token in production
                return Response({
                    'message': 'Password reset token generated. In production, this would be emailed.',
                    'dev_token': token  # REMOVE in production
                })
            except User.DoesNotExist:
                # Security: Don't reveal whether the email exists
                return Response({'message': 'If the email exists, a reset link has been sent.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset/confirm/ — Reset password using token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            try:
                user = User.objects.get(password_reset_token=token)
                # Token expiry: 1 hour
                token_age = timezone.now() - user.password_reset_token_created_at
                if token_age.total_seconds() > 3600:
                    return Response({'error': 'Reset token has expired.'}, status=status.HTTP_400_BAD_REQUEST)
                user.set_password(serializer.validated_data['new_password'])
                user.password_reset_token = None
                user.password_reset_token_created_at = None
                user.save()
                return Response({'message': 'Password reset successfully.'})
            except User.DoesNotExist:
                return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
