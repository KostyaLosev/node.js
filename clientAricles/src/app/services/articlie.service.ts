import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  url?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private base = 'http://localhost:4000/api/articles';
  private uploadBase = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  list(): Observable<Article[]> {
    return this.http.get<Article[]>(this.base);
  }

  get(id: string): Observable<Article> {
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

  create(data: { title: string; content: string }): Observable<Article> {
    return this.http.post<Article>(this.base, data);
  }

  update(id: string, data: { title: string; content: string }): Observable<Article> {
    return this.http.put<Article>(`${this.base}/${id}`, data);
  }

  uploadAttachments(articleId: string, files: File[]): Observable<Article> {
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

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
