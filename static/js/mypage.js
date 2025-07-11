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
  
  document.getElementById("edit_profile").addEventListener("click", function () {
    const isEditing = this.dataset.editing === "true";
  
    if (!isEditing) {
      // 편집 모드 ON
      ["username", "nickname"].forEach(id => {
        document.getElementById(id).style.display = "none";
        document.getElementById(id + "_input").style.display = "inline-block";
      });
  
      this.textContent = "저장하기";
      this.dataset.editing = "true";
    } else {
      // 저장하기
      const usernameInput = document.getElementById("username_input");
      const nicknameInput = document.getElementById("nickname_input");
  
      const username = usernameInput?.value.trim();
      const nickname = nicknameInput?.value.trim();
  
      if (!username || !nickname) {
        alert("아이디와 닉네임은 필수 입력 항목입니다.");
        return;
      }
  
      const fileInput = document.getElementById("user_profile");
      const file = fileInput.files[0];
  
      if (file && !file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
  
      const formData = new FormData();
      formData.append("username", username);
      formData.append("nickname", nickname);
      if (file) formData.append("profile_image", file);
  
      fetch("/accounts/edit/", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            let messages = [];
            if (data.errors) {
              for (const field in data.errors) {
                messages.push(...data.errors[field]);
              }
              alert("오류 발생:\n" + messages.join("\n"));
            } else {
              alert("프로필 수정 실패");
            }
            throw new Error("폼 검증 실패");
          }
          return data;
        })
        .then(data => {
          // 텍스트 반영
          document.getElementById("username").textContent = data.username;
          document.getElementById("nickname").textContent = data.nickname;
  
          // 이미지 강제 새로고침
          const img = document.getElementById("profile_image");
          img.src = img.src.split("?")[0] + `?t=${Date.now()}`;
  
          // 편집 모드 종료
          ["username", "nickname"].forEach(id => {
            document.getElementById(id).style.display = "block";
            document.getElementById(id + "_input").style.display = "none";
          });
  
          this.textContent = "프로필 수정";
          this.dataset.editing = "false";
  
          alert("프로필이 수정되었습니다.");
        })
        .catch(err => {
          console.error("오류:", err);
        });
    }
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
  
  
