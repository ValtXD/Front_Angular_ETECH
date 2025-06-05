import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContadorService, ConsumoMensal } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';
import { HttpParams } from '@angular/common/http';
import {MatInputModule} from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {
  MatTableModule
}
  from '@angular/material/table';
import {MatButton, MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-consumo-mensal-calcular',
  templateUrl: './consumo-mensal-calcular.component.html',
  standalone: true,
  imports: [  ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,],
  styleUrls: ['./consumo-mensal-calcular.component.scss']
})
export class ConsumoMensalCalcularComponent implements OnInit {
  form!: FormGroup;
  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];
  registros: ConsumoMensal[] = [];
  editandoId: number | null = null;

  displayedColumns: string[] = [
    'data', 'estado', 'bandeira', 'tarifa_social', 'leitura_inicial', 'leitura_final', 'acoes'
  ];

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

      // Filtros no mesmo FormGroup (somente os que ficaram)
      filtroMesAno: [''],
      filtroEstado: [null],
      filtroBandeira: [null],
    });

    this.carregarEstados();
    this.carregarBandeiras();

    // Aplica filtros ao iniciar e quando qualquer filtro mudar
    this.form.get('filtroMesAno')?.valueChanges.subscribe(() => this.aplicarFiltrosBackend());
    this.form.get('filtroEstado')?.valueChanges.subscribe(() => this.aplicarFiltrosBackend());
    this.form.get('filtroBandeira')?.valueChanges.subscribe(() => this.aplicarFiltrosBackend());

    this.aplicarFiltrosBackend();
  }

  carregarEstados() {
    this.contadorService.getEstados().subscribe(estados => this.estados = estados);
  }

  carregarBandeiras() {
    this.contadorService.getBandeiras().subscribe(bandeiras => this.bandeiras = bandeiras);
  }

  aplicarFiltrosBackend() {
    let params = new HttpParams();

    const filtroMesAno = this.form.get('filtroMesAno')?.value;
    const filtroEstado = this.form.get('filtroEstado')?.value;
    const filtroBandeira = this.form.get('filtroBandeira')?.value;

    if (filtroMesAno && filtroMesAno.length === 7) {
      const [ano, mes] = filtroMesAno.split('-');
      params = params.set('ano', ano);
      params = params.set('mes', mes);
    }

    if (filtroEstado) {
      params = params.set('estado', filtroEstado.toString());
    }

    if (filtroBandeira) {
      params = params.set('bandeira', filtroBandeira.toString());
    }

    console.log('Filtros enviados:', params.toString());

    this.contadorService.listarConsumos(params).subscribe({
      next: res => this.registros = res.registros,
      error: err => console.error('Erro ao buscar consumos filtrados:', err)
    });
  }

  getEstadoNome(id: number): string {
    const est = this.estados.find(e => e.id === id);
    return est ? est.nome : 'Desconhecido';
  }

  getBandeiraCor(id: number): string {
    const ban = this.bandeiras.find(b => b.id === id);
    return ban ? ban.cor : 'Desconhecido';
  }

  editarRegistro(registro: ConsumoMensal) {
    if (!confirm('Deseja editar este registro?')) return;
    this.editandoId = registro.id;
    const dataStr = `${registro.ano}-${registro.mes.toString().padStart(2, '0')}`;
    this.form.patchValue({
      data: dataStr,
      estado: typeof registro.estado === 'object' ? registro.estado.id : registro.estado,
      bandeira: typeof registro.bandeira === 'object' ? registro.bandeira.id : registro.bandeira,
      tarifa_social: registro.tarifa_social,
      leitura_inicial: registro.leitura_inicial,
      leitura_final: registro.leitura_final
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.form.value.leitura_final < this.form.value.leitura_inicial) {
      alert('Leitura final deve ser maior ou igual à leitura inicial.');
      return;
    }

    const data = this.form.value.data;
    const [ano, mes] = data.split('-').map(Number);

    const payload = {
      ano,
      mes,
      estado: this.form.value.estado,
      bandeira: this.form.value.bandeira,
      tarifa_social: this.form.value.tarifa_social,
      leitura_inicial: Number(this.form.value.leitura_inicial),
      leitura_final: Number(this.form.value.leitura_final)
    };

    if (this.editandoId) {
      this.contadorService.atualizar(this.editandoId, payload).subscribe({
        next: () => {
          alert('Registro atualizado com sucesso!');
          this.editandoId = null;
          this.form.reset({ tarifa_social: false });
          this.aplicarFiltrosBackend();
        },
        error: err => {
          alert('Erro ao atualizar registro: ' + JSON.stringify(err.error));
          console.error(err);
        }
      });
    } else {
      this.contadorService.criar(payload).subscribe({
        next: registroSalvo => {
          alert('Registro salvo com sucesso!');
          this.form.reset({ tarifa_social: false });
          this.registros.unshift(registroSalvo);
          this.aplicarFiltrosBackend();
        },
        error: err => {
          alert('Erro ao salvar registro: ' + JSON.stringify(err.error));
          console.error(err);
        }
      });
    }
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
