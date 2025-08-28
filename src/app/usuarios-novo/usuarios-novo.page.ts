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

  create(): void {
    this.usuarios.create(this.email, this.password, this.name).subscribe(() => {
      this.router.navigate(['/usuarios']);
    });
  }
}
