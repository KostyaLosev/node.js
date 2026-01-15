import { Component, inject, signal, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, Attachment, Workspace } from '../../services/articlie.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { WebSocketService } from '../../services/web-socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-article-edit',
  imports: [CommonModule, ReactiveFormsModule, QuillModule, MatSnackBarModule],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss',
})
export class ArticleEdit implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ArticleService);
  private fb = inject(FormBuilder);
  private ws = inject(WebSocketService);
  uploadError = signal<string | null>(null);
  private destroy$ = new Subject<void>();
  private snackBar = inject(MatSnackBar);
  workspaces = signal<Workspace[]>([]);

  errors: any = {};
  loading = signal(true);

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    workspaceId: ['', Validators.required]
  });

    existingAttachments = signal<Attachment[]>([]);
  selectedFiles: File[] = [];

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    this.loadWorkspaces();
    this.load(id);

      this.ws.onArticleUpdated()
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        if (Number(msg.articleId) === id) {
          this.showSuccess(`Article updated: ${msg.message}`);
          this.load(id);
        }
      });
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

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

  load(id: number) {
    this.svc.get(id).subscribe({
      next: article => {
        this.form.patchValue({
          title: article.title,
          content: article.content,
          workspaceId: String(article.workspaceId)
        });
        this.existingAttachments.set(article.attachments || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

    onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

    removeAttachment(filename: string) {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    if (!confirm('Remove this attachment?')) return;

    this.svc.deleteAttachment(id, filename).subscribe({
      next: article => this.existingAttachments.set(article.attachments || []),
      error: e => this.showError('Error: ' + e.message)
    });
  }

  save() {
    if (this.form.invalid) return;

    const id = Number(this.route.snapshot.paramMap.get('id')!);
    const { title, content, workspaceId } = this.form.value as { title: string; content: string; workspaceId: string };
    const updateData = { title, content, workspaceId: Number(workspaceId) };

    this.svc.update(id, updateData).subscribe({
      next: () => {
        if (this.selectedFiles.length > 0) {
          this.svc.uploadAttachments(id, this.selectedFiles).subscribe({
            next: () => {
              this.showSuccess('Article and attachments saved successfully!');
              this.router.navigate(['/article', id]);
            },
            error: err => this.uploadError.set(err.error?.error || 'Upload failed')
          });
        } else {
          this.showSuccess('Article saved successfully!');
          this.router.navigate(['/article', id]);
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
        if (!msg) this.showError('Failed to save article');
      }
    });
  }

  cancel() {
    const id = Number(this.route.snapshot.paramMap.get('id')!);
    this.router.navigate(['/article', id]);
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
}
