import random
import string
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from users.models import User  # 사용자 모델

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        print("populate_user called")

        def generate_random_nickname(length=8):
            letters = string.ascii_letters + string.digits
            return 'user_' + ''.join(random.choice(letters) for _ in range(length))

        nickname = generate_random_nickname()
        count = 0

        # 중복 방지
        while User.objects.filter(nickname=nickname).exists():
            count += 1
            nickname = generate_random_nickname()

        user.nickname = nickname
        return user
