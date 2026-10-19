import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// PrimeNG
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    ButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  nome: string = this.authService.getNome() || '';
  perfil: string = this.authService.getPerfil() || '';
  isAdmin: boolean = this.authService.isAdmin();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Clientes',
      icon: 'pi pi-users',
      routerLink: '/clientes'
    },
    {
      label: 'Veículos',
      icon: 'pi pi-car',
      routerLink: '/veiculos'
    },
    {
      label: 'Ordens de Serviço',
      icon: 'pi pi-file',
      routerLink: '/ordens-servico'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.isAdmin) {
      this.menuItems.push({
        label: 'Usuários',
        icon: 'pi pi-user-edit',
        routerLink: '/usuarios'
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
