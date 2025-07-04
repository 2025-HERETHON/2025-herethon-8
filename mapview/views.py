from django.shortcuts import render

#메인 페이지 렌더링
def mainmap(request):
    return render(request, 'mapview/mainmap.html')