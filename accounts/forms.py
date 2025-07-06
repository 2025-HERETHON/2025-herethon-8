from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.contrib.auth import get_user_model

class SignUpForm(UserCreationForm):
    
    class Meta:
        model=get_user_model()
        fields=['username','email','nickname']
        
User = get_user_model()

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'nickname','profile_image']  # username = 아이디

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.exclude(pk=self.instance.pk).filter(username=username).exists():
            raise forms.ValidationError("이미 사용 중인 아이디입니다.")
        return username

    def clean_nickname(self):
        nickname = self.cleaned_data['nickname']
        if User.objects.exclude(pk=self.instance.pk).filter(nickname=nickname).exists():
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname