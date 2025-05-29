import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule, MatCardModule],
  templateUrl: './dashboard.component.component.html',
  styleUrls: ['./dashboard.component.component.scss']
})
export class DashboardComponent implements OnInit {
  totalConsumo = 0;
  totalCusto = 0;
  aparelhosAtivos = 0;
  bandeiraAtual: { cor: string; descricao: string } | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Simulação de dados — substitua por chamada real ao backend
    this.totalConsumo = 1234.56;
    this.totalCusto = 789.01;
    this.aparelhosAtivos = 15;
    this.bandeiraAtual = { cor: '#f44336', descricao: 'Vermelha Patamar 2' };
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
