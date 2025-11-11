from django.urls import path
from . import views

urlpatterns = [
    # API to register a new user
    path('register/', views.register, name='register'),
    
    # API to login
    path('login/', views.login_user, name='login'),
    
    # API to add a subject for a student
    path('subjects/add/', views.add_subject, name='add-subject'),
    
    # API to get subjects for a student
    path('subjects/<int:student_id>/', views.get_subjects, name='get-subjects'),
    
    # API to makee a study plan
    path('plan/create/', views.create_study_plan, name='create-plan'),
]