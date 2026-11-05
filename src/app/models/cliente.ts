export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
}

export interface ClienteRequest {
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string;
}
