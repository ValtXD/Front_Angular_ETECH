import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContadorEnergiaService, ContadorEnergia } from '../services/contador-energia.service';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-resultados-contador',
  templateUrl: './resultados-contador.component.html',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe
  ],
  styleUrls: ['./resultados-contador.component.css']
})
export class ResultadosContadorComponent implements OnInit {
  registros: ContadorEnergia[] = [];

  constructor(private service: ContadorEnergiaService, private router: Router) {}

  ngOnInit() {
    this.carregarRegistros();
  }

  carregarRegistros() {
    this.service.listar().subscribe(data => {
      this.registros = data;
    });
  }

  excluir(id: number) {
    if (confirm('Deseja excluir este registro?')) {
      this.service.deletar(id).subscribe(() => {
        this.carregarRegistros();
      });
    }
  }

  voltarCalcular() {
    this.router.navigate(['/calcular-contador']);
  }

  irGrafico() {
    this.router.navigate(['/grafico-contador']);
  }
}
