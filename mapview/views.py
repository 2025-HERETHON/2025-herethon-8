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

def get_criminal_locations(request):
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

    results = [{
        'ctpvNm': item.get('ctpvNm'), 
        'roadNmZip': item.get('roadNmZip'),
        'sggNm': item.get('sggNm'),
        'roadNm': item.get('roadNm'),
    } for item in items]

    return JsonResponse(results, safe=False)