import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service';
import { OrdemServicoService } from '../../services/ordem-servico.service';


import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  totalClientes: number = 0;
  totalVeiculos: number = 0;
  ordensAbertas: number = 0;
  ordensConcluidas: number = 0;
  ordensEmAndamento: number = 0;
  ordensCanceladas: number = 0;
  carregando: boolean = true;

  constructor(
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private ordemServicoService: OrdemServicoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.clienteService.listar().subscribe({
      next: (data) => this.totalClientes = data.length
    });

    this.veiculoService.listar().subscribe({
      next: (data) => this.totalVeiculos = data.length
    });

    this.ordemServicoService.listar().subscribe({
      next: (data) => {
        this.ordensAbertas = data.filter(o => o.status === 'ABERTA').length;
        this.ordensEmAndamento = data.filter(o => o.status === 'EM_ANDAMENTO').length;
        this.ordensConcluidas = data.filter(o => o.status === 'CONCLUIDA').length;
        this.ordensCanceladas = data.filter(o => o.status === 'CANCELADA').length;
        this.carregando = false;
      }
    });
  }
}
