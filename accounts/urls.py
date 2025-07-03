from django.urls import path
from .views import *

app_name="accounts"

urlpatterns = [
    path('signup/',signup,name='signup'),
    path('login/',login,name='login'),
    path('logout/',logout,name="logout"),
    path("",mypage,name="mypage"),
    path('myblog/',myblog,name="myblog"),
    path('myreport/',myreport,name="myreport"),
    path('hometest/', hometest, name='hometest'),
]
