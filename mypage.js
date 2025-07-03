document.getElementById('nickname').innerText = '닉네임';
document.getElementById('email').innerText = 'abcde@gmail.com';
document.getElementById('report_count').innerText = '4건';
document.getElementById('post_count').innerText = '5개';

document.getElementById('logout').addEventListener('click',function(){
    alert('로그아웃 되었습니다.');
});
document.getElementById('cancel').addEventListener('click',function(){
    alert('회원탈퇴가 완료되었습니다.');
});

const fileDOM=document.getElementById('user_profile');
const preview=document.getElementById('profile_preview');

fileDOM.addEventListener('change',()=>{
    const file = fileDOM.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
        preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
     }
});