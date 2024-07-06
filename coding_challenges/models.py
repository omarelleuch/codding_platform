from django.db import models
from django.contrib.auth.models import User

class Challenge(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    difficulty = models.CharField(max_length=20)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
