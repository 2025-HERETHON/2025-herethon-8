document.addEventListener("DOMContentLoaded", () => {
    fetch("/accounts/terms/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) throw new Error("약관 데이터를 불러오지 못했습니다.");
        return response.json();
      })
      .then(data => {
        document.getElementById("terms-title").textContent = data.title;
        document.getElementById("terms-content").innerHTML = data.content.replace(/\n/g, "<br>");
      })
      .catch(error => {
        console.error("약관 fetch 실패:", error);
        alert("약관을 불러오는 중 문제가 발생했습니다.");
      });
  });
  