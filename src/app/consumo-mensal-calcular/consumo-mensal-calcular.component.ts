import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContadorService, ConsumoMensal } from '../services/contador.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Estado } from '../models/estado';
import { Bandeira } from '../models/bandeira';

@Component({
  selector: 'app-consumo-mensal-calcular',
  templateUrl: './consumo-mensal-calcular.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  styleUrls: ['./consumo-mensal-calcular.component.css']
})
export class ConsumoMensalCalcularComponent implements OnInit {
  form!: FormGroup;
  estados: any[] = [];
  bandeiras: any[] = [];
  registros: ConsumoMensal[] = [];
  filtroMesAno: string = '';
  editandoId: number | null = null;

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

  get registrosFiltrados(): ConsumoMensal[] {
    if (!this.filtroMesAno) return this.registros;
    const [ano, mes] = this.filtroMesAno.split('-').map(Number);
    return this.registros.filter(r => r.ano === ano && r.mes === mes);
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
        next: registroAtualizado => {
          alert('Registro atualizado com sucesso!');
          this.editandoId = null;
          this.form.reset({ tarifa_social: false });
          this.carregarRegistros();
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
