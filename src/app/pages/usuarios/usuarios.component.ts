import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario, UsuarioRequest } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DialogModule,
    DropdownModule,
    ToastModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSelecionado: UsuarioRequest = this.usuarioVazio();
  dialogVisivel = false;
  busca = '';
  carregando = false;
  salvando = false;
  formularioEnviado = false;

  readonly perfilOptions = [
    { label: 'Usuário', value: 'USUARIO' as const },
    { label: 'Administrador', value: 'ADMIN' as const },
  ];

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  usuarioVazio(): UsuarioRequest {
    return { nome: '', email: '', senha: '', perfil: 'USUARIO' };
  }

  listar(): void {
    this.carregando = true;
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.carregando = false;
      },
      error: (error) => {
        this.carregando = false;
        this.mostrarErro(error, 'Não foi possível carregar os usuários.');
      },
    });
  }

  abrirNovo(): void {
    this.usuarioSelecionado = this.usuarioVazio();
    this.formularioEnviado = false;
    this.dialogVisivel = true;
  }

  salvar(): void {
    this.formularioEnviado = true;
    const usuario = {
      ...this.usuarioSelecionado,
      nome: this.usuarioSelecionado.nome.trim(),
      email: this.usuarioSelecionado.email.trim(),
    };
    if (
      !usuario.nome ||
      !this.emailValido(usuario.email) ||
      !usuario.senha ||
      !usuario.perfil ||
      this.salvando
    )
      return;

    this.salvando = true;
    this.usuarioService.criar(usuario).subscribe({
      next: () => {
        this.salvando = false;
        this.dialogVisivel = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário cadastrado com sucesso.',
        });
        this.listar();
      },
      error: (error) => {
        this.salvando = false;
        this.mostrarErro(error, 'Não foi possível cadastrar o usuário.');
      },
    });
  }

  get usuariosFiltrados(): Usuario[] {
    const termo = this.busca.trim().toLowerCase();
    if (!termo) return this.usuarios;
    return this.usuarios.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.perfil.toLowerCase().includes(termo),
    );
  }

  getPerfilSeverity(perfil: Usuario['perfil']): 'info' | 'warning' {
    return perfil === 'ADMIN' ? 'warning' : 'info';
  }

  emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private mostrarErro(error: any, fallback: string): void {
    const detalhe =
      typeof error?.error?.error === 'string' ? error.error.error : fallback;
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: detalhe,
    });
  }
}
