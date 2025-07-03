from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)    
    title = models.CharField(max_length=200)
    content = models.TextField()
    photo = models.ImageField(verbose_name="사진",
                              blank=True, null=True, upload_to='post_photo')
    created_at = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(
            settings.AUTH_USER_MODEL,
            related_name='liked_posts',
            blank=True,
        )
    views = models.PositiveIntegerField(default=0)

    def like_count(self):
        return self.likes.count()
    
    def __str__(self):
        return self.title
    

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_anonymous = models.BooleanField(default=False)

    #답댓글 기능을 위한 부모 댓글 ID 생성
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='replies'
    )

    def __str__(self):
        return f"{self.user.nickname} - {self.content[:20]}"

