import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

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
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userName : string = '';
  balance = 0;
  amount = 0;
  receiver_id = 0;
  transfer_amount = 0;
  is_loading = false;
  transactions: any[] = [];
  userId = 0;
  initials = 'U';
  greeting = 'morning';

  // Computed stats
  totalSent = 0;
  totalReceived = 0;
  sentCount = 0;
  receivedCount = 0;

  // Feedback messages
  addMoneySuccess = '';
  addMoneyError = '';
  transferSuccess = '';
  transferError = '';

  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = Number(localStorage.getItem('user_id'));
    this.userName = localStorage.getItem('user_name') || 'User';
    this.setGreeting();
    this.createWallet();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'morning';
    else if (hour < 17) this.greeting = 'afternoon';
    else this.greeting = 'evening';
  }

  getAuthHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  createWallet() {
    this.http.get<WalletResponse>(
      `${this.baseUrl}/wallet/create/${this.userId}`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        this.loadBalance();
        this.loadTransactions();
      },
      error: () => {
        this.loadBalance();
        this.loadTransactions();
      }
    });
  }

  loadBalance() {
    this.http.get<{ balance: number }>(
      `${this.baseUrl}/wallet/balance/${this.userId}`
    ).subscribe({
      next: (res) => { this.balance = res.balance; },
      error: (err) => console.error(err)
    });
  }

  addMoney() {
    this.addMoneySuccess = '';
    this.addMoneyError = '';
    if (!this.amount || this.amount <= 0) {
      this.addMoneyError = 'Please enter a valid amount.';
      return;
    }
    this.is_loading = true;
    this.http.post<any>(
      `${this.baseUrl}/wallet/add-money/${this.userId}`,
      { amount: this.amount },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (res) => {
        this.addMoneySuccess = `Successfully added ₹${this.amount}`;
        this.amount = 0;
        this.is_loading = false;
        this.loadBalance();
        this.loadTransactions();
        setTimeout(() => this.addMoneySuccess = '', 4000);
      },
      error: (err) => {
        this.addMoneyError = err?.error?.detail || 'Failed to add money.';
        this.is_loading = false;
      }
    });
  }

  transferMoney() {
    this.transferSuccess = '';
    this.transferError = '';
    if (!this.receiver_id || !this.transfer_amount || this.transfer_amount <= 0) {
      this.transferError = 'Please enter valid receiver ID and amount.';
      return;
    }
    if (this.receiver_id === this.userId) {
      this.transferError = 'You cannot transfer to yourself.';
      return;
    }
    this.is_loading = true;
    this.http.post<any>(
      `${this.baseUrl}/transactions/transfer/${this.userId}/${this.receiver_id}`,
      { amount: this.transfer_amount },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.transferSuccess = `Successfully sent ₹${this.transfer_amount}`;
        this.receiver_id = 0;
        this.transfer_amount = 0;
        this.is_loading = false;
        this.loadBalance();
        this.loadTransactions();
        setTimeout(() => this.transferSuccess = '', 4000);
      },
      error: (err) => {
        this.transferError = err?.error?.detail || 'Transfer failed. Check receiver ID and balance.';
        this.is_loading = false;
      }
    });
  }

  loadTransactions() {
    this.http.get<any>(
      `${this.baseUrl}/transactions/history/${this.userId}`
    ).subscribe({
      next: (res) => {
        this.transactions = res.transactions;
        this.computeStats();
      },
      error: (err) => console.error(err)
    });
  }

  computeStats() {
    this.totalSent = 0;
    this.totalReceived = 0;
    this.sentCount = 0;
    this.receivedCount = 0;
    for (const tx of this.transactions) {
      if (tx.sender_id === this.userId) {
        this.totalSent += tx.amount;
        this.sentCount++;
      }
      if (tx.receiver_id === this.userId) {
        this.totalReceived += tx.amount;
        this.receivedCount++;
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    this.router.navigate(['/login']);
  }
}
