import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-send-money',
  templateUrl: './send-money.component.html',
  styleUrls: ['./send-money.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class SendMoneyComponent {

  receiver_id!: number;
  amount!: number;

  constructor(private api: ApiService) {}

  send() {
    const sender_id = Number(localStorage.getItem('user_id'));

    this.api.sendMoney({
      sender_id,
      receiver_id: this.receiver_id,
      amount: this.amount
    }).subscribe(() => {
      alert('Payment successful');
    });
  }
}
