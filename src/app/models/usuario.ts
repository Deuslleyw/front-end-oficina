export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'USUARIO';
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: 'ADMIN' | 'USUARIO';
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  nome: string;
  perfil: string;
}
