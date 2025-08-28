import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SeatsService } from '../services/seats.service';
import { AuthService } from '../services/auth.service';
import { UsuariosService, Usuario } from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  standalone: false,
})
export class UsuariosPage {
  private seats = inject(SeatsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private usuarios = inject(UsuariosService);
  public userId: any

  usage?: any;
  users: Usuario[] = [];
  newUserId = '';

  ionViewWillEnter(): void {
    this.load();
  }

  private load(): void {
    const tenantId = this.auth.getTenantId();
    this.userId = this.auth.getUserId();
    if (tenantId) {
      this.seats.getUsage(tenantId).subscribe((u) => {
        this.usage = u
        this.users = u.users
      });
    }
  }

  sync(): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId) {
      this.seats.sync(tenantId).subscribe(() => this.load());
    }
  }

  add(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  remove(userId: any): void {
    const tenantId = this.auth.getTenantId();
    if (tenantId && userId) {
      this.seats.remove(tenantId, userId).subscribe(() => this.load());
    }
  }

  changeRole(user: Usuario): void {
    if (user.principal) {
      return;
    }
    const id = user.user_id ?? user.id;
    const role = user.role;
    if (!id) {
      return;
    }
    if (confirm('Deseja alterar o cargo?')) {
      this.usuarios.changeRole(id, role).subscribe(() => this.load());
    } else {
      this.load();
    }
  }
}

