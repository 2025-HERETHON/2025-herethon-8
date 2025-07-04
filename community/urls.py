# community/urls.py
from django.urls import path
from community import views
from .views import *

app_name="community"

urlpatterns = [
    path('', views.community_list_view, name='community_list'),
    path('post/create/', views.post_create_view, name='post_create'),
    path('post/<int:pk>/edit/', views.PostDetailView.as_view(), name='post_edit'),  
    path('post/<int:pk>/delete/', views.PostDeleteView.as_view(), name='post_delete'),  
    path('post/<int:post_pk>/comments/', views.CommentView.as_view(), name='comment_view'),
    path('comment/<int:comment_id>/delete/', views.CommentDeleteView.as_view(), name='comment_delete'),
    path('post/<int:pk>/', views.PostDetailView.as_view(), name='post_detail'),
    path('like/<int:post_id>/',like,name="like"),
]
