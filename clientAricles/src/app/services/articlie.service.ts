import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  url?: string;
}

export interface Workspace {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  workspaceId: number;
  workspace?: Workspace | null;
  attachments?: Attachment[];
  comments?: Comment[];
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private base = 'http://localhost:4000/api/articles';
  private uploadBase = 'http://localhost:4000';
  private workspacesBase = 'http://localhost:4000/api/workspaces';

  constructor(private http: HttpClient) {}

  list(workspaceId?: number | null): Observable<Article[]> {
    let params = new HttpParams();
    if (workspaceId) {
      params = params.set('workspaceId', String(workspaceId));
    }
    return this.http.get<Article[]>(this.base, { params });
  }

  listWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.workspacesBase);
  }

  get(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.base}/${id}`).pipe(
      map(article => {
        if (article.attachments) {
          article.attachments = article.attachments.map(f => ({
            ...f,
            url: `${this.uploadBase}${f.path}`
          }));
        }
        return article;
      })
    );
  }

  create(data: { title: string; content: string; workspaceId: number }): Observable<Article> {
    return this.http.post<Article>(this.base, data);
  }

  update(id: number, data: { title: string; content: string; workspaceId: number }): Observable<Article> {
    return this.http.put<Article>(`${this.base}/${id}`, data);
  }

  uploadAttachments(articleId: number, files: File[]): Observable<Article> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<Article>(`${this.base}/${articleId}/attachments`, formData).pipe(
      map(article => {
        if (article.attachments) {
          article.attachments = article.attachments.map(f => ({
            ...f,
            url: `${this.uploadBase}${f.path}`
          }));
        }
        return article;
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  deleteAttachment(articleId: number, filename: string): Observable<Article> {
    return this.http.delete<Article>(`${this.base}/${articleId}/attachments/${filename}`).pipe(
        map(article => {
            if (article.attachments) {
                article.attachments = article.attachments.map(f => ({
                    ...f,
                    url: `${this.uploadBase}${f.path}`
                }));
            }
            return article;
        })
    );
  }

  listComments(articleId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/${articleId}/comments`);
  }

  addComment(articleId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.base}/${articleId}/comments`, { content });
  }

  updateComment(articleId: number, commentId: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.base}/${articleId}/comments/${commentId}`, { content });
  }

  deleteComment(articleId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${articleId}/comments/${commentId}`);
  }
}
