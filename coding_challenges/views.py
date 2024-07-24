from django.contrib.auth import login as auth_login, authenticate
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Challenge
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import http.client


def home(request):
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)  # Log in the user after successful signup
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def login_view(request):  # Renamed to avoid conflict
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)  # Log in the user after successful login
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


@csrf_exempt
def execute_code(request, challenge_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            code = data.get('code')
            language_id = data.get('language_id')

            challenge = get_object_or_404(Challenge, question_id=challenge_id)
            test_cases = challenge.test_cases

            results = []

            for test_case in test_cases:
                input_data = test_case['input']
                expected_output = test_case['output']

                conn = http.client.HTTPSConnection("judge0-ce.p.rapidapi.com")

                payload = json.dumps({
                    "source_code": code,
                    "language_id": language_id,
                    "stdin": input_data
                })

                headers = {
                    'x-rapidapi-key': "1637d65cfdmshe6ac80fc81e85e8p1d29ebjsn960137744dd4",
                    'x-rapidapi-host': "judge0-ce.p.rapidapi.com",
                    'Content-Type': "application/json"
                }

                conn.request("POST", "/submissions?base64_encoded=true&wait=false&fields=*", payload, headers)
                response = conn.getresponse()
                response_data = response.read().decode("utf-8")
                conn.close()

                result = json.loads(response_data)
                actual_output = result.get('stdout', '').strip()
                if not actual_output:
                    actual_output = result.get('stderr', '').strip()

                passed = actual_output == expected_output

                results.append({
                    'input': input_data,
                    'expected_output': expected_output,
                    'actual_output': actual_output,
                    'passed': passed
                })

            all_passed = all(result['passed'] for result in results)
            print("Response data:", response_data)
            
            return JsonResponse({'results': results, 'all_passed': all_passed})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)