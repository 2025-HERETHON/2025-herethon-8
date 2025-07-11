from rest_framework import serializers
from .models import Report

from rest_framework import serializers
from .models import Report, ReportPhoto

# ReportPhoto
class ReportPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportPhoto
        fields = ['id', 'image']

# Report
class ReportSerializer(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()
    photos = ReportPhotoSerializer(many=True, read_only=True)  # related_name='photos' 사용

    class Meta:
        model = Report
        fields = ['id', 'user', 'nickname', 'title', 'content', 'address',
                  'category', 'photos', 'status', 'created_at']
        read_only_fields = ['user']

    def get_nickname(self, obj):
        return getattr(obj.user, 'nickname', None)