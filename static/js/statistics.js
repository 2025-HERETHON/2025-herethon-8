function loadData() {
    const query = document.getElementById("query").value.trim();

    // types=api_notice를 반드시 포함시킴
    fetch(`/api/criminal-locations/?query=${encodeURIComponent(query)}&format=json&types=api_notice`)
        .then(response => response.json())
        .then(data => {
            renderLocations(data.api_results); // <- 반드시 .api_results로 접근
        })
        .catch(err => {
            console.error("데이터 로딩 오류:", err);
        });
}

function renderLocations(locations) {
    const tbody = document.querySelector("#location-table tbody");
    tbody.innerHTML = ""; // 기존 내용 초기화

    locations.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.ctpvNm || '-'}</td>
            <td>${item.sggNm || '-'}</td>
            <td>${item.roadNm || '-'}</td>
            <td>${item.roadNmZip || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
