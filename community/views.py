from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.views import View
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .forms import PostForm
from .models import Post, Comment
from .forms import PostForm, CommentForm

# 게시글 리스트 조회
@login_required 
def community_list_view(request):
    posts = Post.objects.all().order_by('-created_at')
    # return render(request, 'community_list.html', {'posts': posts}) #FE: json으로 파싱하기 위해 json 응답 처리로 변경
    post_list = []
    for post in posts:
        user = post.user

        nickname = getattr(user, 'nickname', user.username)  # 유저 모델에 nickname 있으면 사용, 없으면 username
        created_at = post.created_at.isoformat() if post.created_at else ""
    data = [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "nickname": nickname,
            "created_at": post.created_at.isoformat(),
            "views": post.views,
            "like": post.like.count(),
            "user_id": user.id, 
            "comments": [],  # 댓글은 필요 시
            "comment_count": post.comments.count(), #FE: 댓글 카운트 추가 
        }
        for post in posts
    ]
    return JsonResponse(data, safe=False)

#FE: community.html(게시글 리스트) 템플릿 렌더링 용 
def community_template_view(request):
    return render(request, 'frontend/pages/community.html')

#FE: community_view.html(상세보기) 템플릿 렌더링 용
def community_view_template_view(request):
    return render(request, 'frontend/pages/community_view.html')

# FE: community_new.html(게시글 작성) 템플릿 렌더링 용
def community_new_template_view(request):
    return render(request, 'frontend/pages/community_new.html')

# 게시글 작성
@login_required
def post_create_view(request):
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            messages.success(request, "게시글이 작성되었습니다.")
            # return redirect('community:community_list') FE 수정 302번 대신 Json 파싱
            return JsonResponse({"message": "success"}) 
    else:
        form = PostForm()
    # return render(request, 'post_form.html', {'form': form})
    return JsonResponse({"message": "invalid", "errors": form.errors}, status=400)



# 게시글 상세 및 수정 json 변경
# @method_decorator(login_required, name='dispatch')
# class PostDetailView(View):
#     def get(self, request, pk):
#         post = get_object_or_404(Post, pk=pk)
#         post.views += 1
#         post.save(update_fields=['views'])

#         comments = Comment.objects.filter(post=post, parent__isnull=True).prefetch_related('replies').order_by('-created_at')
#         form = CommentForm()

#         # 수정 폼 요청 시
#         if request.GET.get('edit') == 'true' and post.user == request.user:
#             form = PostForm(instance=post)
#             return render(request, 'post_form.html', {
#                 'form': form,
#                 'post': post,
#             })

#         return render(request, 'post_detail.html', {
#             'post': post,
#             'comments': comments,
#             'form': form,
#         })
@method_decorator(login_required, name='dispatch')
class PostDetailView(View):
    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        post.views += 1
        post.save(update_fields=['views'])

        comments_qs = Comment.objects.filter(post=post, parent__isnull=True).prefetch_related('replies', 'user', 'replies__user').order_by('-created_at')
        comments_data = []
        for comment in comments_qs:
            replies_data = [
                {
                    "id": reply.id,
                    "nickname": getattr(reply.user, 'nickname', reply.user.username),
                    "is_anonymous": reply.is_anonymous,
                    "content": reply.content,
                    "created_at": reply.created_at.isoformat(),
                }
                for reply in comment.replies.all()
            ]
            comments_data.append({
                "id": comment.id,
                "nickname": getattr(comment.user, 'nickname', comment.user.username),
                "is_anonymous": comment.is_anonymous,
                "content": comment.content,
                "created_at": comment.created_at.isoformat(),
                "replies": replies_data
            })

        data = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "nickname": getattr(post.user, 'nickname', ''),
            "created_at": post.created_at.isoformat(),
            "views": post.views,
            "like": post.like.count(),
            "comments": comments_data
        }

        return JsonResponse(data)
    
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk, user=request.user)
        form = PostForm(request.POST, request.FILES, instance=post)

        if request.POST.get('delete_photo') == 'true':
            if post.photo:
                post.photo.delete(save=False)
                post.photo = None

        if form.is_valid():
            form.save()
            messages.success(request, "게시글이 수정되었습니다.")
            return redirect('community:post_detail', pk=pk)

        return render(request, 'post_form.html', {'form': form, 'post': post})

# 게시글 삭제
@method_decorator(login_required, name='dispatch')
class PostDeleteView(View):
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk, user=request.user)
        post.delete()
        messages.success(request, "게시글이 삭제되었습니다.")
        return redirect('/community/page/')

# 댓글
@method_decorator(login_required, name='dispatch')
class CommentView(View):
    def get(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        comments = Comment.objects.filter(post=post, parent__isnull=True)\
            .select_related('user')\
            .prefetch_related('replies')\
            .order_by('-created_at')

        edit_comment_id = request.GET.get('edit')
        form = CommentForm()
        if edit_comment_id:
            try:
                edit_comment = Comment.objects.get(pk=edit_comment_id, user=request.user)
                form = CommentForm(instance=edit_comment)
            except Comment.DoesNotExist:
                messages.error(request, "권한이 없습니다.")
                return redirect('community:post_detail', pk=post.pk)

        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
            'edit_comment_id': edit_comment_id,
        })

    def post(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        edit_comment_id = request.GET.get('edit')
        parent_id = request.POST.get('parent')

        if edit_comment_id:
            comment = get_object_or_404(Comment, pk=edit_comment_id, user=request.user)
            form = CommentForm(request.POST, instance=comment)
        else:
            form = CommentForm(request.POST)

        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post

            if parent_id:
                parent = Comment.objects.filter(pk=parent_id, post=post).first()
                if parent:
                    if parent.parent is not None:
                        messages.error(request, "답글에는 다시 답글을 달 수 없습니다.")
                        return redirect('community:post_detail', pk=post.pk)
                    comment.parent = parent

            comment.save()
            msg = "댓글이 수정되었습니다." if edit_comment_id else "댓글이 작성되었습니다."
            messages.success(request, msg)
            return redirect('community:post_detail', pk=post.pk)

        comments = Comment.objects.filter(post=post, parent__isnull=True).order_by('-created_at')
        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
            'edit_comment_id': edit_comment_id,
        })
#FE: 댓글 json 응답 변환
@method_decorator(login_required, name='dispatch')
class CommentView(View):
    def get(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        comments = Comment.objects.filter(post=post, parent__isnull=True).prefetch_related('replies').order_by('-created_at')

        edit_comment_id = request.GET.get('edit')
        form = CommentForm()
        if edit_comment_id:
            try:
                edit_comment = Comment.objects.get(pk=edit_comment_id, user=request.user)
                form = CommentForm(instance=edit_comment)
            except Comment.DoesNotExist:
                messages.error(request, "권한이 없습니다.")
                return redirect('community:post_detail', pk=post.pk)

        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
            'edit_comment_id': edit_comment_id,
        })

    def post(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        edit_comment_id = request.GET.get('edit')
        parent_id = request.POST.get('parent') or request.POST.get('parent_id')  # JSON 요청일 수도 있으니 유연하게 처리

        # JSON 요청인지 확인
        is_ajax = request.headers.get('x-requested-with') == 'XMLHttpRequest'

        # JSON 또는 form 요청 구분
        if request.content_type == 'application/json':
            import json
            data = json.loads(request.body)
            form = CommentForm(data)
        elif edit_comment_id:
            comment = get_object_or_404(Comment, pk=edit_comment_id, user=request.user)
            form = CommentForm(request.POST, instance=comment)
        else:
            form = CommentForm(request.POST)

        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post

            if parent_id:
                parent = Comment.objects.filter(pk=parent_id, post=post).first()
                if parent:
                    if parent.parent is not None:
                        if is_ajax:
                            return JsonResponse({"messages": "답글에는 다시 답글을 달 수 없습니다."}, status=400)
                        messages.error(request, "답글에는 다시 답글을 달 수 없습니다.")
                        return redirect('community:post_detail', pk=post.pk)
                    comment.parent = parent

            comment.save()

            if is_ajax:
                return JsonResponse({"messages": "댓글이 작성되었습니다."})
            else:
                messages.success(request, "댓글이 작성되었습니다.")
                return redirect('community:post_detail', pk=post.pk)

        # 폼이 유효하지 않은 경우
        if is_ajax:
            return JsonResponse({"messages": "댓글 작성 실패", "errors": form.errors}, status=400)

        # 일반 요청 처리
        comments = Comment.objects.filter(post=post, parent__isnull=True).order_by('-created_at')
        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
            'edit_comment_id': edit_comment_id,
        })

# 댓글 삭제
@method_decorator([login_required, require_http_methods(["POST"])], name='dispatch')
class CommentDeleteView(View):
    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, user=request.user)
        post_id = comment.post.pk
        comment.delete()
        messages.success(request, "댓글이 삭제되었습니다.")
        return redirect('community:post_detail', pk=post_id)

# 게시글 공감
@login_required
def like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user = request.user

    if user in post.like.all():
        post.like.remove(user)
    else:
        post.like.add(user)
    return redirect('community:post_detail', pk=post_id)

#FE: 게시글 공감 
@login_required
def like_ajax(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user = request.user

    if user in post.like.all():
        post.like.remove(user)
        liked = False
    else:
        post.like.add(user)
        liked = True

    return JsonResponse({
        "liked": liked,
        "like_count": post.like.count()
    })