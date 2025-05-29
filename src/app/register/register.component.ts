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

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.successMsg = 'Cadastro realizado com sucesso! Redirecionando para login...';
        this.errorMsg = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => (this.errorMsg = 'Erro ao cadastrar usuário.'),
    });
  }
}
