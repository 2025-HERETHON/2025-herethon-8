from django.urls import path
from reports import views
from .views import *
from .api_views import ReportListAPI, ReportDetailAPI, ReportCreateAPI

app_name="reports"

urlpatterns = [

    
    #path('', views.report_list_view, name='report_list'),
    #path('create/', views.report_create_view, name='report_create'),
    #path('<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    #path('<int:pk>/delete/', views.ReportDeleteView.as_view(), name='report_delete'),  
    
    #REST API
    path('', ReportListAPI.as_view(), name='report_list_api'),
    path('<int:pk>/', ReportDetailAPI.as_view(), name='report_detail_api'),
    path('create/', ReportCreateAPI.as_view(), name='report_create_api'),
]
