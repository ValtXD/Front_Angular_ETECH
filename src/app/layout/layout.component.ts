import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterModule } from '@angular/router';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';
import { Component, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthCacheService, UserProfile } from '../services/auth-cache.service';
import { NgIf } from '@angular/common';

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

  isSidenavMini: boolean = false;
  currentUser: UserProfile | null = null;
  private userSubscription: Subscription = new Subscription();
  private isSidenavOpenOnDesktopInitially: boolean = true;

  constructor(
    private authCacheService: AuthCacheService,
    private router: Router
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustSidenavForScreenSize(event.target.innerWidth);
  }

  ngAfterViewInit() {
    this.adjustSidenavForScreenSize(window.innerWidth);
  }

  private adjustSidenavForScreenSize(width: number) {
    if (width < 768) {
      this.sidenav.mode = 'over';
      this.sidenav.close();
      this.isSidenavMini = false;
    } else {
      this.sidenav.mode = 'side';
      this.sidenav.open();
      if (this.isSidenavOpenOnDesktopInitially) {
        this.isSidenavMini = false;
      } else {
        this.isSidenavMini = true;
      }
    }
  }

  toggleSidenavMini() {
    if (this.sidenav.mode === 'over') {
      this.sidenav.toggle();
    } else {
      this.isSidenavMini = !this.isSidenavMini;
      if (!this.sidenav.opened) {
        this.sidenav.open();
      }
    }
  }

  onSidenavClose() {
    if (this.sidenav.mode === 'over') {
      this.sidenav.close();
    }
  }

  onLogout() {
    this.authCacheService.logout();
    this.router.navigate(['/login']);
  }

  onDeleteAccount(): void {
    if (this.currentUser && confirm(`Tem certeza que deseja EXCLUIR a conta de "${this.currentUser.username}"? Esta ação é irreversível e removerá seus dados salvos localmente.`)) {
      const usernameToDelete = this.currentUser.username;
      if (this.authCacheService.deleteAccount(usernameToDelete)) {
        alert(`A conta de "${usernameToDelete}" foi excluída com sucesso.`);
        this.router.navigate(['/register']);
      } else {
        alert(`Não foi possível excluir a conta de "${usernameToDelete}".`);
      }
    }
  }
}
