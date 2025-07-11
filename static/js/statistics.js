
function loadData() {
    const query = document.getElementById("query").value.trim();

    // 마커용 API
    fetch(`/api/criminal-locations/?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(locations => {
            renderLocations(locations);
        });

    // 통계용 API
    fetch(`/api/criminal-locations/?query=${encodeURIComponent(query)}&type=stats`)
        .then(response => response.json())
        .then(statistics => {
            renderStats(statistics);
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


