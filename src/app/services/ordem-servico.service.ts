import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrdemServico, OrdemServicoRequest } from '../models/ordem-servico';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {

  private apiUrl = 'http://localhost:8080/api/v1/ordem-servico';

  constructor(private http: HttpClient) {}

  listar(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }

  criar(ordem: OrdemServicoRequest): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, ordem);
  }

  atualizar(id: number, ordem: OrdemServicoRequest): Observable<OrdemServico> {
    return this.http.put<OrdemServico>(`${this.apiUrl}/${id}`, ordem);
  }

  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
