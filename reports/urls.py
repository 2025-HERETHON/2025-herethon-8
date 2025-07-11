from django.urls import path
from reports import views
from .views import *

app_name="reports"

urlpatterns = [
    # FE: 제보하기 페이지 렌더링용
    path('page/', views.report_page_view, name='report_page'),
    # api용
    path('', views.report_list_view, name='report_list'),
    path('create/', views.report_create_view, name='report_create'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('<int:pk>/delete/', views.ReportDeleteView.as_view(), name='report_delete'),  
]
