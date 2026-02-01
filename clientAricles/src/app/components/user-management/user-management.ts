import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, ManagedUser } from '../../services/users.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagementComponent {
  private usersService = inject(UsersService);

  users = signal<ManagedUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal<number | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.usersService.list().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  updateRole(user: ManagedUser, role: 'admin' | 'user') {
    if (user.role === role) return;

    this.saving.set(user.id);
    this.usersService.updateRole(user.id, role).subscribe({
      next: (updated) => {
        this.users.set(
          this.users().map((item) => (item.id === updated.id ? updated : item))
        );
        this.saving.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to update role');
        this.saving.set(null);
      },
    });
  }
}
