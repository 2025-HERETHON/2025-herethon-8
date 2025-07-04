from django.urls import path, include
from .views import mainmap

app_name = 'mapview'

urlpatterns = [
    path('', mainmap, name='mainmap'),               # mapview 메인페이지
    path('accounts/', include('accounts.urls')),    
    path('community/', include('community.urls')), 
]