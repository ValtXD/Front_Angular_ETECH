import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service'; // ✅ importado

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
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
  errorMsg: string = '';
  successMsg: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.username && this.email && this.password) {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: () => {
          this.successMsg = 'Cadastro realizado com sucesso!';
          this.errorMsg = '';
          // Limpa os campos
          this.username = '';
          this.email = '';
          this.password = '';
          // Redireciona para o login
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.errorMsg = 'Erro ao cadastrar. Verifique os dados ou tente novamente.';
          this.successMsg = '';
          console.error(err);
        },
      });
    } else {
      this.errorMsg = 'Por favor, preencha todos os campos corretamente.';
      this.successMsg = '';
    }
  }
}
