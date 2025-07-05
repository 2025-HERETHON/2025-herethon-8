from django.urls import path
from reports import views
from .views import *

app_name="reports"

urlpatterns = [
    path('', views.report_list_view, name='report_list'),
    path('create/', views.report_create_view, name='report_create'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('<int:pk>/delete/', views.ReportDeleteView.as_view(), name='report_delete'),  
]
