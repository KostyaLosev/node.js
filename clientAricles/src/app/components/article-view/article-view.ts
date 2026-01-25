import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Article, Comment, ArticleVersion } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/web-socket.service';
import { takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';

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
  versions = signal<ArticleVersion[]>([]);
  selectedVersion = signal<number | null>(null);
  versionSelectValue = '';
  currentArticleId: number | null = null;
  loading = signal(true);
  error = signal<string | null>(null);
  newComment = '';

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, query]) => {
        const id = Number(params.get('id'));
        this.currentArticleId = id;
        const versionParam = query.get('version');
        const parsedVersion = versionParam ? Number(versionParam) : null;
        const version = parsedVersion !== null && Number.isInteger(parsedVersion) && parsedVersion > 0 ? parsedVersion : null;
        this.selectedVersion.set(version);
        this.versionSelectValue = version !== null ? String(version) : '';
        this.loadArticle(id, this.selectedVersion());
        this.loadVersions(id);
      });

    this.ws.onArticleUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg: ArticleUpdateMessage) => {
        if (this.currentArticleId && Number(msg.articleId) === this.currentArticleId) {
          alert(`Article updated: ${msg.message}`);
          this.loadVersions(this.currentArticleId);
          this.loadArticle(this.currentArticleId, this.selectedVersion());
        }
      });
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  loadArticle(id: number, version?: number | null) {
    this.loading.set(true);
    this.svc.get(id, version).subscribe({
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

  loadVersions(id: number) {
    this.svc.listVersions(id).subscribe({
      next: list => this.versions.set(list),
      error: () => this.versions.set([]),
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

isOldVersion(): boolean {
  const article = this.article();
  if (!article || !article.version || !article.currentVersion) return false;
  return article.version < article.currentVersion;
}

  changeVersion(value: string) {
    this.versionSelectValue = value;
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    const parsed = value ? Number(value) : null;
    const version = parsed !== null && Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    this.router.navigate(['/article', id], { queryParams: version ? { version } : {} });
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
