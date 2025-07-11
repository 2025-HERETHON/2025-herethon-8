//tab창 기능 구현
const write_report = document.getElementById('write_report');
const latest_report = document.getElementById('latest_report');
const write_report_content = document.getElementById('write_report_content');
const latest_report_list = document.getElementById('latest_report_list');
const category_filter = document.getElementById('category_filter');
const report_detail = document.getElementById('report_detail');

write_report.addEventListener('click',()=>{
    write_report.style.background="#E386AD";
    write_report.style.color="white";
    latest_report.style.background="#F9F9F9";
    latest_report.style.color="black";
    write_report_content.style.display='block';
    latest_report_list.style.display='none';
    category_filter.style.display='none';
    report_detail.style.display='none';
});
latest_report.addEventListener('click',()=>{
    write_report.style.background='#F9F9F9';
    latest_report.style.background="#E386AD";
    latest_report.style.color="white";
    write_report.style.color="black";
    latest_report_list.style.display='block';
    write_report_content.style.display='none';
    category_filter.style.display='flex';
    report_detail.style.display='none';
});

write_report.click();

//지도 띄우기
var container = document.getElementById('map');
		var options = {
			center: new kakao.maps.LatLng(33.450701, 126.570667),
			level: 3
		};

var map = new kakao.maps.Map(container, options);
var geocoder = new kakao.maps.services.Geocoder();
var marker = new kakao.maps.Marker({map:map});

const map_tab = document.getElementById('map_tab');
const address_input = document.getElementById('address_input');
const address_search = document.getElementById('address_search');
const finish_btn = document.getElementById('finish');

let selected_address='';

address_input.addEventListener('click',()=>{
   map_tab.style.display='flex';
   map.relayout();
});

address_search.addEventListener('keydown',function(e){
    if(e.key ==='Enter'){
        const input_value=address_search.value.trim();
        if(input_value ===''){
            alert('주소를 입력하세요')
            return;
        }
        geocoder.addressSearch(input_value, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                 var marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });
                marker.setPosition(coords);
                map.setCenter(coords);

                selected_address = result[0].address.address_name || result[0].road_address.address_name;
            }else{
                alert('주소를 찾을 수 없습니다.')
            } 
        }); 
    }  
});
finish_btn.addEventListener('click',()=>{
    finish_btn.style.color='white';
    address_input.value = selected_address;
    map_tab.style.display='none'; 
});
 

//이미지 미리보기
const fileDOM=document.getElementById("image_input");
const preview=document.getElementById("preview");

fileDOM.addEventListener('change',()=>{
  
    const files = fileDOM.files;
    Array.from(files).forEach((file,index)=>{
        const reader=new FileReader();
        reader.onload=(e)=>{
            const image_box=document.createElement('div');
            image_box.className='preview_image_box';

            const userImg=document.createElement('img');
            userImg.src=e.target.result;

            const deleteBtn=document.createElement('button');
            deleteBtn.innerHTML='X';

            deleteBtn.addEventListener('click',()=>{
                image_box.remove();
            });

            image_box.appendChild(userImg);
            image_box.appendChild(deleteBtn);

            preview.appendChild(image_box);
        };
        reader.readAsDataURL(file);
    });
    fileDOM.value='';
});

//등록버튼
const post_report = document.getElementById('post_report');
post_report.addEventListener('click',()=>{
    post_report.style.background="#E386AD";
});

const content_box = document.querySelectorAll('.content_box');
const back_btn = document.getElementById('back_btn');

content_box.forEach(box=>{
    box.addEventListener('click',()=>{
        latest_report_list.style.display='none';
        report_detail.style.display='block';

        const reportAddress = box.getAttribute('data-address'); 
        loadDetailMap(reportAddress);
    });
});

back_btn.addEventListener('click',()=>{
    report_detail.style.display='none';
    latest_report_list.style.display='block';
});

//report_detail 지도 띄우기
document.getElementById('back_btn').addEventListener('click', () => {
    document.getElementById('report_detail').style.display = 'none';
});

// report_detail 지도 연동
function loadDetailMap(address) {
    const detailMapContainer = document.querySelector('.detail_map');
    if (!detailMapContainer) return;

    const detailMapOptions = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 초기 중심
        level: 3
    };

    const detailMap = new kakao.maps.Map(detailMapContainer, detailMapOptions);
    const detailGeocoder = new kakao.maps.services.Geocoder();

    detailGeocoder.addressSearch(address, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            const marker = new kakao.maps.Marker({
                map: detailMap,
                position: coords
            });

            detailMap.setCenter(coords);
        } else {
            alert('지도를 불러올 수 없습니다.');
        }
    });
}