import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContadorService, ConsumoMensal } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {Estado} from '../models/estado';
import {Bandeira} from '../models/bandeira';

@Component({
  selector: 'app-consumo-mensal-calcular',
  templateUrl: './consumo-mensal-calcular.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./consumo-mensal-calcular.component.css']
})
export class ConsumoMensalCalcularComponent implements OnInit {
  form!: FormGroup;
  estados: any[] = [];
  bandeiras: any[] = [];
  registros: ConsumoMensal[] = [];

  constructor(
    private fb: FormBuilder,
    private contadorService: ContadorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      data: ['', Validators.required],
      estado: ['', Validators.required],
      bandeira: ['', Validators.required],
      tarifa_social: [false],
      leitura_inicial: ['', [Validators.required, Validators.min(0)]],
      leitura_final: ['', [Validators.required, Validators.min(0)]],
    });

    this.carregarEstados();
    this.carregarBandeiras();
    this.carregarRegistros();
  }

  getEstadoNome(id: Estado): string {
    const est = this.estados.find(e => e.id === id);
    return est ? est.nome : 'Desconhecido';
  }

  getBandeiraCor(id: Bandeira): string {
    const ban = this.bandeiras.find(b => b.id === id);
    return ban ? ban.cor : 'Desconhecido';
  }

  carregarEstados() {
    this.contadorService.getEstados().subscribe(estados => this.estados = estados);
  }

  carregarBandeiras() {
    this.contadorService.getBandeiras().subscribe(bandeiras => this.bandeiras = bandeiras);
  }

  carregarRegistros() {
    this.contadorService.listarConsumos().subscribe(res => {
      this.registros = res.registros;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.form.value.leitura_final < this.form.value.leitura_inicial) {
      alert('Leitura final deve ser maior ou igual à leitura inicial.');
      return;
    }

    // Monta string 'data' para backend: 'YYYY-MM-01'
    const data = this.form.value.data; // 'YYYY-MM'
    const dataCompleta = data + '-01';

    const payload = {
      data: dataCompleta,
      estado: this.form.value.estado,
      bandeira: this.form.value.bandeira,
      tarifa_social: this.form.value.tarifa_social,
      leitura_inicial: Number(this.form.value.leitura_inicial),
      leitura_final: Number(this.form.value.leitura_final)
    };

    this.contadorService.calcularConsumo(payload).subscribe({
      next: registroSalvo => {
        alert('Registro salvo com sucesso!');
        this.form.reset({ tarifa_social: false });
        this.registros.unshift(registroSalvo);
      },
      error: err => {
        alert('Erro ao salvar registro: ' + JSON.stringify(err.error));
        console.error(err);
      }
    });
  }

  removerRegistro(id: number) {
    if (!confirm('Confirma exclusão do registro?')) return;

    this.contadorService.deletar(id).subscribe({
      next: () => {
        this.registros = this.registros.filter(r => r.id !== id);
      },
      error: () => alert('Erro ao remover registro.')
    });
  }

  irParaResultados() {
    this.router.navigate(['/consumo-mensal-listar']);
  }
}
