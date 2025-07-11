from django.urls import path
from .views import *

app_name="accounts"

urlpatterns = [
# 계정 API
path('signup/', signup, name='signup'),
path('login/', login, name='login'),
path('logout/', logout, name="logout"),
path('delete/', delete_account, name='delete_account'),
path('edit/', profile_edit, name='profile_edit'),
path('api/user/', user_info_view, name='user_info'),

# FE 템플릿 렌더링
path('page/mypage/', my_page_view, name='mypage'),
path('page/mypost/', mypost_page_view, name='mypost_page'),
path('page/myreport/', myreport_page_view, name='myreport_page'),
path('page/login/', login_page_view, name='login_page'),
path('page/signup/', signup_page_view, name='signup_page'),
path('page/terms/', terms_page_view, name='terms_page'),      
path('page/policy/', policy_page_view, name='policy_page'),

# 약관/개인정보 페이지
path('terms/', terms_of_service_view, name='terms_of_service'),
path('privacy/', privacy_policy_view, name='privacy_policy'),

# 기타
path('csrf/', csrf_token_view, name='csrf_token'),

]
