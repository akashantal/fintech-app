import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule ,HttpHeaders} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionsComponent } from '../transactions/transactions.component';

interface Wallet {
  id: number;
  user_id: number;
  balance: number;
}
interface WalletResponse {
  message: string;
  created: boolean;
  wallet: Wallet;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  balance = 0;
  amount = 0;
  is_loading = false;
  transactions: any[] = [];
  userId: number = 0;
  constructor(private api: ApiService, private http: HttpClient, private router: Router) {}

  receiver_id: number = 0;
  transfer_amount: number = 0;

  getAuthHeaders() {
  return new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  ngOnInit() {
    this.userId = Number(localStorage.getItem('user_id'));
    const token = localStorage.getItem('token'); // token check for authentication
    
    if (!token) {
    this.router.navigate(['/login']);  // 🔒 block access
    return;
  }
    this.createWallet(); // 🔥 auto-create wallet on dashboard load

  }

  createWallet() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('User ID not found');
      return;
    }
    this.http.get<WalletResponse>(`http://localhost:8000/wallet/create/${userId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (res) => {
        if(res.created) {
          console.log('Wallet created:', res.wallet);
        } else {
          console.log('Wallet already exists:', res.wallet);
        }
        this.loadBalance(); // 🔥 refresh balance after wallet creation
        this.loadTransactions();
      },
      error: (err) => {
        console.error(err);
        console.log('Wallet may already exist');
        this.loadBalance();
        this.loadTransactions();
      },
    });
  }

  isDark = false;

  toggleDarkMode() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode');
  }

  transferMoney() {
    const sender_id = Number(localStorage.getItem('user_id'));
    if (!sender_id || !this.receiver_id || !this.transfer_amount) {
      alert('Enter valid details');
      return;
    }

    this.http.post<any>(
       `http://localhost:8000/transactions/transfer/${sender_id}/${this.receiver_id}`,
     {headers: this.getAuthHeaders(), amount: this.transfer_amount }
      ).subscribe({
      next: () => {
        alert('Payment successful');
        this.loadBalance(); // 🔥 refresh balance after transfer
        this.receiver_id = 0;
        this.transfer_amount = 0;
      },
      error: (err) => console.error(err),
      complete: () => {
        this.loadTransactions();
      }
    });
  } 

  loadBalance() {
    this.is_loading = true;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    this.http.get<{ balance: number }>(`http://localhost:8000/wallet/balance/${userId}`)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.balance = res.balance;
          this.is_loading = false;
        },
        error: (err) => {
          console.error(err);
          this.is_loading = false;
        }
      });
  }

  addMoney() {
    const userId = localStorage.getItem('user_id');
    this.is_loading = true;
    if (!userId || !this.amount) {
      alert('Enter valid amount');
      this.is_loading = false;
      return;
    }

      this.http.post<any>(`http://localhost:8000/wallet/add-money/${userId}`, {
        headers: this.getAuthHeaders(),
        amount: this.amount
      }).subscribe({
        next: (res) => {
          console.log('Money added:', res);
          alert('Money added successfully');

          this.loadBalance(); // 🔥 refresh balance
          this.is_loading = false;
          this.amount = 0;
        },
        error: (err) => {
          console.error(err);
          this.is_loading = false;
        }
      });
  }
  loadTransactions() {
    this.is_loading = true;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    this.http.get<any>(`http://localhost:8000/transactions/history/${userId}`)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.transactions = res.transactions;
          this.is_loading = false;
        },
        error: (err) => {
          console.error(err);
          this.is_loading = false;
        }
      });
  }

  logout(){
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      this.router.navigate(['/login']);
    }
}