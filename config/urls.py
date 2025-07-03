from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import hometest

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', hometest),  # 루트 경로 처리
    path('accounts/',include('accounts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
