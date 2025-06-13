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
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  hidePassword: boolean = true;
  rememberMe: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';  // Defina a variável successMsg

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('Dados de login:', {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe,
    });

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.successMsg = 'Login realizado com sucesso!';
        this.router.navigate(['/app']);
      },
      error: () => {
        this.errorMsg = 'Usuário ou senha inválidos.';
        this.successMsg = ''; // Limpar a mensagem de sucesso em caso de erro
      },
    });
  }
}
