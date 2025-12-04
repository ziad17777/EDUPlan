from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Student, Subject

# API 1: register a new user
@api_view(['POST'])
def register(request):
  
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    available_time = request.data.get('available_time')
    goals = request.data.get('goals')
    
    # check required fields
    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # create user
    user = User.objects.create_user(
        username=username, 
        password=password, 
        email=email
    )
    
    # create student profile
    student = Student.objects.create(
        user=user,
        available_time=available_time,
        goals=goals
    )
    
 
    return Response({
        'message': 'registration successful',
        'student_id': student.id,
        'username': user.username
    })

# API 2: login user
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # check user
    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({
            'message': 'login successful',  
            'user_id': user.id,
            'username': user.username
        })
    else:
        return Response({
            'error': 'username or password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

# API 3: add subject for a student
@api_view(['POST'])
def add_subject(request):
    student_id = request.data.get('student_id')
    name = request.data.get('name')
    hours_needed = request.data.get('hours_needed')
    priority = request.data.get('priority', 1)
    
    try:
        # search student
        student = Student.objects.get(id=student_id)
        
        # add subject
        subject = Subject.objects.create(
            student=student,
            name=name,
            hours_needed=hours_needed,
            priority=priority
        )
        
        return Response({
            'message': f' subject {name} added successfully',
            'subject_id': subject.id
        })
        
    except Student.DoesNotExist:
        return Response({
            'error': 'student not found'
        }, status=status.HTTP_404_NOT_FOUND)

# API 4: show subjects for a student
@api_view(['GET'])
def get_subjects(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        subjects = Subject.objects.filter(student=student)
        
        # prepare subjects list
        subjects_list = []
        for subject in subjects:
            subjects_list.append({
                'id': subject.id,
                'name': subject.name,
                'hours_per_week': subject.hours_needed,
                'priority': subject.priority
            })
        
        return Response({
            'student_name': student.user.username,
            'subjects': subjects_list
        })
        
    except Student.DoesNotExist:
        return Response({
            'error': 'student not found'
        }, status=status.HTTP_404_NOT_FOUND)

# API 5:to make a study plan
@api_view(['POST'])
def create_study_plan(request):
    student_id = request.data.get('student_id')
    
    try:
        student = Student.objects.get(id=student_id)
        subjects = Subject.objects.filter(student=student)
        
        # study plan 
        plan = []
        total_time = student.available_time
        
        for subject in subjects:
            # calculate time allocation based on priority
            subject_time = (subject.priority / 10) * total_time
            
            plan.append({
                'subject_name': subject.name,
                'daily_minutes': int(subject_time),
                'priority_level': subject.priority
            })
        
        return Response({
            'student': student.user.username,
            'available_minutes_daily': total_time,
            'study_plan': plan
        })
        
    except Student.DoesNotExist:
        return Response({
            'error': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)