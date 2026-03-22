import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class TransactionsComponent implements OnInit {

  transactions: any[] = [];
  currentUserId: number = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.currentUserId = Number(localStorage.getItem('user_id'));

    this.api.getTransactions(this.currentUserId).subscribe((res: any) => {
      this.transactions = res.transactions;
    });
  }
}