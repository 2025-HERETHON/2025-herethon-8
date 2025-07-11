// 로그아웃 처리
document.getElementById("logout").addEventListener("click", () => {
    fetch("/accounts/logout/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    })
    .then(res => {
      if (!res.ok) throw new Error("로그아웃 실패");
      alert("로그아웃 완료 되었습니다.");
      window.location.href = "/map/";
    })
    .catch(err => {
      console.error("로그아웃 오류:", err);
      alert("로그아웃 중 오류가 발생했습니다.");
    });
  });
  
  // 회원탈퇴 처리
  document.getElementById("cancel").addEventListener("click", () => {
    if (!confirm("정말로 회원을 탈퇴하시겠습니까?")) return;
  
    fetch("/accounts/delete/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    })
    .then(res => {
      if (res.redirected) {
        alert("회원탈퇴가 완료되었습니다.");
        window.location.href = res.url;
      } else {
        throw new Error("회원탈퇴 요청 실패");
      }
    })
    .catch(error => {
      console.error("회원탈퇴 오류:", error);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    });
  });
  
  // 프로필 이미지 미리보기 (base64)
  document.getElementById("user_profile").addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profile_image").src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert("이미지 파일만 업로드 가능합니다.");
      this.value = "";
    }
  });
  
  // 프로필 업로드
  document.getElementById("edit_profile").addEventListener("click", function () {
    const fileInput = document.getElementById("user_profile");
    const file = fileInput.files[0];
  
    if (!file) {
      alert("이미지를 선택해주세요.");
      return;
    }
  
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
  
    const formData = new FormData();
    formData.append("profile_image", file);
  
    fetch("/accounts/page/mypage/", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => {
          console.warn("서버 응답:", text);
          throw new Error("업로드 실패");
        });
      }
      return res.text();  // 서버 리렌더링이 HTML이면 이렇게
    })
    .then(() => {
      const img = document.getElementById("profile_image");
      const base = img.src.split("?")[0];
      if (!base.startsWith("data:")) {
        img.src = `${base}?t=${Date.now()}`;  // ✅ 서버 이미지에만 강제 갱신
      }
      alert("프로필 이미지가 수정되었습니다.");
    })
    .catch(err => {
      console.error("업로드 오류:", err);
      alert("프로필 수정 중 오류가 발생했습니다.");
    });
  });
  
  // CSRF 토큰 꺼내기
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  
  // 마이페이지 이동 버튼
  document.getElementById("my_report").addEventListener("click", () => {
    window.location.href = "/accounts/page/myreport/";
  });
  document.getElementById("my_post").addEventListener("click", () => {
    window.location.href = "/accounts/page/mypost/";
  });

  //이용약관, 개인정보 이동
  document.addEventListener('DOMContentLoaded', () => {
    const termsBtn = document.querySelector('.setting_detail p:nth-child(1)');
    const privacyBtn = document.querySelector('.setting_detail p:nth-child(2)');
  
    if (termsBtn) {
      termsBtn.addEventListener('click', () => {
        window.location.href="/accounts/page/terms/"
      });
    }
  
    if (privacyBtn) {
      privacyBtn.addEventListener('click', () => {
       window.location.href="/accounts/page/policy/"
      });
    }
  });
  
  