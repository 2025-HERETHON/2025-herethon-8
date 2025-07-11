from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.views import View
from django.db import models
from django.http import JsonResponse

from .models import Report, ReportPhoto
from .forms import ReportForm

#FE: 제보하기 렌더링 추가 
def report_page_view(request):
        reports = Report.objects.all().order_by('-created_at')
        print("현재 로그인한 유저:", request.user.username)
        print("현재 유저 is_staff?:", request.user.is_staff)
        print("렌더링할 제보 수:", reports.count())
        return render(request, 'frontend/pages/report.html', {'reports': reports})

# 제보 리스트 조회
@login_required
def report_list_view(request):
    if request.user.is_staff:
        reports = Report.objects.all().order_by('-created_at')
    else:
        reports = Report.objects.filter(
            models.Q(status=1) | models.Q(user=request.user)
        ).order_by('-created_at')

    return render(request, 'frontend/pages/report.html', {'reports': reports})

@login_required
def report_create_view(request):
    if request.method == "POST":
        form = ReportForm(request.POST, request.FILES)

        # 유효성 검사 수행
        if form.is_valid():
            report = form.save(commit=False)
            report.user = request.user
            report.save()
            print("저장된 글 ID:", report.pk)  # FE: 테스트 확인용
            print("저장된 글 상태(status):", report.status)
            print("report.id:", report.id)
            print("FILES 전체:", request.FILES)
            print("FILES[photos]:", request.FILES.getlist('photos'))

            # 여러 이미지 저장 처리
            for image in request.FILES.getlist('photos'):
                ReportPhoto.objects.create(report=report, image=image)
                print("저장된 이미지:", image)

            # 요청이 AJAX일 경우 JSON 응답
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'message': '제보가 등록되었습니다.',
                    'report_id': report.pk,
                    'title': report.title,
                    'content': report.content,
                    'address': report.address,
                }, status=201)
            
            # 일반 요청이면 페이지 이동
            return redirect('/reports/page/?latest=true')

        else:
            # 유효성 검사 실패 시 에러 로그 출력
            print("폼 유효성 검사 실패:")
            print(form.errors)  # 어떤 필드에서 어떤 문제가 있는지 확인

            # 필요시 JSON으로도 반환 가능
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    'message': '입력값 검증에 실패했습니다.',
                    'errors': form.errors,
                }, status=400)

    # GET 요청 또는 실패 시 폼 재렌더링
    form = ReportForm()
    return render(request, 'frontend/pages/report.html', {'form': form})

# 제보 상세
@method_decorator(login_required, name='dispatch')
class ReportDetailView(View):
    # 제보 상세 조회
    def get(self, request, pk):
        report = get_object_or_404(Report, pk=pk)

        #승인되지 않은 제보(0: 검토중, 2: 반려)는 관리자나 작성자만 접근 가능
        if report.status != 1:  # 승인된 상태가 아니라면
            if request.user != report.user and not request.user.is_staff:
                return redirect('reports:report_list')  

        form = ReportForm()

        # 쿼리 파라미터에 edit=true가 있으면 수정 폼 보여주기
        if request.GET.get('edit') == 'true' and report.user == request.user:
            form = ReportForm(instance=report)
            return render(request, 'fronted/pages/report.html', {
                'form': form,
                'report': report,
                'photos': report.photos.all(),
            })

        return render(request, 'frontend/pages/report.html', {
            'report': report,
            'form': form,
        })
    
    # 제보 수정
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)

        # 관리자X - 자신의 글만 수정 가능
        if not request.user.is_staff and report.user != request.user:
            messages.error(request, "수정 권한이 없습니다.")
            return redirect('/reports/page/?latest=true', pk=pk)
        
        # 관리자O - 상태(status)만 수정 가능
        if request.user.is_staff and not request.POST.get("title"):
            new_status = request.POST.get("status")
            if new_status is not None and new_status.isdigit():
                report.status = int(new_status)
                report.save(update_fields=["status"])
                messages.success(request, "제보 상태가 변경되었습니다.")
            else:
                messages.error(request, "올바른 상태 값을 선택해주세요.")
            return redirect('/reports/page/?latest=true', pk=pk)

        # 일반 사용자의 제보 내용 수정
        form = ReportForm(request.POST, instance=report)

        if form.is_valid():
            report = form.save()

            # 새로운 사진 업로드 처리
            for image in request.FILES.getlist('photos'):
                ReportPhoto.objects.create(report=report, image=image)

            # 기존 사진 삭제 처리
            deleted_photos = request.POST.get('delete_photos', '').split(',')  # 삭제된 사진들의 ID 리스트
            if deleted_photos:
                for photo_id in deleted_photos:
                    if photo_id:  # 비어있는 값은 처리하지 않도록 확인
                        photo = get_object_or_404(ReportPhoto, id=photo_id)
                        photo.delete()

            messages.success(request, "제보가 수정되었습니다.")
            return redirect('/reports/page/?latest=true', pk=report.pk)

        return render(request, '/reports/page/?latest=truel', {
            'form': form,
            'report': report,
        })
#제보 수정
class ReportDetailAPIView(View):
    def get(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
            data = {
                'title': report.title,
                'content': report.content,
                'address': report.address,
                'category': report.category,
                'status': report.status,
            }
            return JsonResponse(data)
        except Report.DoesNotExist:
            return JsonResponse({'error': '제보를 찾을 수 없습니다.'}, status=404)

# 제보 삭제
@method_decorator(login_required, name='dispatch')
class ReportDeleteView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk, user=request.user)
        report.delete()
        messages.success(request, "제보가 삭제되었습니다.")
        return redirect('/reports/page/?latest=true')
