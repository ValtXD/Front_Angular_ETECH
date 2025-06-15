import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Ambiente } from '../models/ambiente';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';
import { Aparelho } from '../models/aparelho';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HttpParams} from '@angular/common/http';
import { Router } from '@angular/router';
import {MatCard, MatCardContent, MatCardModule, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';

@Component({
  standalone: true,
  selector: 'app-calcular',
  templateUrl: './calcular.component.html',
  styleUrls: ['./calcular.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,

  ]
})
export class CalcularComponent implements OnInit {
  aparelhoForm!: FormGroup;
  ambientes: Ambiente[] = [];
  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];
  aparelhos: Aparelho[] = [];
  editandoId: number | null = null;

  filtros = {
    nome: '',
    data: '',
    ambiente: '',
  };

  dataHoje: string = new Date().toISOString().slice(0, 10);



  isModalOpen: boolean = false;
  showFilters: boolean = false;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.aparelhoForm = this.fb.group({
      data_cadastro: [this.dataHoje, Validators.required],
      ambiente: ['', Validators.required],
      estado: ['', Validators.required],
      bandeira: ['', Validators.required],
      nome: ['', Validators.required],
      potencia_watts: [null, [Validators.required, Validators.min(0)]],
      tempo_uso_diario_horas: [null, [Validators.required, Validators.min(0)]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.api.getAmbientes().subscribe({
      next: data => this.ambientes = data,
      error: err => console.error('Erro ao carregar ambientes:', err)
    });
    this.api.getEstados().subscribe({
      next: data => this.estados = data,
      error: err => console.error('Erro ao carregar estados:', err)
    });
    this.api.getBandeiras().subscribe({
      next: data => this.bandeiras = data,
      error: err => console.error('Erro ao carregar bandeiras:', err)
    });
    this.aplicarFiltrosBackend();
  }

  aplicarFiltrosBackend(): void {
    let params = new HttpParams();

    if (this.filtros.ambiente) {
      params = params.set('ambiente', this.filtros.ambiente);
    }
    if (this.filtros.data) {
      params = params.set('data_cadastro__gte', this.filtros.data);
    }
    if (this.filtros.nome) {
      params = params.set('nome', this.filtros.nome.trim());
    }

    this.api.getAparelhos(params).subscribe({
      next: dados => this.aparelhos = dados,
      error: err => console.error('Erro ao buscar aparelhos filtrados:', err)
    });
  }

  get aparelhosFiltrados(): Aparelho[] {
    return this.aparelhos;
  }

  /**
   * Abre o modal de edição e busca os dados completos do aparelho pelo ID.
   * @param aparelho O objeto aparelho com o ID para edição.
   */
  openModalForEdit(aparelho: Aparelho): void {
    if (aparelho.id !== undefined && aparelho.id !== null) {
      this.editandoId = aparelho.id;
      this.isModalOpen = true; // Abre o modal imediatamente

      // Faz a requisição para buscar os detalhes completos do aparelho pelo ID
      this.api.getAparelhoById(aparelho.id).subscribe({
        next: (aparelhoCompleto: Aparelho) => {
          // Preenche o formulário com os dados completos da API
          this.aparelhoForm.patchValue({
            data_cadastro: aparelhoCompleto.data_cadastro,
            ambiente: aparelhoCompleto.ambiente?.id,
            estado: aparelhoCompleto.estado?.id,
            bandeira: aparelhoCompleto.bandeira?.id,
            nome: aparelhoCompleto.nome,
            potencia_watts: aparelhoCompleto.potencia_watts,
            tempo_uso_diario_horas: aparelhoCompleto.tempo_uso_diario_horas,
            quantidade: aparelhoCompleto.quantidade,
          });
        },
        error: (err) => {
          console.error('Erro ao buscar aparelho para edição:', err);
          this.closeModal();
        }
      });
    } else {
      console.error('ID do aparelho não fornecido para edição.');
    }
  }

  /**
   * Abre o modal para um novo cadastro.
   */
  openModalForNew(): void {
    this.editandoId = null;
    this.resetForm();
    this.isModalOpen = true;
  }

  /**
   * Fecha o modal e reseta o formulário.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    this.editandoId = null;
  }

  /**
   * Alterna a visibilidade dos campos de filtro.
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Limpa os filtros e recarrega todos os aparelhos.
   */
  clearFilters(): void {
    this.filtros = {
      nome: '',
      data: '',
      ambiente: '',
    };
    this.aplicarFiltrosBackend();
  }

  /**
   * Remove um aparelho.
   * @param id O ID do aparelho a ser removido.
   */
  remover(id: number | undefined): void {
    if (id === undefined) {
      console.error('ID do aparelho é indefinido para remoção.');
      return;
    }

    // Em um app real, use um modal de confirmação customizado aqui (ex: MatDialog)
    console.log('Solicitação de remoção para o ID:', id);
    if (confirm('Tem certeza que deseja remover este aparelho? (Em um app real, use um modal customizado)')) {
      this.api.removerAparelho(id).subscribe({
        next: () => {
          console.log('Aparelho removido com sucesso!');
          this.aplicarFiltrosBackend();
        },
        error: err => console.error('Erro ao remover aparelho:', err)
      });
    }
  }

  /**
   * Envia o formulário para criar ou atualizar um aparelho.
   */
  onSubmit(): void {
    if (this.aparelhoForm.invalid) {
      this.aparelhoForm.markAllAsTouched();
      console.log('Formulário inválido.');
      return;
    }

    const formValue = this.aparelhoForm.value;
    const payload = {
      data_cadastro: formValue.data_cadastro,
      ambiente_id: Number(formValue.ambiente),
      estado_id: Number(formValue.estado),
      bandeira_id: Number(formValue.bandeira),
      nome: formValue.nome,
      potencia_watts: formValue.potencia_watts,
      tempo_uso_diario_horas: formValue.tempo_uso_diario_horas,
      quantidade: formValue.quantidade,
    };

    if (this.editandoId) {
      this.api.atualizarAparelho(this.editandoId, payload).subscribe({
        next: () => {
          console.log('Edição salva com sucesso!');
          this.closeModal();
          this.aplicarFiltrosBackend();
        },
        error: err => console.error('Erro ao atualizar aparelho:', err)
      });
    } else {
      this.api.criarAparelho(payload).subscribe({
        next: () => {
          console.log('Cadastro feito com sucesso!');
          this.closeModal();
          this.aplicarFiltrosBackend();
        },
        error: err => console.error('Erro ao cadastrar aparelho:', err)
      });
    }
  }

  /**
   * Reseta o formulário para os valores padrão.
   */
  resetForm(): void {
    this.aparelhoForm.reset({ quantidade: 1, data_cadastro: this.dataHoje });
    Object.keys(this.aparelhoForm.controls).forEach(key => {
      this.aparelhoForm.get(key)?.setErrors(null);
    });
  }

  /**
   * Navega para a página de resultados com a data selecionada.
   */
  irParaResultados(): void {
    const dataSelecionada = this.aparelhoForm.get('data_cadastro')?.value;
    this.router.navigate(['/resultados'], { queryParams: { data: dataSelecionada } });
  }
}
