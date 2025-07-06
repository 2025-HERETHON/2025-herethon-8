from django.shortcuts import render,redirect
from .forms import SignUpForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from community.models import Post
from reports.models import Report
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserUpdateForm
import os
from django.conf import settings



def signup(request):
    if request.method=="GET":
        form=SignUpForm()
        return render(request,"accounts/signup.html",{'form':form})

    form=SignUpForm(request.POST)
    if form.is_valid():
        form.save()
        return redirect('mapview:mainmap')
    else:
        return render(request,'accounts/signup.html',{'form':form})

def login(request):
    if request.method=="GET":
        return render(request,"accounts/login.html",{"form":AuthenticationForm()})
    
    form=AuthenticationForm(request,request.POST)
    if form.is_valid():
        auth_login(request,form.user_cache)
        return redirect('mapview:mainmap')
    return render(request,'accounts/login.html',{'form':form})

def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return redirect('mapview:mainmap')

def mypage(request):
    if request.method=="POST":
        profile_image=request.FILES.get('profile_image')
        if profile_image:
            request.user.profile_image.delete()
            request.user.profile_image=profile_image
            request.user.save()
    return render(request,'accounts/mypage.html')

def mypost(request):
    posts = Post.objects.filter(user=request.user).order_by('-id')
    
    return render(request,"accounts/mypost.html",{"posts":posts})

def myreport(request):
    reports = Report.objects.filter(user=request.user).order_by('-id')
    
    return render(request,"accounts/myreport.html",{'reports':reports})

@login_required
def delete_account(request):
    if request.method == "POST":
        user = request.user
        user.delete()
        logout(request)
        messages.success(request, "회원 탈퇴가 완료되었습니다.")
        return redirect('mapview:mainmap')
    
    
@login_required
def profile_edit(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('accounts:mypage')
    else:
        form = UserUpdateForm(instance=request.user)
    return render(request, 'accounts/profile_edit.html', {'form': form})



#메인 페이지 렌더링
def mainmap(request):
    return render(request, 'mapview/mainmap.html')

#서비스 이용약관/개인정보처리방침
def terms_of_service_view(request):
    file_path = os.path.join(settings.BASE_DIR, 'policies', 'terms_of_service.txt')
    with open(file_path, encoding='utf-8') as f:
        content = f.read()
    return render(request, 'accounts/terms/terms_page.html', {'title': '서비스 이용약관', 'content': content})


def privacy_policy_view(request):
    file_path = os.path.join(settings.BASE_DIR, 'policies', 'privacy_policy.txt')
    with open(file_path, encoding='utf-8') as f:
        content = f.read()
    return render(request, 'accounts/terms/terms_page.html', {'title': '개인정보처리방침', 'content': content})
