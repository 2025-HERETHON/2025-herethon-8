from django.db import models
from django.conf import settings

class Report(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)    
    title = models.CharField(max_length=200)
    content = models.TextField()
    latitude = models.FloatField()   # 위도
    longitude = models.FloatField()  # 경도

    CATEGORY_CHOICES = [
        ('0', '성추행/성폭력'),
        ('1', '스토킹'),
        ('2', '인적 드문 곳'),
        ('3', '기타 위험'),
    ]
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    
    STATUS_CHOICES = (
        (0, '검토중'),
        (1, '승인'),
        (2, '반려'),
    )
    status = models.IntegerField(choices=STATUS_CHOICES, default=0, verbose_name="report_status")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
        
class ReportPhoto(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='report_photo/')

    def __str__(self):
        return f"{self.report.title} - report_photo"
