import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/articlie.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.scss'
})
export class ArticleCreate {
  private svc = inject(ArticleService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });

  save() {
    if (this.form.invalid) return;

    this.svc.create(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/']),
      error: e => alert('Error: ' + e.message)
    });
  }
}
