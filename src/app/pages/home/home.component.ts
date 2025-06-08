// src/app/pages/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContadorService, AiTip } from '../../services/contador.service'; // Para dicas de contador
import { ApiService, ApplianceAiTip } from '../../services/api.service'; // Para dicas de aparelhos

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  // Dicas do Contador (EXISTENTES)
  contadorAiTips: AiTip[] = [];
  isContadorModalOpen: boolean = false;
  currentContadorTip: AiTip | null = null;
  selectedContadorTipIndex: number | null = null;

  // Dicas de Aparelhos (NOVAS)
  applianceAiTips: ApplianceAiTip[] = [];
  isApplianceModalOpen: boolean = false;
  currentApplianceTip: ApplianceAiTip | null = null;
  selectedApplianceTipIndex: number | null = null;

  constructor(
    private contadorService: ContadorService, // Para dicas do contador
    private apiService: ApiService // Para dicas de aparelhos
  ) {}

  ngOnInit() {
    this.loadContadorAiTips();
    this.loadApplianceAiTips(); // Carrega as novas dicas de aparelhos
  }

  // --- Lógica para Dicas do Contador ---
  loadContadorAiTips() {
    this.contadorService.getAiTips().subscribe({
      next: (tips) => {
        this.contadorAiTips = tips.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
        console.log('Dicas de Contador carregadas:', this.contadorAiTips);
      },
      error: (err) => {
        console.error('Erro ao carregar dicas de Contador da IA:', err);
      }
    });
  }

  openContadorTipModal(tip: AiTip, index: number) {
    this.currentContadorTip = tip;
    this.selectedContadorTipIndex = index;
    this.isContadorModalOpen = true;
  }

  closeContadorModal() {
    this.isContadorModalOpen = false;
    this.currentContadorTip = null;
    this.selectedContadorTipIndex = null;
  }

  nextContadorTip() {
    if (this.selectedContadorTipIndex !== null && this.selectedContadorTipIndex < this.contadorAiTips.length - 1) {
      this.selectedContadorTipIndex++;
      this.currentContadorTip = this.contadorAiTips[this.selectedContadorTipIndex];
    }
  }

  previousContadorTip() {
    if (this.selectedContadorTipIndex !== null && this.selectedContadorTipIndex > 0) {
      this.selectedContadorTipIndex--;
      this.currentContadorTip = this.contadorAiTips[this.selectedContadorTipIndex];
    }
  }

  deleteContadorTip(id: number | undefined) {
    if (id === undefined) {
      console.error('ID da dica do contador é indefinido, não é possível deletar.');
      return;
    }
    if (confirm('Tem certeza que deseja remover esta dica do contador?')) {
      this.contadorService.deleteAiTip(id).subscribe({
        next: () => {
          console.log('Dica do contador removida com sucesso!');
          this.closeContadorModal();
          this.loadContadorAiTips();
        },
        error: (err) => {
          console.error('Erro ao remover dica do contador:', err);
        }
      });
    }
  }

  // --- Lógica para Dicas de Aparelhos (NOVAS) ---
  loadApplianceAiTips() {
    this.apiService.getApplianceAiTips().subscribe({
      next: (tips) => {
        this.applianceAiTips = tips.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        });
        console.log('Dicas de Aparelhos carregadas:', this.applianceAiTips);
      },
      error: (err) => {
        console.error('Erro ao carregar dicas de Aparelhos da IA:', err);
      }
    });
  }

  openApplianceTipModal(tip: ApplianceAiTip, index: number) {
    this.currentApplianceTip = tip;
    this.selectedApplianceTipIndex = index;
    this.isApplianceModalOpen = true;
  }

  closeApplianceModal() {
    this.isApplianceModalOpen = false;
    this.currentApplianceTip = null;
    this.selectedApplianceTipIndex = null;
  }

  nextApplianceTip() {
    if (this.selectedApplianceTipIndex !== null && this.selectedApplianceTipIndex < this.applianceAiTips.length - 1) {
      this.selectedApplianceTipIndex++;
      this.currentApplianceTip = this.applianceAiTips[this.selectedApplianceTipIndex];
    }
  }

  previousApplianceTip() {
    if (this.selectedApplianceTipIndex !== null && this.selectedApplianceTipIndex > 0) {
      this.selectedApplianceTipIndex--;
      this.currentApplianceTip = this.applianceAiTips[this.selectedApplianceTipIndex];
    }
  }

  deleteApplianceTip(id: number | undefined) {
    if (id === undefined) {
      console.error('ID da dica de aparelho é indefinido, não é possível deletar.');
      return;
    }
    if (confirm('Tem certeza que deseja remover esta dica de aparelho?')) {
      this.apiService.deleteApplianceAiTip(id).subscribe({
        next: () => {
          console.log('Dica de aparelho removida com sucesso!');
          this.closeApplianceModal();
          this.loadApplianceAiTips();
        },
        error: (err) => {
          console.error('Erro ao remover dica de aparelho:', err);
        }
      });
    }
  }
}
