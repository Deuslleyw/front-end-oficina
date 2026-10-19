import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService } from '../../services/veiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo } from '../../models/veiculo';
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
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.scss'
})
export class VeiculosComponent implements OnInit {

  veiculos: Veiculo[] = [];
  clientes: Cliente[] = [];
  veiculoSelecionado: Veiculo = this.veiculoVazio();
  dialogVisivel: boolean = false;
  editando: boolean = false;
  busca: string = '';
  carregando: boolean = false;

  constructor(
    private veiculoService: VeiculoService,
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarClientes();
  }

  veiculoVazio(): Veiculo {
    return { marca: '', modelo: '', placa: '', ano: new Date().getFullYear(), clienteId: 0 };
  }

  listar(): void {
    this.carregando = true;
    this.veiculoService.listar().subscribe({
      next: (data) => {
        this.veiculos = data;
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar veículos' });
        this.carregando = false;
      }
    });
  }

  listarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => this.clientes = data
    });
  }

  abrirNovo(): void {
    this.veiculoSelecionado = this.veiculoVazio();
    this.editando = false;
    this.dialogVisivel = true;
  }

  abrirEdicao(veiculo: Veiculo): void {
    this.veiculoSelecionado = { ...veiculo };
    this.editando = true;
    this.dialogVisivel = true;
  }

  salvar(): void {
    if (this.editando && this.veiculoSelecionado.id) {
      this.veiculoService.atualizar(this.veiculoSelecionado.id, this.veiculoSelecionado).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Veículo atualizado!' });
          this.dialogVisivel = false;
          this.listar();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar veículo' })
      });
    } else {
      this.veiculoService.criar(this.veiculoSelecionado).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Veículo cadastrado!' });
          this.dialogVisivel = false;
          this.listar();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao cadastrar veículo' })
      });
    }
  }

  confirmarDelete(veiculo: Veiculo): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o veículo ${veiculo.modelo} (${veiculo.placa})?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.veiculoService.deletar(veiculo.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Veículo excluído!' });
            this.listar();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir veículo' })
        });
      }
    });
  }

  get veiculosFiltrados(): Veiculo[] {
    if (!this.busca) return this.veiculos;
    const termo = this.busca.toLowerCase();
    return this.veiculos.filter(v =>
      v.marca.toLowerCase().includes(termo) ||
      v.modelo.toLowerCase().includes(termo) ||
      v.placa.toLowerCase().includes(termo) ||
      (v.clienteNome || '').toLowerCase().includes(termo)
    );
  }
}
