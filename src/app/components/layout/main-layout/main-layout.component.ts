import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  menuAberto = false;

  constructor(private readonly router: Router) {}

  get tituloPagina(): string {
    const path = this.router.url.split('?')[0].split('/').filter(Boolean).pop();
    const titulos: Record<string, string> = {
      dashboard: 'Dashboard',
      clientes: 'Clientes',
      veiculos: 'Veículos',
      'ordens-servico': 'Ordens de serviço',
      usuarios: 'Usuários',
    };

    return titulos[path ?? 'dashboard'] ?? 'Dashboard';
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }
  fecharMenu(): void {
    this.menuAberto = false;
  }
}
