from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mapview.urls')),  # 루트 경로 처리
    path('accounts/', include('accounts.full_urls')),  # 커스텀 + 소셜 로그인 통합
    path('community/',include('community.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

