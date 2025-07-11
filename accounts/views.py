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
import time

#회원가입
def signup(request):
    if request.method=="GET":
        form=SignUpForm()
        return render(request,"frontend/pages/signup.html",{'form':form}) #FE: 템플릿 경로 변경

    form=SignUpForm(request.POST)
    if form.is_valid():
        user=form.save() 
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

#회원 탈퇴
@login_required
def delete_account(request):
    if request.method == "POST":
        user = request.user
        user.delete()
        logout(request)
        messages.success(request, "회원 탈퇴가 완료되었습니다.")
        return redirect('/map/')
    
#FE: 회원가입 페이지 렌더링 추가
def signup_page_view(request):
    return render(request, 'frontend/pages/signup.html')
# FE: 로그인 페이지 렌더링 추가
def login_page_view(request):
    return render(request, 'frontend/pages/login.html')

# FE: 마이 페이지 렌더링 추가
@login_required
def my_page_view(request):
    user = request.user

    profile_image_url = (
        f"{user.profile_image.url}?t={int(time.time())}"
        if user.profile_image else '/static/img/user.png'
    )

    context = {
        'profile_image_url': profile_image_url,
        'nickname': user.nickname,
        'email': user.email,
        'post_count': Post.objects.filter(user=user).count(),
        'report_count': Report.objects.filter(user=user).count(),
    }
    return render(request, 'frontend/pages/mypage.html', context)

#FE: 마이 페이지_제보글 렌더링 추가
def myreport_page_view(request):
    return render(request, 'frontend/pages/myreport.html')
#FE: 마이 페이지_게시글 렌더링 추가
def mypost_page_view(request):
    return render(request, 'frontend/pages/mypost.html')

#FE: 이용약관 랜더링 추가 
def terms_page_view(request):
    return render(request, 'frontend/pages/terms.html')

#FE: 개인정보 랜더링 추가 
def policy_page_view(request):
    return render(request, 'frontend/pages/policy.html')

#로그인
def login(request):
    if request.method=="GET":
        return render(request,"accounts/login.html",{"form":AuthenticationForm()})
    form=AuthenticationForm(request,request.POST)
    if form.is_valid():
        auth_login(request,form.user_cache)
        return JsonResponse({"status": "ok",
                             "redirect_url": "/frontend/pages/map.html"}) #FE: 페이지 연결 
    return JsonResponse({"status": "fail", "errors": form.errors}, status=400) # FE: html 응답으로 했더니 브라우저에서 오류로 인식

#로그아웃
def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return JsonResponse({"status": "ok",
                             "redirect_url": "/frontend/pages/map.html"})

#나의 페이지
# def mypage(request):
#     if request.method=="POST":
#         profile_image=request.FILES.get('profile_image')
#         if profile_image:
#             request.user.profile_image.delete()
#             request.user.profile_image=profile_image
#             request.user.save()
#     return render(request,'/accounts/page/mypage/')


def mypost(request):
    posts = Post.objects.filter(user=request.user).order_by('-id')
    
    return render(request,"fronted/page/mypost.html",{"posts":posts})

def myreport(request):
    reports = Report.objects.filter(user=request.user).order_by('-id')
    
    return render(request,"accounts/myreport.html",{'reports':reports})


    
#프로필 수정
@login_required
def profile_edit(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            user = form.save()
            return JsonResponse({
                "status": "ok",
                "nickname": user.nickname,
                "username": user.username,
            })
        else:
            return JsonResponse({
                "status": "error",
                "errors": form.errors,
            }, status=400)
    return JsonResponse({"status": "error", "message": "잘못된 요청"}, status=400)


# FE: 로그인 여부 확인 
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

#서비스 이용약관/개인정보처리방침 :응답 부분 json으로만 변경했어요!
def terms_of_service_view(request):
    file_path = os.path.join(settings.BASE_DIR, 'policies', 'terms_of_service.txt')
    with open(file_path, encoding='utf-8') as f:
        content = f.read()
    return JsonResponse({
        'title': '서비스 이용약관',
        'content': content
    })


def privacy_policy_view(request):
    file_path = os.path.join(settings.BASE_DIR, 'policies', 'privacy_policy.txt')
    with open(file_path, encoding='utf-8') as f:
        content = f.read()
    return JsonResponse({
        'title': '개인정보처리방침',
        'content': content
    })

#FE: 쿠키 토큰 안와서 코드 추가
@ensure_csrf_cookie
def csrf_token_view(request):
   return HttpResponse("<html><body>csrf set</body></html>")
