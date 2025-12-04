from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    available_time = models.IntegerField(help_text="daily available study time in minutes")
    goals = models.TextField(help_text="study goals of the student")
    
    def __str__(self):
        return self.user.username

class Subject(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    hours_needed = models.IntegerField(help_text="weekly study hours  ")
    priority = models.IntegerField(default=1, help_text=" priority level from 1 to 5 ")
    
    def __str__(self):
        return self.name