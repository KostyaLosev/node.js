import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Article, Comment } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/web-socket.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface ArticleUpdateMessage {
  articleId: string;
  message: string;
}

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss'
})
export class ArticleView implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ArticleService);
  private ws = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  article = signal<Article | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  newComment = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    this.loadArticle(id);

  this.ws.onArticleUpdated()
    .pipe(takeUntil(this.destroy$))
    .subscribe((msg: ArticleUpdateMessage) => {
      if (Number(msg.articleId) === id) {
        alert(`Article updated: ${msg.message}`);
        this.loadArticle(id);
      }
    });
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  loadArticle(id: number) {
    this.loading.set(true);
    this.svc.get(id).subscribe({
      next: (art: Article) => {
        this.article.set(art);
        this.comments.set(art.comments || []);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e.message);
        this.loading.set(false);
      }
    });
  }

  back() {
    this.router.navigate(['/']);
  }

  openFile(url: string) {
  window.open(url, '_blank');
}

edit() {
  const id = Number(this.route.snapshot.paramMap.get('id')!);
  this.router.navigate(['/article', id, 'edit']);
}

 addComment() {
   const content = this.newComment.trim();
   if (!content) return;

   const articleId = Number(this.route.snapshot.paramMap.get('id')!);
   this.svc.addComment(articleId, content).subscribe({
     next: () => {
       this.newComment = '';
       this.loadArticle(articleId);
     },
     error: e => alert('Error: ' + e.message)
   });
 }

 editComment(comment: Comment) {
   const updated = prompt('Edit comment', comment.content);
   if (updated === null) return;
   const content = updated.trim();
   if (!content) return;

   const articleId = Number(this.route.snapshot.paramMap.get('id')!);
   this.svc.updateComment(articleId, comment.id, content).subscribe({
     next: () => this.loadArticle(articleId),
     error: e => alert('Error: ' + e.message)
   });
 }

 deleteComment(comment: Comment) {
   if (!confirm('Delete this comment?')) return;

   const articleId = Number(this.route.snapshot.paramMap.get('id')!);
   this.svc.deleteComment(articleId, comment.id).subscribe({
     next: () => this.loadArticle(articleId),
     error: e => alert('Error: ' + e.message)
   });
 }
}
