import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private base = 'http://localhost:4000/api/articles';

  constructor(private http: HttpClient) {}

  list(): Observable<Article[]> {
    return this.http.get<Article[]>(this.base);
  }

  get(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/${id}`);
  }

  create(data: { title: string; content: string }): Observable<Article> {
    return this.http.post<Article>(this.base, data);
  }
}
