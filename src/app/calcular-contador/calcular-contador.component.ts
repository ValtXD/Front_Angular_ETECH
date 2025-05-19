import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ContadorEnergiaService } from '../services/contador-energia.service';
import {FormsModule} from '@angular/forms';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-calcular-contador',
  templateUrl: './calcular-contador.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe
  ],
  styleUrls: ['./calcular-contador.component.css']
})
export class CalcularContadorComponent {
  estado = '';
  bandeira = '';
  tarifaSocial = false;
  leituraAnterior = 0;
  leituraAtual = 0;
  dataRegistro = '';

  minDate = '';
  maxDate = '';

  consumo = 0;

  constructor(private service: ContadorEnergiaService, private router: Router) {
    const hoje = new Date();
    this.maxDate = hoje.toISOString().split('T')[0];
    const mesAtras = new Date(hoje);
    mesAtras.setMonth(mesAtras.getMonth() - 1);
    this.minDate = mesAtras.toISOString().split('T')[0];
    this.dataRegistro = this.maxDate;
  }

  calcular() {
    const consumoCalculado = this.leituraAtual - this.leituraAnterior;
    if (consumoCalculado < 0) {
      alert('Leitura atual não pode ser menor que a anterior');
      return;
    }
    this.consumo = consumoCalculado;
  }

  salvar() {
    if (!this.estado || !this.bandeira) {
      alert('Informe estado e bandeira');
      return;
    }

    const payload = {
      estado: this.estado,
      bandeira: this.bandeira,
      tarifa_social: this.tarifaSocial,
      leitura_anterior: this.leituraAnterior,
      leitura_atual: this.leituraAtual,
      data_registro: this.dataRegistro
    };

    this.service.criar(payload).subscribe(() => {
      alert('Registro salvo com sucesso!');
      this.router.navigate(['/resultados-contador']);
    }, err => {
      alert('Erro ao salvar: ' + (err.error?.error || err.message));
    });
  }
}
