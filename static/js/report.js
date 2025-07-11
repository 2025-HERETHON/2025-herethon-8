document.addEventListener('DOMContentLoaded', () => {
    const write_report = document.getElementById('write_report');
    const latest_report = document.getElementById('latest_report');
    const write_report_content = document.getElementById('write_report_content');
    const latest_report_list = document.getElementById('latest_report_list');
    const category_filter = document.getElementById('category_filter');
    const report_detail = document.getElementById('report_detail');

    // 탭 전환 함수
    function activateWriteTab() {
        write_report.style.background = "#E386AD";
        write_report.style.color = "white";
        latest_report.style.background = "#F9F9F9";
        latest_report.style.color = "black";
        write_report_content.style.display = 'block';
        latest_report_list.style.display = 'none';
        category_filter.style.display = 'none';
        report_detail.style.display = 'none';
    }

    function activateLatestTab() {
        write_report.style.background = '#F9F9F9';
        write_report.style.color = "black";
        latest_report.style.background = "#E386AD";
        latest_report.style.color = "white";
        latest_report_list.style.display = 'block';
        write_report_content.style.display = 'none';
        category_filter.style.display = 'flex';
        report_detail.style.display = 'none';
    }

    write_report.addEventListener('click', activateWriteTab);
    latest_report.addEventListener('click', activateLatestTab);

    // URL 파라미터 기반으로 기본 탭 설정
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('latest') === 'true') {
        activateLatestTab();
    } else {
        activateWriteTab();
    }

    //카테고리
    const CATEGORY_MAP = {
        0: "성추행/성폭력",
        1: "스토킹",
        2: "인적 드문 곳",
        3: "기타 위험"
    };
    
    document.querySelector('#category_select').addEventListener('change', function () {
        const selectedValue = this.value;
        const allBoxes = document.querySelectorAll('.content_box');
    
        allBoxes.forEach(box => {
            const boxCategory = box.dataset.category;
    
            // 전체 보기
            if (selectedValue === "") {
                box.style.display = 'block';
            }
            // 카테고리 매칭
            else if (boxCategory === CATEGORY_MAP[selectedValue]) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    });
    
    // ---------------- 지도 검색 기능 ----------------
    const container = document.getElementById('map');
    const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3
    });
    const geocoder = new kakao.maps.services.Geocoder();
    const marker = new kakao.maps.Marker({ map: map });

    const map_tab = document.getElementById('map_tab');
    const address_input = document.getElementById('address_input');
    const address_search = document.getElementById('address_search');
    const finish_btn = document.getElementById('finish');
    let selected_address = '';

    address_input.addEventListener('click', () => {
        map_tab.style.display = 'flex';
        map.relayout();
    });

    address_search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const input_value = address_search.value.trim();
            if (input_value === '') {
                alert('주소를 입력하세요');
                return;
            }

            geocoder.addressSearch(input_value, function (result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                    marker.setPosition(coords);
                    map.setCenter(coords);
                    selected_address = result[0].address.address_name || result[0].road_address.address_name;
                    document.getElementById('latitude_input').value = result[0].y;
                    document.getElementById('longitude_input').value = result[0].x;
                } else {
                    alert('주소를 찾을 수 없습니다.');
                }
            });
        }
    });

    finish_btn.addEventListener('click', () => {
        finish_btn.style.color = 'white';
        address_input.value = selected_address;
        map_tab.style.display = 'none';
    });

    // ---------------- 이미지 미리보기 ----------------
    const fileDOM = document.getElementById("image_input");
    const preview = document.getElementById("preview");

    fileDOM.addEventListener('change', () => {
        const files = fileDOM.files;
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const image_box = document.createElement('div');
                image_box.className = 'preview_image_box';

                const userImg = document.createElement('img');
                userImg.src = e.target.result;

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = 'X';
                deleteBtn.addEventListener('click', () => {
                    image_box.remove();
                });

                image_box.appendChild(userImg);
                image_box.appendChild(deleteBtn);
                preview.appendChild(image_box);
            };
            reader.readAsDataURL(file);
        });
        // fileDOM.value = '';
    });

    // ---------------- 제보 등록 ----------------
    const post_report = document.getElementById('post_report');
    post_report.addEventListener('click', () => {
        post_report.style.background = "#E386AD";

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('content', document.getElementById('letter').value);
        formData.append('address', document.getElementById('address_input').value);
        formData.append('category', document.querySelector('.category select').value);

        const files = document.getElementById('image_input').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }
        fetch('/reports/create/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData,
            credentials: 'include'
        })
        .then(() => {
            // 등록 성공 시 최신 탭으로 리다이렉트
            window.location.href = "/reports/page/?latest=true";
        })
        .catch(error => {
            console.error('제보 등록 실패:', error);
            alert('제보 등록 중 오류가 발생했습니다.');
        });
    });

    // ---------------- 제보 상세 보기 ----------------
    const content_box = document.querySelectorAll('.content_box');
    const back_btn = document.getElementById('back_btn');

    content_box.forEach(box => {
        box.addEventListener('click', () => {
            latest_report_list.style.display = 'none';
            report_detail.style.display = 'block';
                    // data-*에서 값 꺼내기
        document.getElementById('detail_title').innerText = box.dataset.title;
        document.getElementById('detail_address').innerText = box.dataset.address;
        document.getElementById('detail_category').innerText = box.dataset.category;
        document.getElementById('detail_content').innerText = box.dataset.content;
        document.getElementById('detail_status').innerText = box.dataset.status;
        const detailContainer = document.getElementById('report_detail');
        detailContainer.dataset.id = box.dataset.id;

    // 이미지 렌더링
    const imageContainer = document.getElementById('detail_image');
    imageContainer.innerHTML = '';
    if (box.dataset.image) {
        const img = document.createElement('img');
        img.src = box.dataset.image;
        img.alt = '제보 이미지';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        imageContainer.appendChild(img);
    }

        loadDetailMap(box.dataset.address);
            // const reportAddress = box.getAttribute('data-address');
            // loadDetailMap(reportAddress);
        });
    });

    back_btn.addEventListener('click', () => {
        report_detail.style.display = 'none';
        latest_report_list.style.display = 'block';
    });

    function loadDetailMap(address) {
        const detailMapContainer = document.querySelector('.detail_map');
        if (!detailMapContainer) return;

        const detailMap = new kakao.maps.Map(detailMapContainer, {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3
        });

        const detailGeocoder = new kakao.maps.services.Geocoder();
        detailGeocoder.addressSearch(address, function (result, status) {
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
});
//수정, 삭제 버튼
document.getElementById('revise').addEventListener('click', () => {
    const reportId = document.querySelector('#report_detail').dataset.id;

    // 해당 데이터를 가져와서 수정 폼을 채우기 위해 팝업 또는 폼 영역 오픈 처리
    fetch(`/reports/api/${reportId}/`)  // 수정 데이터를 JSON으로 제공해야 함
        .then(response => response.json())
        .then(data => {
            // 예: 수정 폼 열기
            document.getElementById('title').value = data.title;
            document.getElementById('letter').value = data.content;
            document.getElementById('address_input').value = data.address;
            document.getElementById('id_category').value = data.category;
            document.getElementById('post_report').innerText = '수정 완료';
            
            // 상태 저장
            document.getElementById('post_report').dataset.mode = 'update';
            document.getElementById('post_report').dataset.id = reportId;

            // 탭 이동
            document.getElementById('write_report').click();
        });
});


document.getElementById('delete').addEventListener('click', () => {
    const reportId = document.querySelector('#report_detail').dataset.id;
    if (confirm('정말 삭제하시겠습니까?')) {
        fetch(`/reports/${reportId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
                alert('삭제 완료');
                window.location.href = '/reports/page/?latest=true';
            } else {
                alert('삭제 실패');
            }
        });
    }
});


// CSRF 토큰 쿠키에서 가져오기
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
