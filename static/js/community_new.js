// 쿠키에서 CSRF 토큰을 가져오는 함수
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

// 게시글 작성 페이지 로드 시 기존 수정 데이터 세팅
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.querySelector(".content-title");
  const contentInput = document.querySelector(".content-main");
  const photoInput = document.getElementById("photo");
  const uploadBtn = document.querySelector(".upload-btn");

  // localStorage에 저장된 수정용 데이터 불러오기
  const editData = localStorage.getItem("editPost");
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit") === "true";
  const editId = urlParams.get("id");

  if (editData && isEdit && editId) {
    const { title, content } = JSON.parse(editData);
    titleInput.value = title;
    contentInput.value = content;
    localStorage.removeItem("editPost");
  }

  // 게시글 업로드 또는 수정
  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const photoFile = photoInput.files[0];

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    const csrftoken = getCookie("csrftoken");
    let endpoint = "http://127.0.0.1:8000/community/post/create/submit/";
    if (isEdit && editId) {
      endpoint = `http://127.0.0.1:8000/community/post/${editId}/`;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken
        },
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        const result = await response.json();
        alert("게시글이 저장되었습니다.");
        window.location.href = "http://127.0.0.1:8000/community/page/";
      } else {
        const errorData = await response.json();
        alert("업로드 실패: " + (errorData.message || "오류 발생"));
      }
    } catch (e) {
      console.error("Error:", e);
      alert("네트워크 오류");
    }
  });

  // 이미지 미리보기 기능
  const fileInput = document.getElementById('photo');
  const previewContainer = document.getElementById('preview-container');

  fileInput.addEventListener('change', function () {
    const files = fileInput.files;
    previewContainer.innerHTML = '';

    if (files.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = '선택된 파일 없음';
      previewContainer.appendChild(emptyMsg);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
});
