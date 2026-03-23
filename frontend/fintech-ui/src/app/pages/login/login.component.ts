import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  activeView: 'login' | 'register' | 'forgot' = 'login';

  // Login fields
  email = '';
  password = '';

  // Register fields
  fullName = '';
  username = '';
  regEmail = '';
  regPassword = '';

  // Forgot password
  forgotEmail = '';

  // UI state
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private api: ApiService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter your email and password.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Login success', res);
        console.log('FULL RESPONSE:', res);
        console.log('USER ID:', res.user_id);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_id', res.user_id);
        localStorage.setItem('user_name', res.full_name); // ✅ save name
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMsg = err?.error?.detail || 'Invalid email or password.';
        this.loading = false;
      }
    });
  }

  register() {
    if (!this.fullName || !this.username || !this.regEmail || !this.regPassword) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.api.register(this.fullName, this.username, this.regEmail, this.regPassword).subscribe({
      next: (res: any) => {
        console.log('Register success', res);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_id', res.user_id);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Register failed', err);
        this.errorMsg = err?.error?.detail || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
