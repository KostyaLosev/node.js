import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-register.html',
  styleUrl: './auth-register.scss',
})
export class AuthRegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  submit(): void {
    this.error.set(null);

    if (this.password().trim().length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.auth.register(this.email().trim(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Registration failed');
      },
    });
  }
}
