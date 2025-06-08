import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Necessário para [(ngModel)]
import { CommonModule } from '@angular/common'; // Necessário para *ngIf
import { RouterModule } from '@angular/router'; // Necessário para routerLink

// Módulos do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Caso você adicione ícones (não usado no HTML atual, mas bom ter)

@Component({
  selector: 'app-register', // Verifique se o seletor está correto para seu componente
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'], // Use .scss
  standalone: true, // Se o seu componente for standalone
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMsg: string = ''; // Mensagem de erro geral
  successMsg: string = ''; // Mensagem de sucesso geral

  constructor() {
    // Se você tiver serviços para backend, injete-os aqui
    // Ex: private authService: AuthService
  }

  onSubmit() {
    // Lógica de submissão do formulário de cadastro
    console.log('Dados de Cadastro:', {
      username: this.username,
      email: this.email,
      password: this.password
    });

    // Exemplo de validação simples (substitua pela sua lógica de backend)
    if (this.username && this.email && this.password) {
      this.successMsg = 'Cadastro realizado com sucesso!';
      this.errorMsg = ''; // Limpa a mensagem de erro
      // Resetar os campos do formulário (opcional)
      this.username = '';
      this.email = '';
      this.password = '';
    } else {
      this.errorMsg = 'Por favor, preencha todos os campos corretamente.';
      this.successMsg = ''; // Limpa a mensagem de sucesso
    }
  }
}
