import { Component, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Imports do Angular Material
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

// Imports de Serviços e Componentes Personalizados
import { AuthService } from '../services/auth.service'; // Ajuste o caminho se necessário


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'], // Unificado para usar SCSS
  standalone: true,
  imports: [
    // Módulos do Angular
    CommonModule,
    RouterModule,

    // Módulos do Angular Material
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,


  ],
})
export class LayoutComponent implements AfterViewInit {
  // ViewChild para obter a referência do componente sidenav no template
  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Controla se o sidenav está no modo "mini" (recolhido)
  isSidenavMini: boolean = false;

  // Define se o sidenav deve começar aberto ou fechado em desktops
  private isSidenavOpenOnDesktopInitially: boolean = true;

  /**
   * Construtor para injetar os serviços necessários.
   * @param authService - Serviço para gerenciar a autenticação do usuário.
   * @param router - Serviço para gerenciar a navegação entre rotas.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Hook do ciclo de vida chamado após a inicialização da view do componente.
   * Ajusta o sidenav com base no tamanho inicial da tela.
   */
  ngAfterViewInit() {
    // Garante que o código só execute no navegador, onde 'window' está disponível
    if (typeof window !== 'undefined') {
      this.adjustSidenavForScreenSize(window.innerWidth);
    }
  }

  /**
   * Listener que detecta o redimensionamento da janela do navegador.
   * @param event - O evento de redimensionamento.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustSidenavForScreenSize(event.target.innerWidth);
  }

  /**
   * Ajusta o modo e o estado do sidenav com base na largura da tela.
   * @param width - A largura atual da tela.
   */
  private adjustSidenavForScreenSize(width: number) {
    if (width < 768) { // Telas de Mobile/Tablet
      this.sidenav.mode = 'over'; // Sidenav flutua sobre o conteúdo
      this.sidenav.close();
      this.isSidenavMini = false; // Modo mini não se aplica
    } else { // Telas de Desktop
      this.sidenav.mode = 'side'; // Sidenav empurra o conteúdo
      this.sidenav.open();

      // Define o estado inicial (aberto ou mini) para desktop
      this.isSidenavMini = !this.isSidenavOpenOnDesktopInitially;
    }
  }

  /**
   * Alterna o estado do sidenav.
   * Em mobile: abre/fecha completamente.
   * Em desktop: alterna entre o modo completo e o modo "mini".
   */
  toggleSidenav() {
    if (this.sidenav.mode === 'over') {
      this.sidenav.toggle(); // Abre ou fecha em telas menores
    } else {
      this.isSidenavMini = !this.isSidenavMini; // Alterna o modo mini em desktops
    }
  }

  /**
   * Chamado quando um item do menu é clicado.
   * Fecha o sidenav se estiver no modo 'over' (mobile).
   */
  onSidenavItemClick() {
    if (this.sidenav.mode === 'over') {
      this.sidenav.close();
    }
  }

  /**
   * Realiza o logout do usuário, limpa os dados de autenticação
   * e redireciona para a página de login.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
