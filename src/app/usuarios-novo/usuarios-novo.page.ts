import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios-novo',
  templateUrl: './usuarios-novo.page.html',
  standalone: false,
})
export class UsuariosNovoPage {
  private usuarios = inject(UsuariosService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  isSubmitting = false;

  // feedback modal state
  showResult = false;
  resultOk = false;
  resultTitle = '';
  resultMessage = '';
  resultIcon = 'information-circle-outline';

  create(): void {
    if (!this.email || !this.password || !this.name) return;
    this.isSubmitting = true;
    this.usuarios.create(this.email, this.password, this.name).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.resultOk = true;
        this.resultTitle = 'Usuário criado';
        this.resultMessage = 'O usuário foi criado com sucesso.';
        this.resultIcon = 'checkmark-circle-outline';
        this.showResult = true;
        setTimeout(() => {
          this.showResult = false;
          this.router.navigate(['/usuarios']);
        }, 1400);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.resultOk = false;
        this.resultTitle = 'Não foi possível criar';
        const msg = err?.error?.error || err?.error?.message || 'Erro desconhecido';
        this.resultMessage = msg;
        this.resultIcon = 'alert-circle-outline';
        this.showResult = true;
      }
    });
  }
}
