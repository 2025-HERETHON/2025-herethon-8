from django.shortcuts import render
from .models import CriminalLocation
from django.http import JsonResponse
import requests
from django.conf import settings
import urllib3
import ssl
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager

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

#범죄 마커 표시용
def get_criminal_locations(request):
    service_key = settings.PUBLIC_DATA_API_KEY
    query = request.GET.get('query', '').strip()
    response_type = request.GET.get('type', '').lower()  # 'stats'면 통계 응답

    print(f'[DEBUG] query="{query}", type="{response_type}"')

    sggNm = ''
    roadNm = ''

    if query:
        parts = query.split()
        if len(parts) == 1:
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

    if isinstance(items, dict):
        items = [items]

    if response_type == 'stats':
        # 통계용: sggNm(구)별 개수 집계해서 반환
        sgg_counter = Counter(item.get('sggNm') for item in items if item.get('sggNm'))
        return JsonResponse(dict(sgg_counter))

    else:
        # 기본: 마커 표시용 리스트 반환
        results = [{
            'ctpvNm': item.get('ctpvNm'),
            'roadNmZip': item.get('roadNmZip'),
            'sggNm': item.get('sggNm'),
            'roadNm': item.get('roadNm'),
        } for item in items]
        return JsonResponse(results, safe=False)


def statistics(request):
    return render(request, 'mapview/statistics.html')