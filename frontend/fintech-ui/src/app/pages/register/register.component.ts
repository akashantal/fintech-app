import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  full_Name = '';

  constructor(private api: ApiService, private router: Router) {}

  register() {
    this.api.register(this.email, this.password, this.full_Name).subscribe({
      next: (res: any) => {
        console.log('Register success', res);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_id', res.user_Id);

        // 👉 After register, go to login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Register failed', err);
      }
    });
  }
}