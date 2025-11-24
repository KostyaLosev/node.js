import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/articlie.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule, RouterModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.scss'
})
export class ArticleCreate {
  private svc = inject(ArticleService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  errors: any = {};
  selectedFiles: File[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });


  save() {
  if (this.form.invalid) return;

  this.svc.create(this.form.value as any).subscribe({
    next: (article) => {
      if (this.selectedFiles.length > 0) {
        this.svc.uploadAttachments(article.id, this.selectedFiles).subscribe({
          next: () => this.router.navigate(['/']),
          error: e => console.error(e)
        });
      } else {
        this.router.navigate(['/']);
      }
    },
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

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }
}
