from django.contrib.auth import login, authenticate
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Challenge

def home(request):
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Redirect after successful signup
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            # Redirect after successful login
            return redirect('/')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def challenges(request):
    challenges = Challenge.objects.all()  # Retrieve all challenges from the database
    return render(request, 'challenges.html', {'challenges': challenges})

def attempt_challenge(request, challenge_id):
    challenge = get_object_or_404(Challenge, question_id=challenge_id)
    return render(request, 'attempt_challenge.html', {'challenge': challenge})
