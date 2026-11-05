import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService } from '../../services/veiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo, VeiculoRequest } from '../../models/veiculo';
import { Cliente } from '../../models/cliente';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.scss',
})
export class VeiculosComponent implements OnInit {
  veiculos: Veiculo[] = [];
  clientes: Cliente[] = [];
  veiculoSelecionado: VeiculoRequest = this.veiculoVazio();
  dialogVisivel: boolean = false;
  editando: boolean = false;
  veiculoIdEdicao: number | null = null;
  busca: string = '';
  carregando: boolean = false;
  salvando = false;
  formularioEnviado = false;

  constructor(
    private veiculoService: VeiculoService,
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarClientes();
  }

  veiculoVazio(): VeiculoRequest {
    return {
      marca: '',
      modelo: '',
      placa: '',
      ano: String(new Date().getFullYear()),
      clienteId: 0,
    };
  }

  listar(): void {
    this.carregando = true;
    this.veiculoService.listar().subscribe({
      next: (data) => {
        this.veiculos = data;
        this.carregando = false;
      },
      error: (error: unknown) => {
        this.mostrarErro(error, 'Não foi possível carregar os veículos.');
        this.carregando = false;
      },
    });
  }

  listarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => (this.clientes = data),
      error: () => this.mostrarErro(null, 'Não foi possível carregar os clientes para o vínculo.'),
    });
  }

  abrirNovo(): void {
    this.veiculoSelecionado = this.veiculoVazio();
    this.editando = false;
    this.veiculoIdEdicao = null;
    this.formularioEnviado = false;
    this.dialogVisivel = true;
  }

  abrirEdicao(veiculo: Veiculo): void {
    this.veiculoSelecionado = {
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      ano: String(veiculo.ano),
      clienteId: veiculo.clienteId,
    };
    this.editando = true;
    this.veiculoIdEdicao = veiculo.id ?? null;
    this.formularioEnviado = false;
    this.dialogVisivel = true;
  }

  salvar(): void {
    this.formularioEnviado = true;
    if (!this.formularioValido || this.salvando) return;

    const request: VeiculoRequest = {
      marca: this.veiculoSelecionado.marca.trim(),
      modelo: this.veiculoSelecionado.modelo.trim(),
      placa: this.veiculoSelecionado.placa.trim(),
      ano: this.veiculoSelecionado.ano.trim(),
      clienteId: this.veiculoSelecionado.clienteId,
    };
    const veiculoId = this.editando ? this.veiculoIdEdicao : null;
    if (this.editando && veiculoId === null) return;

    this.salvando = true;
    const operacao = veiculoId !== null
      ? this.veiculoService.atualizar(veiculoId, request)
      : this.veiculoService.criar(request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.dialogVisivel = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.editando ? 'Veículo atualizado.' : 'Veículo cadastrado.',
        });
        this.listar();
      },
      error: (error: unknown) => {
        this.salvando = false;
        this.mostrarErro(error, this.editando
          ? 'Não foi possível atualizar o veículo.'
          : 'Não foi possível cadastrar o veículo.');
      },
    });
  }

  get formularioValido(): boolean {
    return !this.campoMarcaInvalido() && !this.campoModeloInvalido() &&
      !this.campoPlacaInvalida() && !this.campoAnoInvalido() &&
      !this.campoClienteInvalido();
  }

  campoMarcaInvalido(): boolean {
    const marca = this.veiculoSelecionado.marca.trim();
    return marca.length < 3 || marca.length > 50;
  }

  campoModeloInvalido(): boolean {
    const modelo = this.veiculoSelecionado.modelo.trim();
    return modelo.length < 3 || modelo.length > 50;
  }

  campoPlacaInvalida(): boolean {
    const placa = this.veiculoSelecionado.placa.trim();
    return placa.length < 7 || placa.length > 8;
  }

  campoAnoInvalido(): boolean {
    const ano = this.veiculoSelecionado.ano.trim();
    const valor = Number(ano);
    return !/^\d{4}$/.test(ano) || !Number.isInteger(valor) || valor < 1900 || valor > 2100;
  }

  campoClienteInvalido(): boolean {
    return !Number.isInteger(this.veiculoSelecionado.clienteId) ||
      !this.clientes.some((cliente) => cliente.id === this.veiculoSelecionado.clienteId);
  }

  iniciaisCliente(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '—';
    if (partes.length === 1) return partes[0].slice(0, 2).toLocaleUpperCase('pt-BR');
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toLocaleUpperCase('pt-BR');
  }

  confirmarDelete(veiculo: Veiculo): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o veículo ${veiculo.modelo} (${veiculo.placa})?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.veiculoService.deletar(veiculo.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Veículo excluído!',
            });
            this.listar();
          },
          error: (error: unknown) => this.mostrarErro(error, 'Não foi possível excluir o veículo.'),
        });
      },
    });
  }

  get veiculosFiltrados(): Veiculo[] {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.veiculos;
    return this.veiculos.filter(
      (v) =>
        v.marca.toLowerCase().includes(termo) ||
        v.modelo.toLowerCase().includes(termo) ||
        v.placa.toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo),
    );
  }

  private mostrarErro(error: unknown, fallback: string): void {
    const response = error as { error?: { error?: unknown; message?: unknown } };
    const detalhe = typeof response?.error?.error === 'string'
      ? response.error.error
      : typeof response?.error?.message === 'string'
        ? response.error.message
        : fallback;

    this.messageService.add({ severity: 'error', summary: 'Erro', detail: detalhe });
  }
}
