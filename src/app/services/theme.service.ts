import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private storageKey = 'darkMode';
  private dark = false;

  init(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored !== null) {
      this.dark = stored === 'true';
    } else {
      this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.apply();
  }

  isDarkMode(): boolean {
    return this.dark;
  }

  toggle(): void {
    this.dark = !this.dark;
    this.apply();
  }

  setDarkMode(isDark: boolean): void {
    this.dark = isDark;
    this.apply();
  }

  private apply(): void {
    document.body.classList.toggle('dark', this.dark);
    localStorage.setItem(this.storageKey, String(this.dark));
  }
}

