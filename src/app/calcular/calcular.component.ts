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

  onSubmit() {
    if (this.aparelhoForm.invalid) return;

    const formValue = this.aparelhoForm.value;

    // Ajuste: enviar campos com sufixo _id conforme backend espera
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

    console.log('Payload corrigido:', payload);

    this.api.criarAparelho(payload).subscribe({
      next: () => {
        this.carregarAparelhos();
        this.aparelhoForm.reset({ quantidade: 1, data_cadastro: new Date().toISOString().slice(0, 10) });
      },
      error: (err) => {
        console.error('Erro ao criar aparelho', err);
        if (err.error) {
          console.error('Detalhes do erro:', err.error);
        }
      }
    });
  }

  remover(id: number) {
    this.api.removerAparelho(id).subscribe(() => this.carregarAparelhos());
  }

  irParaResultados() {
    const dataSelecionada = this.aparelhoForm.get('data_cadastro')?.value;
    this.router.navigate(['/resultados'], { queryParams: { data: dataSelecionada } });
  }
}
