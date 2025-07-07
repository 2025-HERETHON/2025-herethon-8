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

//성범죄자 주소 띄우기
fetch('http://백엔드주소/api/criminal-locations')
  .then(response => response.json())
  .then(data => {
      const geocoder = new kakao.maps.services.Geocoder();
        
      data.forEach(item => {
          const fullAddress = item.ctpvNm + ' ' + item.sggNm + ' ' + item.roadNm;
        
          geocoder.addressSearch(fullAddress, function(result, status) {
              if (status === kakao.maps.services.Status.OK) {
                  const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                  const marker = new kakao.maps.Marker({
                      map: map,
                      position: coords,
                      title: fullAddress
                  });
                  map.setCenter(coords);
              }
          });
      });
  })
  .catch(error => console.error('에러:', error));
