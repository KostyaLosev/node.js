import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/articlie.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-article-edit',
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss',
})
export class ArticleEdit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ArticleService);
  private fb = inject(FormBuilder);

  errors: any = {};
  loading = signal(true);

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.svc.get(id).subscribe({
      next: article => {
        this.form.patchValue({
          title: article.title,
          content: article.content
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.update(id, this.form.value as any).subscribe({
      next: () => this.router.navigate(['/article', id]),
      error: e => {
        this.errors = {};
        const msg = e?.error?.error;

        if (typeof msg === 'string') {
          if (msg.toLowerCase().includes('title')) {
            this.errors.title = msg;
            this.form.get('title')?.setErrors({ server: msg });
          }
          if (msg.toLowerCase().includes('content')) {
            this.errors.content = msg;
            this.form.get('content')?.setErrors({ server: msg });
          }
        }
      }
    });
  }

  cancel() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.router.navigate(['/article', id]);
  }
}
