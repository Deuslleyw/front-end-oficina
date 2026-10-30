import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/usuario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  request: LoginRequest = { email: '', senha: '' };
  erro = '';
  carregando = false;
  senhaVisivel = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  login(): void {
    if (this.carregando) {
      return;
    }

    this.erro = '';
    const email = this.request.email.trim();

    if (!email || !this.emailValido(email) || !this.request.senha) {
      this.erro = 'Informe um e-mail válido e sua senha para continuar.';
      return;
    }

    this.request.email = email;
    this.carregando = true;

    this.authService.login(this.request).subscribe({
      next: (response) => {
        this.authService.salvarToken(response);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.erro = 'Não foi possível entrar. Verifique seu e-mail e senha.';
        this.carregando = false;
      },
    });
  }

  alternarSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  private emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
