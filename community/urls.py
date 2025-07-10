# community/urls.py
from django.urls import path
from community import views
from .views import *

app_name="community"

urlpatterns = [
    path('', views.community_list_view, name='community_list'),
    path('page/', community_template_view, name='community_template'), #FE: community.html(게시글 리스트) 템플릿 렌더링 용 
    path('post/create/', community_new_template_view, name='post_create_template'), # FE: community_new.html(게시글 작성) 템플릿 렌더링 용
    path('view/', community_view_template_view, name='community_view_tamplate'), #FE: community_view.html(상세보기) 템플릿 렌더링 용
    path('post/create/submit/', post_create_view, name='post_create_api'),  # FE: API 요청
    path('post/<int:pk>/', views.PostDetailView.as_view(), name='post_detail'),
    path('post/<int:pk>/delete/', views.PostDeleteView.as_view(), name='post_delete'),  
    path('post/<int:post_pk>/comments/', views.CommentView.as_view(), name='comment_view'),
    path('comment/<int:comment_id>/delete/', views.CommentDeleteView.as_view(), name='comment_delete'),
    path('like/<int:post_id>/',like,name="like"),
    path('post/<int:post_id>/like/ajax/', views.like_ajax, name='like_ajax'),
]
