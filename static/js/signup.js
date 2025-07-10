// 1. CSRF 토큰을 쿠키에서 꺼내는 함수
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
          const trimmed = cookie.trim();
          if (trimmed.startsWith(name + '=')) {
              cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

// 2. 폼 제출 이벤트 핸들러
document.getElementById("sign-form").addEventListener("submit", async function (e) {
  e.preventDefault();  // 폼 기본 제출 막기

  // 3. 입력값 수집
  const email = document.getElementById("user-email").value;
  const username = document.getElementById("user-id").value;
  const password1 = document.getElementById("user-password").value;
  const password2 = document.getElementById("user-password-confirm").value;
  const nickname = document.getElementById("user-nickname").value;

  // 4. CSRF 토큰 확보
  let csrftoken = getCookie('csrftoken');

  if (!csrftoken) {
      await fetch("http://127.0.0.1:8000/accounts/signup/", {
          method: "GET",
          credentials: "include"
      });
      csrftoken = getCookie('csrftoken');
  }

  // 5. 회원가입 POST 요청
  try {
      const response = await fetch("http://127.0.0.1:8000/accounts/signup/", {
          method: "POST",
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-CSRFToken": csrftoken
          },
          credentials: "include",
          body: new URLSearchParams({
              username: username,
              email: email,
              nickname: nickname,
              password1: password1,
              password2: password2
          })
      });
      // 6. 응답 처리
      if (response.ok) {
          // 회원가입 성공 
          const data = await response.json(); 
          const url = data.redirect_url || "/page/login/";
          window.location.href = url;
      } else {
              // 실패 시 에러 메시지 추출
    const contentType = response.headers.get("content-type");
    let errorMessage = "알 수 없는 오류가 발생했습니다.";

    if (contentType && contentType.includes("application/json")) {
        try {
            const errorData = await response.json();  // JSON 파싱 시도
            errorMessage = JSON.stringify(errorData, null, 2);
        } catch (parseError) {
            console.warn("JSON 파싱 실패:", parseError);
            errorMessage = "서버 응답을 해석할 수 없습니다 (Invalid JSON)";
        }
    } else {
        try {
            errorMessage = await response.text();  // 일반 텍스트로 파싱
        } catch (textError) {
            console.warn("텍스트 파싱 실패:", textError);
        }
    }

    console.error("회원가입 실패 응답:", errorMessage);
    alert("회원가입에 실패했습니다. 다시 시도해주세요.\n\n" + errorMessage);
      }

  } catch (error) {
      console.error("요청 중 에러:", error);
      alert("서버 연결 중 문제가 발생했습니다. 네트워크 상태를 확인하세요.");
  }
});
