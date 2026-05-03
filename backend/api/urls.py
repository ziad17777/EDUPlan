from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),

    # Files
    path('files/', views.FileUploadView.as_view()),

    # Chat
    path('chat/sessions/', views.ChatSessionListView.as_view()),
    path('chat/sessions/<int:session_id>/messages/', views.ChatMessageView.as_view()),
]