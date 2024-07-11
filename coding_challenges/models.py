from django.db import models
from django.contrib.auth.models import User

class Challenge(models.Model):
    question_id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    text = models.TextField()
    topic_tags = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=50)
    success_rate = models.FloatField()
    total_submission = models.IntegerField()
    total_accepted = models.IntegerField()
    likes = models.IntegerField()
    dislikes = models.IntegerField()
    hints = models.TextField(null=True, blank=True)
    similar_questions_ids = models.CharField(max_length=255, null=True, blank=True)
    similar_questions_text = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title
