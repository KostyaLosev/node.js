import { Component, inject, signal, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService, Article } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss'
})
export class ArticlesList implements OnDestroy {
  private svc = inject(ArticleService);
  private router = inject(Router);
  private ws = inject(WebSocketService);

  articles = signal<Article[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

    private destroy$ = new Subject<void>();


  constructor() {
    this.load();

    this.ws.onArticleUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        alert(`Notification: ${msg.message}`);
        this.load();
      });
  }

    ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading.set(true);
    this.svc.list().subscribe({
      next: list => {
        this.articles.set(list);
        this.loading.set(false);
      },
      error: e => {
        this.error.set(e.message);
        this.loading.set(false);
      }
    });
  }

  open(id: string) {
    this.router.navigate(['/article', id]);
  }

  create() {
    this.router.navigate(['/create']);
  }

  delete(id: string, event: Event) {
    event.stopPropagation();

    if (!confirm('Delete this article?')) return;

    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: e => alert('Error: ' + e.message)
    });
  }
}
