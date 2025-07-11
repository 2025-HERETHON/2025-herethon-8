from django.urls import path, include
from .views import *

app_name = 'mapview'

urlpatterns = [
    path('', mainmap, name='mainmap'),               # mapview 메인페이지
    path('accounts/', include('accounts.urls')),    
    path('community/', include('community.urls')), 
    path('api/criminal-locations/', get_criminal_locations, name='criminal_locations'),
    path('map/', map_page_view, name='map'), #FE: view 추가
    path('statistics/',statistics,name='criminal_statistics')
]