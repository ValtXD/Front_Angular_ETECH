import {MatSidenav} from '@angular/material/sidenav';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {Router, RouterModule} from '@angular/router';
import {SidenavMenuComponent} from '../sidenav-menu/sidenav-menu.component';
import {Component, HostListener, ViewChild} from '@angular/core';

import {Subscription} from 'rxjs';
import {AuthCacheService, UserProfile} from '../services/auth-cache.service';
import {MatTooltip} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    RouterModule,
    SidenavMenuComponent,
  ]
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isSidenavMini: boolean = false; // Propriedade para controlar o estado mini do sidenav
  currentUser: UserProfile | null = null;
  private userSubscription: Subscription = new Subscription();
  // Define o estado de abertura inicial do sidenav em desktop.
  // Se quiser que ele comece no modo MINI em desktop, mude para 'false'.
  private isSidenavOpenOnDesktopInitially: boolean = true;

  constructor(
    private authCacheService: AuthCacheService,
    private router: Router
  ) {

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustSidenavForScreenSize(event.target.innerWidth);
  }

  ngAfterViewInit() {
    this.adjustSidenavForScreenSize(window.innerWidth);
  }

  private adjustSidenavForScreenSize(width: number) {
    if (width < 768) { // Mobile/Tablet: Sidenav sempre 'over' e fechado
      this.sidenav.mode = 'over';
      this.sidenav.close();
      this.isSidenavMini = false; // Não aplica modo mini em mobile
    } else { // Desktop: Sidenav sempre 'side'
      this.sidenav.mode = 'side';
      // Garante que o sidenav esteja aberto para poder empurrar o conteúdo
      this.sidenav.open();

      // Define o estado mini baseado na preferência inicial do desktop
      if (this.isSidenavOpenOnDesktopInitially) {
        this.isSidenavMini = false; // Inicia totalmente aberto
      } else {
        this.isSidenavMini = true; // Inicia no modo mini
      }
    }
  }

  // MÉTODO ATUALIZADO PARA ALTERNAR ENTRE ABERTO E MINI (ou abrir/fechar em mobile)
  toggleSidenavMini() {
    if (this.sidenav.mode === 'over') { // Se estiver em mobile ('over' mode)
      this.sidenav.toggle(); // Comportamento padrão de abrir/fechar completamente
    } else { // Se estiver em desktop ('side' mode)
      this.isSidenavMini = !this.isSidenavMini; // Alterna o estado mini
      // Importante: No modo 'side', o sidenav deve permanecer 'opened' (aberto no TS)
      // para continuar empurrando o conteúdo. A mudança visual é CSS.
      // Se por algum motivo ele estiver fechado, reabra-o para aplicar o mini-estado.
      if (!this.sidenav.opened) {
        this.sidenav.open();
      }
    }
  }

  // Método chamado quando um item no sidenav é clicado (útil para fechar em 'over' mode)
  onSidenavClose() {
    if (this.sidenav.mode === 'over') { // Fecha o sidenav APENAS se estiver em mobile
      this.sidenav.close();
    }
    // Em modo 'side' (desktop), clicar em um item não afeta o estado aberto/mini.
  }
  onLogout() {
    this.authCacheService.logout();
    this.router.navigate(['/login']);
  }

  // MÉTODO PARA EXCLUIR CONTA - AGORA PASSA O USERNAME
  onDeleteAccount(): void {
    if (this.currentUser && confirm(`Tem certeza que deseja EXCLUIR a conta de "${this.currentUser.username}"? Esta ação é irreversível e removerá seus dados salvos localmente.`)) {
      const usernameToDelete = this.currentUser.username;
      if (this.authCacheService.deleteAccount(usernameToDelete)) {
        alert(`A conta de "${usernameToDelete}" foi excluída com sucesso.`);
        this.router.navigate(['/register']); // Redireciona para o registro após a exclusão
      } else {
        alert(`Não foi possível excluir a conta de "${usernameToDelete}".`);
      }
    }
  }
}
