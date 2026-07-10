from django.urls import path
from . import views
urlpatterns = [path('itinerary/', views.generate_itinerary, name='ai_itinerary')]
