import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() aberto = false;
  @Output() navegacao = new EventEmitter<void>();
  nome = this.authService.getNome() || 'Usuário';
  perfil = this.authService.getPerfil() === 'ADMIN' ? 'Administrador' : 'Usuário';
  readonly isAdmin = this.authService.isAdmin();
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard' },
    { label: 'Clientes', icon: 'pi pi-users', routerLink: '/clientes' },
    { label: 'Veículos', icon: 'pi pi-car', routerLink: '/veiculos' },
    {
      label: 'Ordens de serviço',
      icon: 'pi pi-file-edit',
      routerLink: '/ordens-servico',
    },
  ];
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    if (this.isAdmin)
      this.menuItems.push({
        label: 'Usuários',
        icon: 'pi pi-cog',
        routerLink: '/usuarios',
      });
  }
  onNavigate(): void {
    this.navegacao.emit();
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
