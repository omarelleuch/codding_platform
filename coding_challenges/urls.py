from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login_view'),
    path('signup/', views.signup, name='signup'),
    path('challenges/', views.challenges, name='challenges'),
    path('challenges/<int:challenge_id>/attempt/', views.attempt_challenge, name='attempt_challenge'),
    path('challenges/<int:challenge_id>/attempt/execute_code/', views.execute_code, name='execute_code'),

]