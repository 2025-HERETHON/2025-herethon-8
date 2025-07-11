document.addEventListener("DOMContentLoaded", () => {
    fetch("/accounts/privacy/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) throw new Error("개인정보 처리방침 데이터를 불러오지 못했습니다.");
        return response.json();
      })
      .then(data => {
        const titleEl = document.getElementById("policy-title");
        const contentEl = document.getElementById("policy-content");
  
        if (!titleEl || !contentEl) {
          console.error("DOM 요소가 존재하지 않습니다.");
          return;
        }
  
        titleEl.textContent = data.title;
        contentEl.innerHTML = data.content.replace(/\n/g, "<br>");
      })
      .catch(error => {
        console.error("정책 fetch 실패:", error);
        alert("개인정보 처리방침을 불러오는 중 문제가 발생했습니다.");
      });
  });
  