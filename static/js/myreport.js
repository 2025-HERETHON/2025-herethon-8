//게시물 검색
function Searchreposts() {
  const post_search = document.getElementById('post_search');
  const category_filter = document.getElementById('category_select'); 
  
  post_search.addEventListener('input', () => {
    const keyword = post_search.value.toLowerCase();
    const reports = document.querySelectorAll('.report_content'); 

    reports.forEach(report => {  
      const title = report.querySelector('h2').innerText.toLowerCase();
      const content = report.querySelector('p').innerText.toLowerCase();

      if (title.includes(keyword) || content.includes(keyword)) {
        report.closest('.content_box').style.display = 'flex';
      } else {
        report.closest('.content_box').style.display = 'none';
      }
    });
  });
}

fetch('/accounts/api/myreport/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer 토큰값'   <-- 토큰 필요하면 넣기
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); 
  plusReports(data.reports); 
  Searchreposts(); 
})
.catch(error => console.error('에러:', error));

//데이터 추가하기
function plusReports(reports) {
  const reportList = document.getElementById('reportList');
  reportList.innerHTML = '';

  reports.forEach(report => {
    const statusText = getStatusText(report.status);
    const statusColor = getStatusColor(report.status);
    const categoryText = getCategoryText(report.category);

    const firstImage = report.photos && report.photos.length > 0 ? report.photos[0].image : '/static/images/no-image.png';

    const reportHTML = `
      <div class="content_box">
        <div class="status" style="background-color: ${statusColor};">
          <p>${statusText}</p>
        </div>
        <div class="report_content">
          <h2>${report.title}</h2>
          <p>${report.content}</p>
          <div class="report_footer">
            <span>도움이 돼요 ${report.likes}</span>
            <span>댓글 ${report.comments_count}</span>
          </div>
        </div>
        <div class="report-image">
          <img src="${firstImage}" alt="제보 이미지" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
        </div>
      </div>
    `;
    reportList.insertAdjacentHTML('beforeend', reportHTML);
  });
}
//상태
function getStatusText(status) {
  const statusMap = {
    0: '검토중',
    1: '승인됨',
    2: '반려'
  };
  return statusMap[status] || '미정';
}

function getStatusColor(status) {
  const statusColorMap = {
    0: '#FFFB7F',    
    1: '#B2FFC0',    
    2: '#FF9E9E'     
  };
  return statusColorMap[status] || '#D9D9D9';
}

function getCategoryText(category) {
  const categoryMap = {
    0: '성추행/성폭력',
    1: '스토킹',
    2: '인적 드문 곳',
    3: '기타위험'
  };
  return categoryMap[category] || '미지정';
}
