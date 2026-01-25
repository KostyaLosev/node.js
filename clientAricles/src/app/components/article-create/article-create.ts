import { Component, inject, signal  } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService, Workspace } from '../../services/articlie.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule, RouterModule,MatSnackBarModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.scss'
})
export class ArticleCreate {
  private svc = inject(ArticleService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  uploadError = signal<string | null>(null);
  workspaces = signal<Workspace[]>([]);

  errors: any = {};
  selectedFiles: File[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    workspaceId: ['', Validators.required]
  });

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }


  constructor() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.svc.listWorkspaces().subscribe({
      next: list => {
        this.workspaces.set(list);
        if (list.length > 0 && !this.form.value.workspaceId) {
          this.form.patchValue({ workspaceId: String(list[0].id) });
        }
      },
      error: err => {
        this.showError(err.message);
      }
    });
  }

    save() {
    if (this.form.invalid) return;
    const { title, content, workspaceId } = this.form.value as { title: string; content: string; workspaceId: string };
    const payload = { title, content, workspaceId: Number(workspaceId) };

    this.svc.create(payload).subscribe({
      next: (article) => {
        if (this.selectedFiles.length > 0) {
          this.svc.uploadAttachments(article.id, this.selectedFiles).subscribe({
            next: () => {
              this.showSuccess('Article and attachments created successfully!');
              this.router.navigate(['/']);
            },
            error: err => {
              this.showError(err.error?.error || 'Failed to upload attachments');
            }
          });
        } else {
          this.showSuccess('Article created successfully!');
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
          if (msg.toLowerCase().includes('workspace')) {
            this.errors.workspaceId = msg;
            this.form.get('workspaceId')?.setErrors({ server: msg });
          }
          if (msg.toLowerCase().includes('content')) {
            this.errors.content = msg;
            this.form.get('content')?.setErrors({ server: msg });
          }
        }

        if (!msg) this.showError('Failed to create article');
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }
}
