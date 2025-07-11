let currentUsername = null;

document.addEventListener("DOMContentLoaded", function () {
    // 1단계: 로그인 사용자 정보 먼저 가져오기
    fetch("http://127.0.0.1:8000/accounts/api/user/", {
        method: "GET",
        credentials: "include"
    })
        .then(res => res.json())
        .then(user => {
            currentUsername = user.id;
            fetchPostList();  // 사용자 정보가 확인되면 게시글 요청
        })
        .catch(error => {
            console.error("로그인 사용자 정보 불러오기 실패:", error);
            document.getElementById("content").innerHTML = "<p>로그인이 필요합니다.</p>";
        });
});

function fetchPostList() {
    fetch("http://127.0.0.1:8000/community/", {
        method: "GET",
        credentials: "include"
    })
        .then(response => {
            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType.includes("application/json")) {
                throw new Error("로그인이 필요하거나 JSON 응답이 아님");
            }
            return response.json();
        })
        .then(data => {
            // 🔥 현재 로그인한 사용자의 게시글만 필터링
            const myPosts = data.filter(post => post.username === currentUsername);
            renderPostList(myPosts);
        })
        .catch(error => {
            console.error("게시글 불러오기 실패:", error);
            document.getElementById("content").innerHTML = "<p>게시글을 불러올 수 없습니다. 로그인 상태를 확인해주세요.</p>";
        });
}

function renderPostList(posts) {
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = "";

    if (posts.length === 0) {
        contentContainer.innerHTML = "<p>작성한 게시글이 없습니다.</p>";
        return;
    }

    posts.forEach(post => {
        const postWrapper = document.createElement("div");
        postWrapper.className = "content-main";

        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerText = post.title;

        const contentDiv = document.createElement("div");
        contentDiv.className = "content post-content";
        contentDiv.innerText = post.content;

        const metaDiv = document.createElement("div");
        metaDiv.className = "content post-meta";
        metaDiv.innerText = `도움이 돼요 ${post.like}   댓글 ${post.comment_count}`;

        postWrapper.addEventListener("click", () => {
            window.location.href = `/community/view/?id=${post.id}`;
        });

        postWrapper.appendChild(titleDiv);
        postWrapper.appendChild(contentDiv);
        postWrapper.appendChild(metaDiv);
        contentContainer.appendChild(postWrapper);
    });
}
