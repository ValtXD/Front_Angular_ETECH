import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon'; // Importe MatIconModule
import {MatCheckboxModule} from '@angular/material/checkbox'; // Importe MatCheckboxModule

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule, // Use MatIconModule
    MatCheckboxModule, // Use MatCheckboxModule
  ],
})
export class LoginComponent {
  // Removi 'username' se 'email' é o que você usa para o login
  email: string = ''; // Campo para o e-mail
  password: string = ''; // Campo para a senha
  hidePassword: boolean = true; // <-- NOVA VARIÁVEL BOLEANA para controlar a visibilidade da senha
  rememberMe: boolean = false; // <-- CORRIGIDO para BOOLEAN
  errorMsg: string = ''; // Mensagem de erro

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Note: Sua lógica de login ainda usa 'this.username',
    // mas o HTML agora usa 'this.email'.
    // Você precisará decidir qual usar (email ou username) e ajustar aqui.
    // Se for 'email', mude 'this.username' para 'this.email'.
    this.authService.login(this.email, this.password).subscribe({ // Ajustei para 'this.email' aqui
      next: () => this.router.navigate(['/app']),  // Navega para o Layout principal após o login
      error: () => (this.errorMsg = 'E-mail ou senha inválidos.'), // Ajustei a mensagem
    });
  }
}
