from rest_framework import generics
from .models import Report
from .serializers import ReportSerializer

# 📋 목록 조회 (GET /reports/)
class ReportListAPI(generics.ListAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer

# 🔍 상세 조회 (GET /reports/<pk>/)
class ReportDetailAPI(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

# 📝 작성 (POST /reports/create/)
class ReportCreateAPI(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
