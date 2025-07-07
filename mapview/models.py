from django.db import models

class CriminalLocation(models.Model):
    roadNmZip = models.CharField(max_length=10)  # 우편번호
    ctpvNm = models.CharField(max_length=20)     # 시/도
    sggNm = models.CharField(max_length=20)      # 시/군/구
    roadNm = models.CharField(max_length=100)    # 도로명
