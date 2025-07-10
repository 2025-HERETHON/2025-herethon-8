document.addEventListener("DOMContentLoaded", function () {
    fetchPostList();
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
            renderPostList(data);
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
        contentContainer.innerHTML = "<p>게시글이 없습니다.</p>";
        return;
    }

    posts.forEach(post => {
        const postWrapper = document.createElement("div");
        postWrapper.className = "content-main";

        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.innerText = post.title;

        const contentDiv = document.createElement("div");
        contentDiv.className = "content post-content";  // 세부 구분 위해 추가 클래스
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

