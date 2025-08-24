import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ViewPreferenceService {
  private readonly STORAGE_KEY = 'clientesViewMode';

  getViewMode(): 'cards' | 'table' {
    const mode = localStorage.getItem(this.STORAGE_KEY);
    return mode === 'table' ? 'table' : 'cards';
  }

  setViewMode(mode: 'cards' | 'table'): void {
    localStorage.setItem(this.STORAGE_KEY, mode);
  }
}
