import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
  }

  salvarToken(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('nome', response.nome);
    localStorage.setItem('perfil', response.perfil);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getNome(): string | null {
    return localStorage.getItem('nome');
  }

  getPerfil(): string | null {
    return localStorage.getItem('perfil');
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMIN';
  }

  isLogado(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('perfil');
  }
}
