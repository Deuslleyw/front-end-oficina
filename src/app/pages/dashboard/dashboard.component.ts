import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service';
import { OrdemServicoService } from '../../services/ordem-servico.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalClientes: number | null = null;
  totalVeiculos: number | null = null;
  ordensAbertas: number | null = null;
  ordensConcluidas: number | null = null;
  ordensEmAndamento: number | null = null;
  ordensCanceladas: number | null = null;
  carregando = true;
  erroCarregamento = false;

  constructor(
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private ordemServicoService: OrdemServicoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erroCarregamento = false;

    forkJoin({
      clientes: this.clienteService.listar().pipe(
        catchError(() => {
          this.erroCarregamento = true;
          return of(null);
        }),
      ),
      veiculos: this.veiculoService.listar().pipe(
        catchError(() => {
          this.erroCarregamento = true;
          return of(null);
        }),
      ),
      ordens: this.ordemServicoService.listar().pipe(
        catchError(() => {
          this.erroCarregamento = true;
          return of(null);
        }),
      ),
    })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe(({ clientes, veiculos, ordens }) => {
        this.totalClientes = clientes?.length ?? null;
        this.totalVeiculos = veiculos?.length ?? null;
        this.ordensAbertas = ordens?.filter((ordem) => ordem.status === 'ABERTA').length ?? null;
        this.ordensEmAndamento = ordens?.filter((ordem) => ordem.status === 'EM_ANDAMENTO').length ?? null;
        this.ordensConcluidas = ordens?.filter((ordem) => ordem.status === 'CONCLUIDA').length ?? null;
        this.ordensCanceladas = ordens?.filter((ordem) => ordem.status === 'CANCELADA').length ?? null;
      });
  }
}
