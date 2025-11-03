import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Article } from '../../services/articlie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss'
})
export class ArticleView {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ArticleService);

  article = signal<Article | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.get(id).subscribe({
      next: art => {
        this.article.set(art);
        this.loading.set(false);
      },
      error: e => {
        this.error.set(e.message);
        this.loading.set(false);
      }
    });
  }

  back() {
    this.router.navigate(['/']);
  }
}
