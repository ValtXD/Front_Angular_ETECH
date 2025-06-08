import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Necessário para [(ngModel)]
import { CommonModule } from '@angular/common'; // Necessário para *ngIf
import { RouterModule } from '@angular/router'; // Necessário para routerLink

// Módulos do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Para ícones
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para checkbox

// Se você tiver um AuthService, importe-o aqui
// import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login', // Verifique se o seletor está correto para seu componente de login
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true, // Se o seu componente for standalone
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true; // Para o toggle de visibilidade da senha
  rememberMe: boolean = false; // Para o checkbox "Lembrar-me"
  errorMsg: string = ''; // Mensagem de erro geral

  // Se usar AuthService, descomente e ajuste:
  // constructor(private authService: AuthService, private router: Router) {}
  constructor() {} // Construtor básico se não tiver serviços

  onSubmit() {
    console.log('Dados de login:', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    });

    // Lógica de autenticação (substitua pela sua lógica de backend)
    if (this.email === 'test@example.com' && this.password === 'password') {
      this.errorMsg = '';
      console.log('Login bem-sucedido!');
      // Se usar router, descomente e ajuste:
      // this.router.navigate(['/app']);
    } else {
      this.errorMsg = 'E-mail ou senha inválidos.';
    }
  }
}
