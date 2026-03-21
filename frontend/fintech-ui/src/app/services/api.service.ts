import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  register(full_name: string, username: string, email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      full_name,
      username,
      email,
      password
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  getBalance(userId: number) {
    return this.http.get(`${this.baseUrl}/wallet/balance/${userId}`);
  }

  sendMoney(data: any) {
    return this.http.post(`${this.baseUrl}/transfer`, data);
  }

  getTransactions(userId: number) {
    return this.http.get(`${this.baseUrl}/transactions/${userId}`);
  }
}