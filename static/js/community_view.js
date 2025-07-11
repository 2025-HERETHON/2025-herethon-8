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

const postId = getPostIdFromURL();

// 문서 로드 시 초기 설정
document.addEventListener("DOMContentLoaded", function () {
  if (!postId) {
    alert("유효하지 않은 게시글입니다.");
    return;
  }
  fetchPostDetail(postId);
  setupCommentSubmit(postId);
  setupLikeButton(postId);
});

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 좋아요 기능 연결
function setupLikeButton(postId) {
  const likeBtn = document.querySelector(".like-btn");
  likeBtn.addEventListener("click", async () => {
    const csrftoken = getCookie("csrftoken");
    try {
      const response = await fetch(`http://127.0.0.1:8000/community/post/${postId}/like/ajax/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        likeBtn.classList.add("liked");
        document.getElementById("post-like").textContent = data.like_count;
      }
    } catch (err) {
      likeBtn.classList.remove("liked");
      console.error("좋아요 실패", err);
    }
  });
}

//  게시글 데이터 요청
async function fetchPostDetail(postId) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/community/post/${postId}/`, {
      method: "GET",
      credentials: "include"
    });
    const contentType = response.headers.get("content-type");
    const bodyText = await response.text();
    if (!response.ok || !contentType.includes("application/json")) {
      document.getElementById("content").innerHTML = "<p>로그인이 필요합니다. <a href='/pages/login.html'>로그인</a></p>";
      return;
    }
    const data = JSON.parse(bodyText);
    renderPost(data);
    renderComments(data.comments);
  } catch (error) {
    console.error("게시글 데이터를 불러오는 데 실패:", error);
    document.getElementById("content").innerHTML = "<p>불러오기 실패</p>";
  }
}

// 게시글 본문 렌더링
function renderPost(data) {
  document.getElementById("post-title").textContent = data.title;
  document.getElementById("post-nickname").textContent = `👤${data.nickname}`;
  document.getElementById("post-date").textContent = `📅${formatDate(data.created_at)}`;
  document.getElementById("post-views").textContent = `👁️조회수 ${data.views}회`;
  document.getElementById("post-content").textContent = data.content;
  document.getElementById("post-like").textContent = data.like;
  document.getElementById("comment-count").textContent = data.comments.length;
  document.getElementById("comment-total-count").textContent = data.comments.length;

    // 게시글 작성자 확인 (닉네임 비교)
    const currentUserNickname = document.body.dataset.userNickname || ""; // 예시: <body data-user-nickname="선화">
    const isAuthor = currentUserNickname && currentUserNickname === data.nickname;
  
    // 수정/삭제 버튼 표시
    const postActions = document.getElementById("post-actions");
    if (isAuthor) {
      postActions.innerHTML = `
        <button class="post-edit-btn">게시글 수정</button>
        <button class="post-delete-btn">게시글 삭제</button>
      `;
      // 이벤트 연결
      postActions.querySelector(".post-edit-btn").addEventListener("click", () => editPost(data.id, data));
      postActions.querySelector(".post-delete-btn").addEventListener("click", () => deletePost(data.id));
    } else {
      postActions.innerHTML = ""; // 작성자가 아닌 경우 버튼 제거
    }

}
//게시글 수정 함수
function editPost(postId, postData) {
  // 게시글 수정 데이터를 localStorage에 저장
  localStorage.setItem("editPost", JSON.stringify({
    id: postId,
    title: postData.title,
    content: postData.content
  }));

    // 수정용 작성 페이지로 이동
    window.location.href = `/community/post/create/?edit=true&id=${postId}`;

  if (!newTitle || !newContent) {
    alert("제목과 내용을 모두 입력해야 합니다.");
    return;
  }

  fetch(`http://127.0.0.1:8000/community/post/${postId}/?edit=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    credentials: "include",
    body: JSON.stringify({
      title: newTitle,
      content: newContent,
      photo: postData.photo || ""
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.messages || "수정 완료");
      fetchPostDetail(postId);
    })
    .catch(err => {
      console.error("게시글 수정 실패:", err);
      alert("수정 중 오류 발생");
    });
}
//게시글 삭제 함수
function deletePost(postId) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  fetch(`http://127.0.0.1:8000/community/post/${postId}/delete/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Content-Type": "application/json"
    },
    credentials: "include"
  })
    .then(res => {
      if (res.redirected) {
        // 서버에서 redirect 응답한 경우 → 해당 페이지로 이동
        window.location.href = res.url;
      } else if (res.ok) {
        alert("삭제가 완료되었습니다.");
        window.location.href = "/community/page/";
      } else {
        throw new Error("삭제 실패");
      }
    })
    .catch(err => {
      console.error("게시글 삭제 실패:", err);
      alert("삭제 중 오류 발생");
    });
}



// 댓글 및 대댓글 렌더링
function renderComments(comments) {
  const listContainer = document.getElementById("comment-list");
  listContainer.innerHTML = "";
  comments.forEach(comment => {
    const commentItem = document.createElement("div");
    commentItem.className = "comment-item";

    const header = document.createElement("div");
    header.className = "comment-header";
    header.innerHTML = `
      <span class="comment_nickname">${comment.is_anonymous ? "익명" : comment.nickname}</span>
      <span class="time">${formatDate(comment.created_at)}</span>
    `;

    const content = document.createElement("div");
    content.className = "comment-content";
    content.textContent = comment.content;
    content.dataset.commentId = comment.id;

    const actions = document.createElement("div");
    actions.className = "comment-actions";
    actions.innerHTML = `
      <div class=comment-wrapper>
      <div class=comment-menu>
      <button class="reply-btn" data-comment-id="${comment.id}">답글</button>
      <button class="edit-btn" data-comment-id="${comment.id}" data-content="${comment.content}">수정</button>
      <button class="delete-btn" data-comment-id="${comment.id}">삭제</button>
      </div>
      <div class="reply-input-wrapper" id="reply-input-${comment.id}" style="display:none;">
        <input type="text" class="reply-input" placeholder="답글 내용을 입력하세요">
        <label>
          <input type="checkbox" class="reply-anonymous-checkbox" data-parent-id="${comment.id}">
          익명
        </label>
        <button class="submit-reply-btn" data-parent-id="${comment.id}">등록</button>
      </div>
      </div>

    `;

    const replyList = document.createElement("div");
    replyList.className = "reply-list";
    comment.replies.forEach(reply => {
      const replyItem = document.createElement("div");
      replyItem.className = "reply-item";
      replyItem.innerHTML = `
        <div class="reply-header">
          <span class="reply-nickname">${reply.is_anonymous ? "익명" : reply.nickname}</span>
          <span class="reply-time">${formatDate(reply.created_at)}</span>
        </div>
        <span class="reply-content">${reply.content}</span>
        <button class="delete-btn" data-comment-id="${reply.id}" style="margin-left:10px">삭제</button>
      `;
      replyList.appendChild(replyItem);
    });

    commentItem.appendChild(header);
    commentItem.appendChild(content);
    commentItem.appendChild(actions);
    commentItem.appendChild(replyList);
    listContainer.appendChild(commentItem);
  });
  setupDeleteButtons();
  setupEditButtons();
  setupReplyButtons();
}

//  댓글 삭제 기능 연결
function setupDeleteButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    const commentId = btn.dataset.commentId;
    btn.addEventListener("click", () => deleteComment(commentId));
  });
}

//  댓글 수정 (대댓글은 제외)
function setupEditButtons() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const commentId = btn.dataset.commentId;
      const originalContent = btn.dataset.content;
      const contentElement = document.querySelector(`.comment-content[data-comment-id='${commentId}']`);
      const input = document.createElement("input");
      input.type = "text";
      input.value = originalContent;
      input.className = "edit-input";
      contentElement.replaceWith(input);
      btn.textContent = "저장";
      btn.classList.add("save-edit");
      btn.addEventListener("click", () => submitEditComment(commentId, input.value));
    });
  });
}

// 대댓글 입력 폼 연결
function setupReplyButtons() {
  document.querySelectorAll(".reply-btn").forEach(btn => {
    const commentId = btn.dataset.commentId;
    btn.addEventListener("click", () => {
      const inputBox = document.getElementById(`reply-input-${commentId}`);
      inputBox.style.display = inputBox.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".submit-reply-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const parentId = btn.dataset.parentId;
      const wrapper = document.getElementById(`reply-input-${parentId}`);
      const input = wrapper.querySelector(".reply-input");
      const checkbox = wrapper.querySelector(".reply-anonymous-checkbox");  // 익명 체크박스
      const content = input.value.trim();

      if (!content) {
        alert("답글을 입력해주세요.");
        return;
      }

      // 익명 여부 체크박스 상태
      const isAnonymous = checkbox ? checkbox.checked : false;

      try {
        const response = await fetch(`http://127.0.0.1:8000/community/post/${postId}/comments/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
          },
          credentials: "include",
          body: JSON.stringify({
            content: content,
            parent: parentId,
            is_anonymous: isAnonymous  // 체크박스 상태 전송
          })
        });

        if (response.ok) {
          alert("답글이 등록되었습니다.");
          fetchPostDetail(postId);
        } else {
          const err = await response.json();
          alert(err.messages || "등록 실패");
        }
      } catch (error) {
        console.error("답글 등록 오류:", error);
        alert("네트워크 오류");
      }
    });
  });
}


// 댓글 작성 요청
function setupCommentSubmit(postId) {
  document.getElementById("submit-comment-btn").addEventListener("click", async () => {
    const content = document.getElementById("comment-input").value;
    const isAnonymous = document.getElementById("anonymous-checkbox").checked;
    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/community/post/${postId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
        },
        credentials: "include",
        body: JSON.stringify({
          content: content,
          is_anonymous: isAnonymous
        })
      });
      if (response.ok) {
        const result = await response.json();
        alert(result.messages || "댓글이 등록되었습니다.");
        fetchPostDetail(postId);
      } else {
        const error = await response.json();
        alert(error.messages || "댓글 작성 실패");
      }
    } catch (err) {
      console.error("댓글 등록 중 오류:", err);
      alert("네트워크 오류로 댓글 등록 실패");
    }
  });
}

//삭제 요청 함수 (댓글/대댓글 공통)
async function deleteComment(commentId) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/community/comment/${commentId}/delete/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    if (response.ok) {
      alert("삭제 완료");
      fetchPostDetail(postId);
    } else {
      const err = await response.json();
      alert(err.message || "삭제 실패");
    }
  } catch (err) {
    console.error("삭제 오류:", err);
    alert("네트워크 오류");
  }
}

//  댓글 수정 요청 
async function submitEditComment(commentId, newContent) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/community/post/${postId}/comments/?edit=${commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      credentials: "include",
      body: JSON.stringify({ content: newContent })
    });
    if (response.ok) {
      alert("댓글이 수정되었습니다.");
      fetchPostDetail(postId);
    } else {
      const err = await response.json();
      alert(err.messages || "수정 실패");
    }
  } catch (error) {
    console.error("댓글 수정 오류:", error);
    alert("수정 중 오류 발생");
  }
}

//  날짜 포맷
function formatDate(datetimeStr) {
  const date = new Date(datetimeStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}
