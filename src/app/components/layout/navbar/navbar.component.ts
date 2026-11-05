import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly nome = this.authService.getNome() || 'Usuário';
  readonly perfil = this.authService.isAdmin() ? 'Administrador' : 'Usuário';

  constructor(private readonly authService: AuthService) {}
}
