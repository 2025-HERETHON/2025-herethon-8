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

        loadCriminalMarkers(input_value);
});
    


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

