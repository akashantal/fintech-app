import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'http://localhost:8000';  // remove trailing slash

  constructor(private http: HttpClient) {}

  register(email: string, password: string, full_Name: string) {
    return this.http.post(`${this.baseUrl}/auth/register`, { 
      email, 
      password, 
      full_name: full_Name 
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