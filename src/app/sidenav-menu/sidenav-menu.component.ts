import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import necessário se for standalone
import { RouterModule } from '@angular/router'; // Import necessário para routerLink
import { MatIconModule } from '@angular/material/icon'; // Import para mat-icon
import { MatListModule } from '@angular/material/list'; // Import para mat-nav-list, mat-list-item
import { MatDividerModule } from '@angular/material/divider'; // Import para mat-divider

@Component({
  selector: 'app-sidenav-menu',
  standalone: true, // Se o seu projeto usa componentes standalone
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.scss']
})
export class SidenavMenuComponent {
  @Output() menuItemClicked = new EventEmitter<void>();

  onMenuItemClick() {
    this.menuItemClicked.emit();
  }
}
