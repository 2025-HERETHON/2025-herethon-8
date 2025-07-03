from django.shortcuts import render,redirect
from .forms import SignUpForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
#from blog.models import Post

def signup(request):
    if request.method=="GET":
        form=SignUpForm()
        return render(request,"accounts/signup.html",{'form':form})

    form=SignUpForm(request.POST)
    if form.is_valid():
        form.save()
        return redirect('accounts:hometest')
    else:
        return render(request,'accounts/signup.html',{'form':form})

def login(request):
    if request.method=="GET":
        return render(request,"accounts/login.html",{"form":AuthenticationForm()})
    
    form=AuthenticationForm(request,request.POST)
    if form.is_valid():
        auth_login(request,form.user_cache)
        return redirect('accounts:hometest')
    return render(request,'accounts/login.html',{'form':form})

def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    return redirect('accounts:hometest')

def mypage(request):
    if request.method=="POST":
        profile_image=request.FILES.get('profile_image')
        if profile_image:
            request.user.profile_image.delete()
            request.user.profile_image=profile_image
            request.user.save()
    return render(request,'accounts/mypage.html')

def myblog(request):
    #Todo: 게시글 연결
    #posts=request.user.posts.all().order_by('-id')
    #posts = Post.objects.filter(author=request.user).order_by('-id')
    
    #{"posts":posts}
    return render(request,"accounts/mypost.html")

def myreport(request):
    #Todo: 제보 연결
    #posts=request.user.posts.all().order_by('-id')
    #posts = Post.objects.filter(author=request.user).order_by('-id')
    
    #{"posts":posts}
    return render(request,"accounts/myreport.html")



#테스트용 페이지 렌더링
def hometest(request):
    return render(request, 'accounts/hometest.html')