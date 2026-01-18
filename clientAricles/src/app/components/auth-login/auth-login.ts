import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-login.html',
  styleUrl: './auth-login.scss',
})
export class AuthLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  submit(): void {
    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/logic']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Login failed');
      },
    });
  }
}
