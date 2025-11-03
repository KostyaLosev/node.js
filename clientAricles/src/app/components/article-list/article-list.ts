import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService, Article } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss'
})
export class ArticlesList {
  private svc = inject(ArticleService);
  private router = inject(Router);

  articles = signal<Article[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.load();
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
}
