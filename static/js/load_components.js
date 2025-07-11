document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("login-area");

  fetch("http://127.0.0.1:8000/accounts/api/user/", {
    credentials: "include"
  })
    .then(res => {
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Not authenticated");
      }
      return res.json();
    })
    .then(data => {
      if (loginBox && data.is_authenticated) {
        loginBox.innerHTML = `
          <span class="username" style="font-weight: bold; margin-right: 20px;">
            ${data.nickname || data.username}님
          </span>
          <button class="logout_btn" id="logout-btn">Logout</button>
        `;

        // 로그아웃 버튼 이벤트 연결
        document.getElementById("logout-btn").addEventListener("click", () => {
          fetch("http://127.0.0.1:8000/accounts/logout/", {
            method: "POST",
            headers: {
              "X-CSRFToken": getCookie("csrftoken"),
            },
            credentials: "include",
          })
          .then(res => {
            if (!res.ok) throw new Error("로그아웃 실패");
            // 페이지 새로고침 또는 login-area만 다시 렌더링
            window.location.href = "/map/";  // 로그아웃 후 메인페이지 이동
          })
          .catch(err => {
            console.error("로그아웃 오류:", err);
            alert("로그아웃 중 오류가 발생했습니다.");
          });
        });
      }
    })
    .catch(err => {
      console.log("로그인하지 않은 사용자입니다.");

      if (loginBox) {
        loginBox.innerHTML = `
          <button class="login_btn" onclick="window.location.href='/accounts/page/login/'">Login</button>
          <button class="sign_btn" onclick="window.location.href='/accounts/page/signup/'">Sign up</button>
        `;
      }
    });

  // ✅ 현재 페이지 기준 nav 링크 활성화
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links li a');
  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
});

// ✅ 쿠키에서 CSRF 토큰 가져오는 함수
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

logo.addEventListener('click',()=>{
  window.location.href="/map/";
});