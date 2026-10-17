export interface OrdemServico {
  id?: number;
  descricao: string;
  valor: number;
  status: StatusOrdem;
  dataAbertura?: string;
  dataFechamento?: string;
  cliente?: {
    id: number;
    nome: string;
    telefone: string;
    email: string;
  };
  veiculo?: {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
    ano: string;
    clienteId: number;
    clienteNome: string;
  };
}

export interface OrdemServicoRequest {
  descricao: string;
  valor: number;
  status: StatusOrdem;
  clienteId: number;
  veiculoId: number;
}

export type StatusOrdem = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
