import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-clientes',
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
    TagModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteSelecionado: Cliente = this.clienteVazio();
  dialogVisivel: boolean = false;
  editando: boolean = false;
  busca: string = '';
  carregando: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  clienteVazio(): Cliente {
    return { nome: '', telefone: '', email: '', cpf: '' };
  }

  listar(): void {
    this.carregando = true;
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.carregando = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes',
        });
        this.carregando = false;
      },
    });
  }

  abrirNovo(): void {
    this.clienteSelecionado = this.clienteVazio();
    this.editando = false;
    this.dialogVisivel = true;
  }

  abrirEdicao(cliente: Cliente): void {
    this.clienteSelecionado = { ...cliente };
    this.editando = true;
    this.dialogVisivel = true;
  }

  salvar(): void {
    if (this.editando && this.clienteSelecionado.id) {
      this.clienteService
        .atualizar(this.clienteSelecionado.id, this.clienteSelecionado)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente atualizado!',
            });
            this.dialogVisivel = false;
            this.listar();
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar cliente',
            }),
        });
    } else {
      this.clienteService.criar(this.clienteSelecionado).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente cadastrado!',
          });
          this.dialogVisivel = false;
          this.listar();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao cadastrar cliente',
          }),
      });
    }
  }

  confirmarDelete(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o cliente ${cliente.nome}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clienteService.deletar(cliente.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente excluído!',
            });
            this.listar();
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir cliente',
            }),
        });
      },
    });
  }

  get clientesFiltrados(): Cliente[] {
    if (!this.busca) return this.clientes;
    const termo = this.busca.toLowerCase();
    return this.clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        c.cpf.includes(termo),
    );
  }
}
