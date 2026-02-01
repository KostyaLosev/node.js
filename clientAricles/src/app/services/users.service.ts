import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManagedUser {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) {}

  list(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.base);
  }

  updateRole(id: number, role: 'admin' | 'user'): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(`${this.base}/${id}/role`, { role });
  }
}
