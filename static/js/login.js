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

// ✅ 1. 페이지 로드 시 CSRF 쿠키 요청 (서버에서 Set-Cookie로 응답)
fetch('http://127.0.0.1:8000/accounts/csrf', {
    method: 'GET',
    credentials: 'include'
}).then(() => {
    const csrftoken = getCookie('csrftoken');
    document.getElementById("csrf-token").value = csrftoken;  // form 안에 hidden input 있으면 여기에 넣는 것
});

// ✅ 2. 로그인 form 제출 이벤트 등록
document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("userid").value;
    const password = document.getElementById("userpassword").value;
    const csrftoken = getCookie('csrftoken');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const response = await fetch('/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: formData.toString()
        });

        if (response.ok) {
            const data = await response.json();  // JSON 응답을 먼저 파싱
            window.location.href = "/page/map/";
             // 서버에서 받은 페이지로 이동(FE 템플릿)
        } else {
            const html = await response.text();
            console.warn("Login failed:", html);
        }

    } catch (error) {
        console.error("로그인 중 오류 발생:", error);
    }
});

// ✅ 3. 외부 버튼에서 form 강제 제출
document.querySelector(".login-btn").addEventListener("click", function () {
    document.getElementById("login-form").requestSubmit();
});

