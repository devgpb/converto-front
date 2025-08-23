import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  standalone: true,
  imports: [IonicModule],
})
export class ConfiguracoesPage {
  theme = inject(ThemeService);

  toggleDark(event: CustomEvent): void {
    this.theme.setDarkMode((event as any).detail.checked);
  }
}
