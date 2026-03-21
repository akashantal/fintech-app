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
  full_Name = '';
  username = '';
  email = '';
  password = '';

  constructor(private api: ApiService, private router: Router) {}

  register() {
    this.api.register(this.full_Name, this.username, this.email, this.password).subscribe({
      next: (res: any) => {
        console.log('Register success', res);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user_id', res.user_id);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Register failed', err);
      }
    });
  }
}