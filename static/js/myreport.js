document.addEventListener('DOMContentLoaded', () => {
    const write_report = document.getElementById('write_report');
    const latest_report = document.getElementById('latest_report');
    const write_report_content = document.getElementById('write_report_content');
    const latest_report_list = document.getElementById('latest_report_list');
    const category_filter = document.getElementById('category_filter');
    const report_detail = document.getElementById('report_detail');
    const categorySelect = document.getElementById('category_select');
    const searchInput = document.getElementById('post_search');
    const searchButton = document.getElementById('search_btn');

    // 🔍 게시글 필터 함수: 카테고리 + 키워드 모두 적용
    function filterReports() {
        const selectedValue = categorySelect.value;
        const selectedText = categorySelect.options[categorySelect.selectedIndex].text.trim();
        const keyword = searchInput.value.trim().toLowerCase();

        const allBoxes = document.querySelectorAll('.content_box');

        allBoxes.forEach(box => {
            const boxCategory = box.dataset.category;
            const title = box.dataset.title?.toLowerCase() || '';
            const content = box.dataset.content?.toLowerCase() || '';

            const matchesCategory = selectedValue === '' || boxCategory === selectedText;
            const matchesKeyword = keyword === '' || title.includes(keyword) || content.includes(keyword);

            if (matchesCategory && matchesKeyword) {
                box.style.display = 'flex'; // 또는 'block'
            } else {
                box.style.display = 'none';
            }
        });
    }

    // ✅ 이벤트 연결 (중복 제거)
    if (categorySelect && searchInput && searchButton) {
        categorySelect.addEventListener('change', filterReports);
        searchButton.addEventListener('click', filterReports);
        // 실시간 반영을 원하지 않으면 아래 줄 제거 가능
        // searchInput.addEventListener('input', filterReports);
    }

    // ------------------------- 기타 기능 -------------------------

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

    // ✏️ 수정, 삭제 버튼 기능, 지도 관련 등 다른 로직은 기존대로 유지하시면 됩니다
});
