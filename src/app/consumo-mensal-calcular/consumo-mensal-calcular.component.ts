import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ConsumoMensalListarComponent, ResultadosEvent} from '../consumo-mensal-listar/consumo-mensal-listar.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-consumo-mensal-calcular',
  templateUrl: './consumo-mensal-calcular.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, // Essencial para [formGroup]
    CommonModule,        // Essencial para *ngFor, *ngIf
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,       // Essencial para o Dialog
    MatSnackBarModule,

    // MÓDULOS DO FORMULÁRIO (PROVÁVEL CAUSA DO PROBLEMA)
    MatFormFieldModule,  // Para <mat-form-field>
    MatInputModule,      // Para <input matInput>
    MatSelectModule,     // Para <mat-select>
    MatCheckboxModule, ConsumoMensalListarComponent, MatDivider
  ],
  styleUrls: ['./consumo-mensal-calcular.component.scss']
})
export class ConsumoMensalCalcularComponent implements OnInit {
  @ViewChild('formDialogTemplate') formDialogTemplate!: TemplateRef<any>;
  consumoResultado: number = 0;
  custoResultado: number = 0;

  // 4. USE @ViewChild PARA OBTER UMA REFERÊNCIA AO COMPONENTE FILHO NO TEMPLATE
  @ViewChild(ConsumoMensalListarComponent) private listaComponent!: ConsumoMensalListarComponent;


  form: FormGroup; // Formulário para criar e editar
  filtroForm: FormGroup; // Formulário para os filtros
  filtrosVisiveis = false;

  estados: Estado[] = [];
  bandeiras: Bandeira[] = [];
  registros: ConsumoMensal[] = [];

  editandoId: number | null = null;
  dialogRef?: MatDialogRef<any>;



  constructor(
    private fb: FormBuilder,
    private contadorService: ContadorService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    // Formulário de criação/edição
    this.form = this.fb.group({
      data: ['', Validators.required],
      estado: ['', Validators.required],
      bandeira: ['', Validators.required],
      tarifa_social: [false],
      leitura_inicial: ['', [Validators.required, Validators.min(0)]],
      leitura_final: ['', [Validators.required, Validators.min(0)]],
    });

    // Formulário de filtros
    this.filtroForm = this.fb.group({
      filtroMesAno: [''],
      filtroEstado: [null],
      filtroBandeira: [null],
    });
  }

  onResultadosDoFilho(event: ResultadosEvent): void {
    console.log("Resultados recebidos do filho!", event);
    this.consumoResultado = event.consumo;
    this.custoResultado = event.custo;
  }

  toggleFiltros(): void {
    this.filtrosVisiveis = !this.filtrosVisiveis;
  }

  limparFiltros() {
    this.filtroForm.reset({
      filtroMesAno: '',
      filtroEstado: null,
      filtroBandeira: null
    });
    this.aplicarFiltrosBackend(); // Busca os dados novamente sem nenhum filtro
  }

  ngOnInit() {
    this.carregarDadosIniciais();
    this.filtroForm.valueChanges.subscribe(() => this.aplicarFiltrosBackend());
    this.aplicarFiltrosBackend(); // Carga inicial
  }

  // --- LÓGICA DA TELA PRINCIPAL ---

  carregarDadosIniciais() {
    this.contadorService.getEstados().subscribe(estados => this.estados = estados);
    this.contadorService.getBandeiras().subscribe(bandeiras => this.bandeiras = bandeiras);
  }

  aplicarFiltrosBackend() {
    let params = new HttpParams();
    const { filtroMesAno, filtroEstado, filtroBandeira } = this.filtroForm.value;

    if (filtroMesAno && filtroMesAno.length === 7) {
      const [ano, mes] = filtroMesAno.split('-');
      params = params.set('ano', ano).set('mes', mes);
    }
    if (filtroEstado) params = params.set('estado', filtroEstado.toString());
    if (filtroBandeira) params = params.set('bandeira', filtroBandeira.toString());

    this.contadorService.listarConsumos(params).subscribe({
      next: res => this.registros = res.registros,
      error: err => console.error('Erro ao buscar consumos:', err)
    });
  }

  removerRegistro(id: number) {
    if (!confirm('Confirma exclusão do registro?')) return;
    this.contadorService.deletar(id).subscribe({
      next: () => {
        this.registros = this.registros.filter(r => r.id !== id);
        this._snackBar.open('Registro removido com sucesso!', 'Ok', { duration: 3000 });
      },
      error: () => this._snackBar.open('Erro ao remover registro.', 'Fechar', { duration: 3000 })
    });
  }

  // --- LÓGICA DO MODAL ---

  abrirFormulario(registro?: ConsumoMensal): void {
    if (registro) { // Modo Edição
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
    } else { // Modo Criação
      this.editandoId = null;
      this.form.reset({ tarifa_social: false });
    }

    // Abre o diálogo usando o <ng-template>
    this.dialogRef = this.dialog.open(this.formDialogTemplate, {
      width: '550px',
      maxWidth: '95vw',
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (this.form.value.leitura_final < this.form.value.leitura_inicial) {
      this._snackBar.open('Leitura final deve ser maior ou igual à leitura inicial.', 'Fechar', { duration: 3000 });
      return;
    }
    const [ano, mes] = this.form.value.data.split('-').map(Number);
    const payload = { ...this.form.value, ano, mes };
    delete payload.data;

    const serviceCall = this.editandoId
      ? this.contadorService.atualizar(this.editandoId, payload)
      : this.contadorService.criar(payload);

    serviceCall.subscribe({
      next: () => {
        const message = this.editandoId ? 'Registro atualizado!' : 'Registro salvo!';
        this._snackBar.open(message, 'Ok', { duration: 3000 });
        this.dialogRef?.close(); // Fecha o diálogo
        this.aplicarFiltrosBackend(); // Atualiza a lista
      },
      error: err => {
        console.error(err);
        this._snackBar.open('Erro ao salvar registro.', 'Fechar', { duration: 3000 });
      }
    });
  }

  irParaResultados() {
    this.router.navigate(['/consumo-mensal-listar']);
  }

  fecharDialog(): void {
    this.dialogRef?.close();
  }

  // Funções auxiliares para nomes e cores
  getEstadoNome(estadoData: Estado | number): string {
    const estadoId = typeof estadoData === 'object' ? estadoData.id : estadoData;
    return this.estados.find(e => e.id === estadoId)?.nome || 'Desconhecido';
  }

  getBandeiraCor(bandeiraData: Bandeira | number): string {
    const bandeiraId = typeof bandeiraData === 'object' ? bandeiraData.id : bandeiraData;
    return this.bandeiras.find(b => b.id === bandeiraId)?.cor || 'Desconhecida';
  }
}
