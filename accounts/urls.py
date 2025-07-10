from django.urls import path
from .views import *

app_name="accounts"

urlpatterns = [
    path('signup/',signup,name='signup'),
    path('login/',login,name='login'),
    path('logout/',logout,name="logout"),
    path('api/user/', user_info_view, name='user_info'),
    path("",mypage,name="mypage"),
    path('mypost/',mypost,name="mypost"),
    path('myreport/',myreport,name="myreport"),
    path('delete/', delete_account, name='delete_account'),
    path('edit/', profile_edit, name='profile_edit'),
    path('terms/', terms_of_service_view, name='terms_of_service'),
    path('privacy/', privacy_policy_view, name='privacy_policy'),
    path('csrf/', csrf_token_view, name='csrf_token'),
    path('accounts/signup/', signup_page_view, name='signup_page'),
    path('page/login/', login_page_view, name='login_page'),       # FE 템플릿용
    path('page/signup/', signup_page_view, name='signup_page'),    # FE 템플릿용
]
