import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthCacheService } from '../services/auth-cache.service'; // Ajuste o caminho

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  message: string = '';

  // Expressão regular para domínios conhecidos em minúsculas
  private emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|zoho\.com|aol\.com|mail\.com|gmx\.com|web\.de|t-online\.de|libero\.it|terra\.com\.br|uol\.com\.br|bol\.com\.br|ig\.com\.br|r7\.com|zipmail\.com\.br)$/;

  constructor(private authCacheService: AuthCacheService, private router: Router) {}

  onRegister(): void {
    if (!this.username || !this.email) {
      this.message = 'Por favor, preencha todos os campos.';
      return;
    }

    if (!this.emailRegex.test(this.email)) {
      this.message = 'Formato de e-mail inválido. Por favor, insira um e-mail de um provedor conhecido e em minúsculas (ex: @gmail.com).';
      return;
    }

    // --- NOVA LÓGICA DE TRATAMENTO DO RETORNO DO SERVIÇO ---
    const registrationResult = this.authCacheService.register(this.username, this.email);

    if (registrationResult === 'success') {
      this.message = 'Cadastro realizado com sucesso! Por favor, faça login.';
      this.router.navigate(['/login']);
    } else if (registrationResult === 'username_taken') {
      this.message = 'Nome de usuário já está em uso. Por favor, escolha outro.';
    } else if (registrationResult === 'email_taken') {
      this.message = 'E-mail já está em uso. Por favor, insira outro e-mail.';
    } else {
      this.message = 'Erro ao cadastrar. Tente novamente.'; // Para outros casos de erro, como falha de armazenamento
    }
    // --- FIM DA NOVA LÓGICA ---
  }
}
