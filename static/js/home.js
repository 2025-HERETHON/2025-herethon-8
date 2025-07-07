var container = document.getElementById('map');
var options ={
    center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
    };

var map = new kakao.maps.Map(container, options);

//주소검색 시 지도 이동
function searchLocation(){
    const search_address=document.getElementById('search_address').ariaValueMax;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(search_address,function(result,status){
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            map.setCenter(coords);
        }
        else{
            alert('주소를 찾을 수 없습니다.')
        }
    });
}

// 성범죄자 주소 띄우기 (검색어 한 개로 처리)

function loadCriminalMarkers(query) {
    if (!query || query.trim() === '') {
        alert('검색어를 입력해주세요.');
        return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('query', query.trim());
    console.log(`/api/criminal-locations/?${queryParams.toString()}`);

    fetch(`/api/criminal-locations/?${queryParams.toString()}`)

        .then(response => {
            if (!response.ok) throw new Error("API 응답 실패");
            return response.json();
        })
        .then(data => {
            if (!data.length) {
                alert("해당 지역의 성범죄자 정보가 없습니다.");
                return;
            }

            const geocoder = new kakao.maps.services.Geocoder();
            let isFirst = true;

            data.forEach(item => {
                // item.sggNm과 item.roadNm은 백엔드에서 분리해서 내려줌
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
                            map.setCenter(coords);
                            isFirst = false;
                        }
                    } else {
                        console.warn(`주소 변환 실패: ${fullAddress}`);
                    }
                });
            });
        })
        .catch(error => {
            console.error("에러:", error);
            alert("데이터를 불러오지 못했습니다.");
        });
}

// 검색 버튼 클릭 시 입력값을 받아서 loadCriminalMarkers 호출하기
document.getElementById('search_button').addEventListener('click', function() {
    const searchInput = document.getElementById('search_address').value;
    loadCriminalMarkers(searchInput);
});
