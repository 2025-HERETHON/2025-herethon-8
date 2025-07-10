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
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import HttpResponse

def signup(request):
    if request.method=="GET":
        form=SignUpForm()
        return render(request,"frontend/pages/signup.html",{'form':form}) #FE: 템플릿 경로 변경

    form=SignUpForm(request.POST)
    if form.is_valid():
        user=form.save() #FE: api 오류 확인
        user.nickname = form.cleaned_data.get("nickname", "")  # FE: nickname 수동 저장
        return JsonResponse({
            "status": "ok",
            "redirect_url": "/accounts/page/login/"  # FE: FE templages 경로/ json응답 변경
        })
    else:
        print("폼 유효성 실패:", form.errors) #FE api 오류 확인
        return JsonResponse({
        "status": "fail",
        "errors": form.errors
        }, status=400)
    # render(request,'accounts/signup.html',{'form':form})

#FE: 회원가입 페이지 이동 경로 추가
def signup_page_view(request):
    return render(request, 'frontend/pages/signup.html')
# FE: 로그인 페이지 이동 경로 추가
def login_page_view(request):
    return render(request, 'frontend/pages/login.html')

def login(request):
    if request.method=="GET":
        return render(request,"accounts/login.html",{"form":AuthenticationForm()})
    
    form=AuthenticationForm(request,request.POST)
    if form.is_valid():
        auth_login(request,form.user_cache)
        return JsonResponse({"status": "ok",
                             "redirect_url": "/frontend/pages/map.html"}) #FE: 페이지 연결 
    return JsonResponse({"status": "fail", "errors": form.errors}, status=400) # FE: html 응답으로 했더니 브라우저에서 오류로 인식

def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return JsonResponse({"status": "ok",
                             "redirect_url": "/frontend/pages/map.html"})

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

#로그인 완료 후에도 로그인 버튼이 있는게 이상하여 ~님으로 변경하고자 해당 코드를 삽입했습니다!
@login_required
def user_info_view(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'nickname': getattr(user, 'nickname', ''),
        'is_authenticated': True
    })

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

#FE: 쿠키 토큰 안와서 코드 추가
@ensure_csrf_cookie
def csrf_token_view(request):
   return HttpResponse("<html><body>csrf set</body></html>")