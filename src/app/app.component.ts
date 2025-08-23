import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private router = inject(Router);
  private theme = inject(ThemeService);
  public isLoginPage = false;

  constructor() {
    this.theme.init();
    this.isLoginPage = this.router.url === '/login';
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isLoginPage = e.urlAfterRedirects === '/login';
      });
  }
  
  toggleDark(ev: CustomEvent) {
    this.theme.setDarkMode(ev.detail.checked);
  }



}
