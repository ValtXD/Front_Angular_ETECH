import { Component, OnInit, OnDestroy } from '@angular/core';
import { OcrContadorService, LeituraOCR } from '../services/ocr-contador.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-lista-leituras',
  templateUrl: './lista-leituras.component.html',
  styleUrls: ['./lista-leituras.component.css'],
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  standalone: true
})
export class ListaLeiturasComponent implements OnInit, OnDestroy {
  leituras: LeituraOCR[] = [];
  private pollingSubscription?: Subscription;

  constructor(private ocrContadorService: OcrContadorService) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(5000)
      .pipe(switchMap(() => this.ocrContadorService.listarLeituras()))
      .subscribe((data) => {
        this.leituras = data;
      });

    this.ocrContadorService.listarLeituras().subscribe((data) => (this.leituras = data));
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
