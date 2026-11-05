export interface Veiculo {
  id?: number;
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  clienteId: number;
  clienteNome?: string;
}

export interface VeiculoRequest {
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  clienteId: number;
}
