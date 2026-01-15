import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Article } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadArticle(id);

  this.ws.onArticleUpdated()
    .pipe(takeUntil(this.destroy$))
    .subscribe((msg: ArticleUpdateMessage) => {
      if (msg.articleId === id) {
        alert(`Article updated: ${msg.message}`);
        this.loadArticle(id);
      }
    });
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  loadArticle(id: string) {
    this.loading.set(true);
    this.svc.get(id).subscribe({
      next: (art: Article) => {
        this.article.set(art);
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
  const id = this.route.snapshot.paramMap.get('id')!;
  this.router.navigate(['/article', id, 'edit']);
}
}
