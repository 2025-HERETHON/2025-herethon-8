from rest_framework import serializers
from .models import Post, Comment

class PostSerializer(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'nickname', 'title', 'content', 'created_at', 'like', 'views']
        read_only_fields = ['user']  
    
    def get_nickname(self, obj):
        return getattr(obj.user, 'nickname', None)
    
class CommentSerializer(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'nickname', 'content', 'created_at', 'parent', 'replies', 'is_anonymous']
        read_only_fields = ['user', 'replies', 'post']
    
    def get_nickname(self, obj):
        return getattr(obj.user, 'nickname', None)

    
    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies, many=True).data

    def validate_parent(self, value):
        if value and value.parent is not None:
            raise serializers.ValidationError("답댓글의 답댓글은 작성할 수 없습니다.")
        return value
