import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private router = inject(Router);
  private theme = inject(ThemeService);
  private auth = inject(AuthService);
  public isPublicPage = false;
  private publicRoutes = ['/login', '/planos', '/cadastro', '/checkout', '/confirmacao', '/esqueci-senha', '/redefinir-senha'];

  constructor() {
    this.theme.init();
    this.isPublicPage = this.publicRoutes.some((p) => this.router.url.startsWith(p));
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isPublicPage = this.publicRoutes.some((p) => e.urlAfterRedirects.startsWith(p));
      });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleDark(ev: CustomEvent) {
    this.theme.setDarkMode(ev.detail.checked);
  }



}
