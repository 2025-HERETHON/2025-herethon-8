from django.shortcuts import render
from .models import CriminalLocation
from django.http import JsonResponse
import requests
from django.conf import settings
import urllib3
import ssl
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager

from reports.models import Report
from datetime import datetime, timedelta
from django.db.models import Count
import re
from collections import defaultdict
from django.utils.timezone import localtime

#메인 페이지 렌더링
def mainmap(request):
    return render(request, 'mapview/home.html')

#FE : FE 페이지로 렌더링 추가
def map_page_view(request):
    return render(request, 'frontend/pages/map.html')

#ssl 인증서 끄기용(테스트용, 인증서 접근 에러 때문에 임시 끄기, 보안 위험 있음)
class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        ctx = ssl.create_default_context()

        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        ctx.set_ciphers('DEFAULT@SECLEVEL=1')  # 보안 수준 낮춤

        self.poolmanager = PoolManager(
            num_pools=connections,
            maxsize=maxsize,
            block=block,
            ssl_context=ctx
        )
        
# 전역에 session 객체 생성
session = requests.Session()
session.mount('https://', TLSAdapter())

from collections import Counter

from django.shortcuts import render
from .models import CriminalLocation
from django.http import JsonResponse
import requests
from django.conf import settings
import ssl
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager

from reports.models import Report
from datetime import datetime, timedelta
from django.db.models import Count
import re
from collections import defaultdict, Counter

# 메인 페이지 렌더링
def mainmap(request):
    return render(request, 'mapview/home.html')

# FE 페이지 렌더링
def map_page_view(request):
    return render(request, 'frontend/pages/map.html')

# 통계 페이지 렌더링
def statistics(request):
    return render(request, 'mapview/statistics.html')

# SSL 인증서 끄기 (테스트용)
class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
        self.poolmanager = PoolManager(num_pools=connections, maxsize=maxsize, block=block, ssl_context=ctx)

session = requests.Session()
session.mount('https://', TLSAdapter())


# ✅ (1) 마커 표시 + 통계 리스트용 기존 단순 버전
def get_criminal_locations(request):
    service_key = settings.PUBLIC_DATA_API_KEY
    selected_types = request.GET.getlist('types')
    query = request.GET.get('query', '').strip()
    response_type = request.GET.get('type', '').lower()  # 'stats'면 통계 응답
    date_range = request.GET.get('date_range', '')
    selected_category = request.GET.get('category', '')


    print(f'[DEBUG] query="{query}", type="{response_type}"')

    api_results= []
    if 'api_notice' in selected_types:
        service_key = settings.PUBLIC_DATA_API_KEY
        query = request.GET.get('query', '').strip()
        
        print(f'[DEBUG] {query}')  # 디버그용

        sggNm = ''
        roadNm = ''

        if query:
            parts = query.split()
            if len(parts) == 1:
                # 한 단어만 입력 시, 구 이름 또는 도로명 중 하나로 처리 (예: 구 이름 우선)
                sggNm = parts[0]
            elif len(parts) >= 2:
                sggNm = parts[0]
                roadNm = ' '.join(parts[1:])

        url = 'https://apis.data.go.kr/1383000/sais/SexualAbuseNoticeAddrService/getSexualAbuseNoticeAddrList'
        params = {
            'serviceKey': service_key,
            'pageNo': 1,
            'numOfRows': 100,
            'type': 'json',
        }

        if sggNm:
            params['sggNm'] = sggNm
        if roadNm:
            params['roadNm'] = roadNm
            
        try:
            response = session.get(url, params=params, verify=False)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': f'API 요청 실패: {e}'}, status=500)


        
        data = response.json()
        items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
        if isinstance(items, dict):  # item이 하나뿐일 때 dict로 오는 경우
            items = [items]

        api_results = [{
            'ctpvNm': item.get('ctpvNm'), 
            'roadNmZip': item.get('roadNmZip'),
            'sggNm': item.get('sggNm'),
            'roadNm': item.get('roadNm'),
        } for item in items]
    
    report_results = []
    if 'user_report' in selected_types:
        reports = Report.objects.filter(status=1)

        # 주소 필터링
        if query:
            reports = reports.filter(address__icontains=query)

        # 등록일 필터링
        if date_range and date_range != "all":
            months = int(date_range)
            cutoff = datetime.now() - timedelta(days=30 * months)
            reports = reports.filter(created_at__gte=cutoff)

        # 카테고리 필터링
        if selected_category != '':
            reports = reports.filter(category=selected_category)

        report_results = [{
            'address': r.address,
            'category': r.category,
            'title': r.title,
            'content': r.content,
            'created_at': r.created_at,
        } for r in reports]

    context = {
        'selected_types': selected_types,
        'api_results': api_results,
        'report_results': report_results,
        'query': query,
        'warning_locations': get_warning_locations(),
    }

    if request.GET.get('format') == 'json':
        return JsonResponse(context)

    return render(request, 'frontend/pages/map.html', context)

# 경고 알림
def extract_sigungu(address):
    """
    #주소에서 시/군/구만 추출 (예: 송파구, 수원시, 강서구 등)
    """
    addrs = re.split(r' ', address)
    match = re.search(r'([가-힣]+(시|군|구))', addrs[1])
    return match.group(1) if match else None

def get_warning_locations():
    one_week_ago = datetime.now() - timedelta(days=7)
    reports = Report.objects.filter(created_at__gte=one_week_ago)

    sigungu_counts = defaultdict(int)

    for report in reports:
        sigungu = extract_sigungu(report.address or '')
        if sigungu:
            sigungu_counts[sigungu] += 1

    # 정렬: 신고 수 내림차순
    sorted_locations = sorted(sigungu_counts.items(), key=lambda x: x[1], reverse=True)

    if sorted_locations:
        top_sigungu, top_count = sorted_locations[0]
        return {'address': top_sigungu, 'count': top_count}
    else:
        return None


# ✅ (2) 필터링 및 사용자 제보 포함된 버전 (알림 포함)
def get_filtered_criminal_data(request):
    selected_types = request.GET.getlist('types')
    query = request.GET.get('query', '').strip()
    date_range = request.GET.get('date_range', '')
    selected_category = request.GET.get('category', '')

    sggNm, roadNm = '', ''
    if query:
        parts = query.split()
        if len(parts) == 1:
            sggNm = parts[0]
        elif len(parts) >= 2:
            sggNm = parts[0]
            roadNm = ' '.join(parts[1:])

    api_results = []
    if 'api_notice' in selected_types:
        service_key = settings.PUBLIC_DATA_API_KEY
        url = 'https://apis.data.go.kr/1383000/sais/SexualAbuseNoticeAddrService/getSexualAbuseNoticeAddrList'
        params = {
            'serviceKey': service_key,
            'pageNo': 1,
            'numOfRows': 100,
            'type': 'json',
        }
        if sggNm:
            params['sggNm'] = sggNm
        if roadNm:
            params['roadNm'] = roadNm

        try:
            response = session.get(url, params=params, verify=False)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': f'API 요청 실패: {e}'}, status=500)

        items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
        if isinstance(items, dict):
            items = [items]

        api_results = [{
            'ctpvNm': item.get('ctpvNm'),
            'roadNmZip': item.get('roadNmZip'),
            'sggNm': item.get('sggNm'),
            'roadNm': item.get('roadNm'),
        } for item in items]

    report_results = []
    if 'user_report' in selected_types:
        reports = Report.objects.filter(status=1)

        

        if query:
            reports = reports.filter(address__icontains=query)

        if date_range and date_range != "all":
            months = int(date_range)
            cutoff = datetime.now() - timedelta(days=30 * months)
            reports = reports.filter(created_at__gte=cutoff)

        if selected_category != '':
            reports = reports.filter(category=selected_category)

        report_results = [{
            'address': r.address,
            'category': r.category,
            'title': r.title,
            'content': r.content,
            'created_at': r.created_at,
        } for r in reports]

    context = {
        'selected_types': selected_types,
        'api_results': api_results,
        'report_results': report_results,
        'query': query,
        'warning_locations': get_warning_locations(),
    }

    if request.GET.get('format') == 'json':
        return JsonResponse(context)
    return render(request, 'mapview/home.html', context)


# 경고 알림용
def extract_sigungu(address):
    addrs = re.split(r' ', address)
    match = re.search(r'([가-힣]+(시|군|구))', addrs[1] if len(addrs) > 1 else '')
    return match.group(1) if match else None

def get_warning_locations():
    one_week_ago = datetime.now() - timedelta(days=7)
    reports = Report.objects.filter(created_at__gte=one_week_ago)
    sigungu_counts = defaultdict(int)

    last_report = None

    for report in reports:
        sigungu = extract_sigungu(report.address or '')
        if sigungu:
            sigungu_counts[sigungu] += 1
            last_report = report  # ✅ 여기까지는 OK

    sorted_locations = sorted(sigungu_counts.items(), key=lambda x: x[1], reverse=True)

    category_map = {
        0: '성추행/성폭행',
        1: '스토킹',
        2: '인적 드문 곳',
        3: '기타위험'
    }

    # ✅ None 체크 반드시 추가
    if sorted_locations and last_report:
        top_sigungu, top_count = sorted_locations[0]
        category = category_map.get(last_report.category, '기타')  # ❗ 기본값 추가해도 좋아
        return {
            'address': top_sigungu, 
            'count': top_count, 
            'created_at': localtime(last_report.created_at),
            'category': category,
        }

    # ✅ 안전하게 None 리턴
    return None



