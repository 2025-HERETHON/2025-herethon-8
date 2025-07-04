from django.urls import path
from .views import *

app_name="accounts"

urlpatterns = [
    path('signup/',signup,name='signup'),
    path('login/',login,name='login'),
    path('logout/',logout,name="logout"),
    path("",mypage,name="mypage"),
    path('mypost/',mypost,name="mypost"),
    path('myreport/',myreport,name="myreport"),
    path('delete/', delete_account, name='delete_account'),
]
