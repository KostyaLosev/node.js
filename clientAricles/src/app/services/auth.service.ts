import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: { id: number; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly apiBase = 'http://localhost:4000/api/auth';

  private readonly tokenSignal = signal<string | null>(this.loadToken());

  readonly isAuthenticated = computed(() => !!this.tokenSignal() && this.isTokenValid(this.tokenSignal()));

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string): Observable<{ id: number; email: string }> {
    return this.http.post<{ id: number; email: string }>(`${this.apiBase}/register`, { email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/login`, { email, password }).pipe(
      tap(response => this.setToken(response.token))
    );
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.ensureValidToken() ? this.tokenSignal() : null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.tokenSignal.set(token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenSignal.set(null);
  }

  private loadToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!this.isTokenValid(token)) {
      localStorage.removeItem(this.tokenKey);
      return null;
    }
    return token;
  }

  private ensureValidToken(): boolean {
    const token = this.tokenSignal();
    if (!this.isTokenValid(token)) {
      this.clearToken();
      return false;
    }
    return true;
  }

  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = this.decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 > Date.now();
  }

  private decodeToken(token: string): { exp?: number } | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
