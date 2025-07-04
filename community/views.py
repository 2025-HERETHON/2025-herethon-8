from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.views import View

from .models import Post, Comment
from .forms import PostForm, CommentForm

# 게시글 리스트 조회
@login_required
def community_list_view(request):
    posts = Post.objects.all().order_by('-created_at')
    return render(request, 'community_list.html', {'posts': posts})



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
            return redirect('community:community_list')
    else:
        form = PostForm()
    return render(request, 'post_form.html', {'form': form})


# 게시글 상세
@method_decorator(login_required, name='dispatch')
class PostDetailView(View):
    # 게시글 상세 조회
    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        post.views += 1
        post.save(update_fields=['views'])

        comments = Comment.objects.filter(
            post=post,
            parent__isnull=True
        ).prefetch_related('replies').order_by('-created_at')

        form = CommentForm()

        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
        })
    def post(self, request, pk):
        # 게시글 수정
        post = get_object_or_404(Post, pk=pk, user=request.user)
        form = PostForm(request.POST, instance=post)
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
        return redirect('community:community_list')


# 댓글
@method_decorator(login_required, name='dispatch')
class CommentView(View):
    # 댓글 조회
    def get(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        comments = Comment.objects.filter(
            post=post,
            parent__isnull=True
        ).prefetch_related('replies').order_by('-created_at')

        edit_comment_id = request.GET.get('edit')
        form = CommentForm()
        if edit_comment_id:
            try:
                edit_comment = Comment.objects.get(pk=edit_comment_id, user=request.user)
                form = CommentForm(instance=edit_comment)
            except Comment.DoesNotExist:
                messages.error(request, "권한이 없습니다.")
                return redirect('community:post_detail', post_pk=post.pk)

        return render(request, 'post_detail.html', {
            'post': post,
            'comments': comments,
            'form': form,
            'edit_comment_id': edit_comment_id,
        })

    # 댓글 작성, 수정
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


# 댓글 삭제
@method_decorator([login_required, require_http_methods(["POST"])], name='dispatch')
class CommentDeleteView(View):
    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, user=request.user)
        post_id = comment.post.pk
        comment.delete()
        messages.success(request, "댓글이 삭제되었습니다.")
        return redirect('community:post_detail', pk=post_id)

#게시글 공감

@login_required
def like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user = request.user
    
    if user in post.like.all():
        post.like.remove(user)
    else:
        post.like.add(user)
    return redirect('community:post_detail', pk=post_id)