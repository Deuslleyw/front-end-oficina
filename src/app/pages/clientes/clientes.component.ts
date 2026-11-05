import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente, ClienteRequest } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteSelecionado: ClienteRequest = this.clienteVazio();
  clienteIdEdicao: number | null = null;
  dialogVisivel = false;
  editando = false;
  busca = '';
  carregando = false;
  salvando = false;
  formularioEnviado = false;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  private clienteVazio(): ClienteRequest {
    return { nome: '', telefone: '', email: null, cpf: '' };
  }

  listar(): void {
    this.carregando = true;
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.carregando = false;
      },
      error: (error: unknown) => {
        this.carregando = false;
        this.mostrarErro(error, 'Não foi possível carregar os clientes.');
      },
    });
  }

  abrirNovo(): void {
    this.clienteSelecionado = this.clienteVazio();
    this.clienteIdEdicao = null;
    this.editando = false;
    this.formularioEnviado = false;
    this.dialogVisivel = true;
  }

  abrirEdicao(cliente: Cliente): void {
    this.clienteSelecionado = {
      nome: cliente.nome,
      telefone: this.formatarTelefone(cliente.telefone),
      email: cliente.email,
      cpf: '',
    };
    this.clienteIdEdicao = cliente.id;
    this.editando = true;
    this.formularioEnviado = false;
    this.dialogVisivel = true;
  }

  salvar(): void {
    this.formularioEnviado = true;
    if (!this.formularioValido || this.salvando) return;

    const digitosTelefone = this.clienteSelecionado.telefone.replace(/\D/g, '');
    const request: ClienteRequest = {
      nome: this.clienteSelecionado.nome.trim(),
      telefone: `(${digitosTelefone.slice(0, 2)})${digitosTelefone.slice(2)}`,
      email: this.clienteSelecionado.email?.trim() || null,
      cpf: this.clienteSelecionado.cpf.replace(/\D/g, ''),
    };

    this.salvando = true;
    const operacao = this.editando && this.clienteIdEdicao !== null
      ? this.clienteService.atualizar(this.clienteIdEdicao, request)
      : this.clienteService.criar(request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.dialogVisivel = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.editando ? 'Cliente atualizado.' : 'Cliente cadastrado.',
        });
        this.listar();
      },
      error: (error: unknown) => {
        this.salvando = false;
        this.mostrarErro(
          error,
          this.editando ? 'Não foi possível atualizar o cliente.' : 'Não foi possível cadastrar o cliente.',
        );
      },
    });
  }

  confirmarDelete(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o cliente ${cliente.nome}?`,
      header: 'Excluir cliente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clienteService.deletar(cliente.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente excluído.',
            });
            this.listar();
          },
          error: (error: unknown) =>
            this.mostrarErro(error, 'Não foi possível excluir o cliente.'),
        });
      },
    });
  }

  formatarTelefone(telefone: string): string {
    const digitos = telefone.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos ? `(${digitos}` : '';

    const ddd = digitos.slice(0, 2);
    const numero = digitos.slice(2);
    if (numero.length <= 5) return `(${ddd}) ${numero}`;
    return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
  }

  iniciaisCliente(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return 'CL';
    if (partes.length === 1) return partes[0].slice(0, 2).toLocaleUpperCase('pt-BR');
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toLocaleUpperCase('pt-BR');
  }

  get formularioValido(): boolean {
    const nome = this.clienteSelecionado.nome.trim();
    const telefone = this.clienteSelecionado.telefone.replace(/\D/g, '');
    const cpf = this.clienteSelecionado.cpf.replace(/\D/g, '');

    return nome.length >= 3 && nome.length <= 120 &&
      telefone.length === 11 &&
      this.emailValido(this.clienteSelecionado.email) &&
      this.cpfValido(cpf);
  }

  telefoneValido(): boolean {
    return this.clienteSelecionado.telefone.replace(/\D/g, '').length === 11;
  }

  cpfTemOnzeDigitos(): boolean {
    return this.clienteSelecionado.cpf.replace(/\D/g, '').length === 11;
  }

  cpfInformadoValido(): boolean {
    return this.cpfValido(this.clienteSelecionado.cpf.replace(/\D/g, ''));
  }

  emailValido(email: string | null): boolean {
    const valor = email?.trim();
    return !valor || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  private cpfValido(cpf: string): boolean {
    if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;

    const calcularDigito = (base: string, pesoInicial: number): number => {
      const soma = [...base].reduce(
        (total, digito, index) => total + Number(digito) * (pesoInicial - index),
        0,
      );
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    return calcularDigito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
      calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10]);
  }

  get clientesFiltrados(): Cliente[] {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.clientes;
    const termoNumerico = termo.replace(/\D/g, '');

    return this.clientes.filter((cliente) =>
      cliente.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
      (cliente.email ?? '').toLocaleLowerCase('pt-BR').includes(termo) ||
      cliente.telefone.toLocaleLowerCase('pt-BR').includes(termo) ||
      (termoNumerico.length > 0 && cliente.telefone.replace(/\D/g, '').includes(termoNumerico)),
    );
  }

  private mostrarErro(error: unknown, fallback: string): void {
    const response = error as { error?: { error?: unknown; message?: unknown } };
    const detalhe = typeof response?.error?.error === 'string'
      ? response.error.error
      : typeof response?.error?.message === 'string'
        ? response.error.message
        : fallback;

    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: detalhe,
    });
  }
}
