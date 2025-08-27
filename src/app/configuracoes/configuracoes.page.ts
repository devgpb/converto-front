import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  standalone: false,
})
export class ConfiguracoesPage {
  theme = inject(ThemeService);

  toggleDark(event: CustomEvent): void {
    this.theme.setDarkMode((event as any).detail.checked);
  }
}
