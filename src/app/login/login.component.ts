import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthCacheService } from '../services/auth-cache.service'; // Ajuste o caminho

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class LoginComponent {
  username: string = '';
  message: string = '';

  constructor(private authCacheService: AuthCacheService, private router: Router) {}

  onLogin(): void {
    console.log('onLogin iniciado.');

    if (!this.username) {
      this.message = 'Por favor, insira o nome de usuário.';
      console.log('Nome de usuário vazio.');
      return;
    }

    if (this.authCacheService.login(this.username)) {
      this.message = 'Login realizado com sucesso!';
      console.log('Login bem-sucedido, redirecionando para /home.');
      this.router.navigate(['/home']); // Redireciona para a rota protegida 'home'
    } else {
      this.message = 'Nome de usuário não encontrado ou incorreto no cache.';
      console.log('Login falhou pelo serviço.');
    }
  }
}
