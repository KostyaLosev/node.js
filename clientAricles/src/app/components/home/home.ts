import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/logic']);
    }
  }
}