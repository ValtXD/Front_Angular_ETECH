// calcular.component.ts
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
  styleUrls: ['./calcular.component.css'],
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
  aparelhoForm: FormGroup;
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

  // Data hoje formatada para padrão YYYY-MM-DD
  dataHoje: string = new Date().toISOString().slice(0, 10);

  displayedColumns: string[] = [
    'nome', 'data_cadastro', 'ambiente', 'estado', 'bandeira',
    'potencia_watts', 'tempo_uso_diario_horas', 'quantidade', 'acoes'
  ];

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
      potencia_watts: [null, Validators.required],
      tempo_uso_diario_horas: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.api.getAmbientes().subscribe(data => this.ambientes = data);
    this.api.getEstados().subscribe(data => this.estados = data);
    this.api.getBandeiras().subscribe(data => this.bandeiras = data);
    this.aplicarFiltrosBackend();
  }


  aplicarFiltrosBackend() {
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

  // Retorna a lista já filtrada pelo backend (sem filtro local)
  get aparelhosFiltrados() {
    return this.aparelhos;
  }

  editar(aparelho: Aparelho) {
    const confirmar = window.confirm(`Deseja editar o aparelho "${aparelho.nome}"?`);
    if (!confirmar) return;

    this.editandoId = aparelho.id;
    this.aparelhoForm.patchValue({
      data_cadastro: aparelho.data_cadastro,
      ambiente: aparelho.ambiente.id,
      estado: aparelho.estado.id,
      bandeira: aparelho.bandeira.id,
      nome: aparelho.nome,
      potencia_watts: aparelho.potencia_watts,
      tempo_uso_diario_horas: aparelho.tempo_uso_diario_horas,
      quantidade: aparelho.quantidade,
    });
  }

  remover(id: number) {
    const confirmar = window.confirm('Tem certeza que deseja remover este aparelho?');
    if (!confirmar) return;

    this.api.removerAparelho(id).subscribe(() => this.aplicarFiltrosBackend());
  }

  onSubmit() {
    if (this.aparelhoForm.invalid) return;

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
      this.api.atualizarAparelho(this.editandoId, payload).subscribe(() => {
        this.editandoId = null;
        this.resetForm();
        this.aplicarFiltrosBackend(); // Atualiza lista com filtros atuais
        alert('Edição salva com sucesso!');
      });
    } else {
      this.api.criarAparelho(payload).subscribe(() => {
        this.resetForm();
        this.aplicarFiltrosBackend(); // Atualiza lista com filtros atuais
        alert('Cadastro feito com sucesso!');
      });
    }
  }

  resetForm() {
    this.aparelhoForm.reset({ quantidade: 1, data_cadastro: this.dataHoje });
    this.editandoId = null;
  }

  irParaResultados() {
    const dataSelecionada = this.aparelhoForm.get('data_cadastro')?.value;
    this.router.navigate(['/resultados'], { queryParams: { data: dataSelecionada } });
  }
}
