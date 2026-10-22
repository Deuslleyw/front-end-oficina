import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdemServicoService } from '../../services/ordem-servico.service';
import { ClienteService } from '../../services/cliente.service';
import { VeiculoService } from '../../services/veiculo.service';
import { OrdemServico, OrdemServicoRequest, StatusOrdem } from '../../models/ordem-servico';
import { Cliente } from '../../models/cliente';
import { Veiculo } from '../../models/veiculo';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-ordens-servico',
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
    TagModule,
    InputNumberModule,
    DividerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './ordens-servico.component.html',
  styleUrl: './ordens-servico.component.scss'
})
export class OrdensServicoComponent implements OnInit {

  ordens: OrdemServico[] = [];
  clientes: Cliente[] = [];
  veiculosDoCliente: Veiculo[] = [];
  todosVeiculos: Veiculo[] = [];

  ordemSelecionada: OrdemServicoRequest = this.ordemVazia();
  ordemDetalhes: OrdemServico | null = null;

  dialogFormVisivel: boolean = false;
  dialogDetalhesVisivel: boolean = false;
  editando: boolean = false;
  editandoId: number | null = null;
  busca: string = '';
  carregando: boolean = false;

  statusOptions = [
    { label: 'Aberta', value: 'ABERTA' },
    { label: 'Em Andamento', value: 'EM_ANDAMENTO' },
    { label: 'Concluída', value: 'CONCLUIDA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  constructor(
    private ordemServicoService: OrdemServicoService,
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.listar();
    this.listarClientes();
    this.listarVeiculos();
  }

  ordemVazia(): OrdemServicoRequest {
    return { descricao: '', valor: 0, status: 'ABERTA', clienteId: 0, veiculoId: 0 };
  }

  listar(): void {
    this.carregando = true;
    this.ordemServicoService.listar().subscribe({
      next: (data) => {
        this.ordens = data;
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar ordens' });
        this.carregando = false;
      }
    });
  }

  listarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => this.clientes = data
    });
  }

  listarVeiculos(): void {
    this.veiculoService.listar().subscribe({
      next: (data) => this.todosVeiculos = data
    });
  }

  onClienteChange(): void {
    this.ordemSelecionada.veiculoId = 0;
    this.veiculosDoCliente = this.todosVeiculos.filter(
      v => v.clienteId === this.ordemSelecionada.clienteId
    );
  }

  abrirNovo(): void {
    this.ordemSelecionada = this.ordemVazia();
    this.veiculosDoCliente = [];
    this.editando = false;
    this.editandoId = null;
    this.dialogFormVisivel = true;
  }

  abrirEdicao(ordem: OrdemServico): void {
    this.ordemSelecionada = {
      descricao: ordem.descricao,
      valor: ordem.valor,
      status: ordem.status,
      clienteId: ordem.cliente!.id,
      veiculoId: ordem.veiculo!.id!
    };
    this.veiculosDoCliente = this.todosVeiculos.filter(
      v => v.clienteId === ordem.cliente!.id
    );
    this.editando = true;
    this.editandoId = ordem.id!;
    this.dialogFormVisivel = true;
  }

  abrirDetalhes(ordem: OrdemServico): void {
    this.ordemDetalhes = ordem;
    this.dialogDetalhesVisivel = true;
  }

  salvar(): void {
    if (this.editando && this.editandoId) {
      this.ordemServicoService.atualizar(this.editandoId, this.ordemSelecionada).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ordem atualizada!' });
          this.dialogFormVisivel = false;
          this.listar();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar ordem' })
      });
    } else {
      this.ordemServicoService.criar(this.ordemSelecionada).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ordem criada!' });
          this.dialogFormVisivel = false;
          this.listar();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar ordem' })
      });
    }
  }

  confirmarCancelamento(ordem: OrdemServico): void {
    this.confirmationService.confirm({
      message: `Deseja cancelar a ordem #${ordem.id} — ${ordem.descricao}?`,
      header: 'Cancelar Ordem',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, cancelar',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ordemServicoService.cancelar(ordem.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ordem cancelada!' });
            this.listar();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao cancelar ordem' })
        });
      }
    });
  }

  podeEditar(status: StatusOrdem): boolean {
    return status !== 'CANCELADA' && status !== 'CONCLUIDA';
  }

  getSeverity(status: StatusOrdem): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const map: Record<StatusOrdem, 'success' | 'info' | 'warning' | 'danger'> = {
      'ABERTA': 'warning',
      'EM_ANDAMENTO': 'info',
      'CONCLUIDA': 'success',
      'CANCELADA': 'danger'
    };
    return map[status];
  }

  getStatusLabel(status: StatusOrdem): string {
    const map: Record<StatusOrdem, string> = {
      'ABERTA': 'Aberta',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUIDA': 'Concluída',
      'CANCELADA': 'Cancelada'
    };
    return map[status];
  }

  get ordensFiltradas(): OrdemServico[] {
    if (!this.busca) return this.ordens;
    const termo = this.busca.toLowerCase();
    return this.ordens.filter(o =>
      o.descricao.toLowerCase().includes(termo) ||
      o.cliente?.nome.toLowerCase().includes(termo) ||
      o.veiculo?.placa.toLowerCase().includes(termo) ||
      o.status.toLowerCase().includes(termo)
    );
  }
}
