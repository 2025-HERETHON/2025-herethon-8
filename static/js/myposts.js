const fakePosts = [
  {
    title: "강남역에 이상한 사람이 있어요",
    content: "어제 밤 11시쯤 강남역에서 집까지 걸어갔는데, 이상한 사람이 있었습니다.",
    likes: 3,
    comments: 2
  },
  {
    title: "가로등이 부족합니다",
    content: "밤길이 너무 어두워서 위험합니다.",
    likes: 5,
    comments: 1
  },
  {
    title: "길거리 음식 맛집 추천해주세요",
    content: "강남역 근처 맛집 추천 부탁드립니다.",
    likes: 1,
    comments: 0
  }
]; 

const post_search = document.getElementById('post_search');


//게시물 검색
function Searchposts(){
post_search.addEventListener('input', () => {
    const keyword = post_search.value.toLowerCase();
    const posts = document.querySelectorAll('.post_content');
 
    posts.forEach(post => {
    const title = post.querySelector('h2').innerText.toLowerCase();
    const content = post.querySelector('p').innerText.toLowerCase();

    if (title.includes(keyword) || content.includes(keyword)) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none'; 
    }
  });
});
}
/*
//게시물 데이터 가져오기
fetch('https://api.example.com/posts')   
  .then(response => response.json())
  .then(data => {
    Plusposts(data);
    Searchposts();
  })
  .catch(error => {
    console.error('데이터 가져오기 실패:', error);
  });

Searchposts(fakePosts);
*/