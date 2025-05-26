// calcular.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Ambiente } from '../models/ambiente';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';
import { Aparelho } from '../models/aparelho';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

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
  ]
})
export class CalcularComponent implements OnInit {
  aparelhoForm: FormGroup;
  ambientes: Ambiente[] = [];
  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];
  aparelhos: Aparelho[] = [];
  editandoId: number | null = null;
  filtros = { nome: '', data: '' };

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.aparelhoForm = this.fb.group({
      data_cadastro: [new Date().toISOString().slice(0, 10), Validators.required],
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
    this.carregarAparelhos();
  }

  carregarAparelhos() {
    this.api.getAparelhos().subscribe(data => this.aparelhos = data);
  }

  get aparelhosFiltrados() {
    return this.aparelhos.filter(a => {
      const nomeOk = this.filtros.nome === '' || a.nome.toLowerCase().includes(this.filtros.nome.toLowerCase());
      const dataOk = this.filtros.data === '' || a.data_cadastro === this.filtros.data;
      return nomeOk && dataOk;
    });
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

    this.api.removerAparelho(id).subscribe(() => this.carregarAparelhos());
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
        this.aparelhoForm.reset({ quantidade: 1, data_cadastro: new Date().toISOString().slice(0, 10) });
        this.carregarAparelhos();
        alert('Edição salva com sucesso!');
      });
    } else {
      this.api.criarAparelho(payload).subscribe(() => {
        this.aparelhoForm.reset({ quantidade: 1, data_cadastro: new Date().toISOString().slice(0, 10) });
        this.carregarAparelhos();
        alert('Cadastro feito com sucesso!');
      });
    }
  }

  irParaResultados() {
    const dataSelecionada = this.aparelhoForm.get('data_cadastro')?.value;
    this.router.navigate(['/resultados'], { queryParams: { data: dataSelecionada } });
  }
}
