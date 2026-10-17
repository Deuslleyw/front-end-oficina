export interface Veiculo {
  id?: number;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  clienteId: number;
  clienteNome?: string;
}
