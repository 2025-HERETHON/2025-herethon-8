var container = document.getElementById('map');
var options ={
    center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
    };

var map = new kakao.maps.Map(container, options);
var geocoder = new kakao.maps.services.Geocoder();
const search_button = document.getElementById('search_button');

//주소검색 시 지도 이동
search_button.addEventListener('click',()=>{
    const search_address = document.getElementById('search_address');
    const input_value=search_address.value;

    console.log('입력값:',input_value);

    if(input_value ===''){
            alert('주소를 입력하세요')
            return;
        }
        geocoder.addressSearch(input_value,function(result,status){
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.setCenter(coords);
            }
            else{
                alert('주소를 찾을 수 없습니다.')
            }
        });

        //주소 입력값 가공(구 부분만 떼어내기)
        const matches = input_value.match(/([가-힣]+구)/);
        const queryParam = matches ? matches[1] : input_value;

        console.log('API에 보낼 query:', queryParam);

        // 가공된 값으로 호출
        loadCriminalMarkers(queryParam);
});
    


// 성범죄자 주소 띄우기 (검색어 한 개로 처리)
function loadCriminalMarkers(query) {
    if (!query || query.trim() === '') {
        alert('검색어를 입력해주세요.');
        return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('query', query.trim());
    queryParams.append('format', 'json');
    queryParams.append('types', 'api_notice'); 
    console.log(`http://127.0.0.1:8000/api/criminal-locations/?${queryParams.toString()}`);

    fetch(`http://127.0.0.1:8000/api/criminal-locations/?${queryParams.toString()}`)

        .then(response => {
            if (!response.ok) throw new Error("API 응답 실패");
            return response.json();
        })
        .then(data => {
            const results = data.api_results || [];
            if (results.length === 0) {
                alert("해당 지역의 성범죄자 정보가 없습니다.");
                return;
            }
        
            const geocoder = new kakao.maps.services.Geocoder();
            let isFirst = true;
        
            results.forEach(item => {
                const fullAddress = `${item.sggNm || ''} ${item.roadNm || ''}`.trim();
        
                geocoder.addressSearch(fullAddress, function(result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        
                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: coords,
                            title: fullAddress
                        });
        
                        if (isFirst) {
                            // 첫 마커 위치로 지도 이동(필요하면)
                            map.setCenter(coords);
                            isFirst = false;
                        }
                    } else {
                        console.warn(`주소 변환 실패: ${fullAddress}`);
                    }
                });
            });
        })
    }        