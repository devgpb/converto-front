import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-extension-reminder-modal',
  templateUrl: './extension-reminder-modal.component.html',
  styleUrls: ['./extension-reminder-modal.component.scss'],
  standalone: false,
})
export class ExtensionReminderModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  readonly installUrl =
    'https://chromewebstore.google.com/detail/converto-crm/fddnccmdackeflbidapfcffaeamliigd?hl=pt-BR&utm_source=ext_sidebar';

  private readonly extensionMarkerId = 'converto_ext_true';
  private readonly extensionDismissKey = 'converto_ext_dismiss_until';
  private readonly extensionDismissDays = 10;
  private checkHandle: number | null = null;
  private checkAttempts = 0;
  private readonly checkMaxAttempts = 10;
  private readonly checkInterval = 100;

  ngOnInit(): void {
    if (this.isMobile()) return;
    this.scheduleExtensionCheck(0, true);
  }

  ngOnDestroy(): void {
    this.clearScheduledCheck();
  }

  onRetry(): void {
    this.clearExtensionDismissal();
    window.location.reload();
  }

  onDismiss(): void {
    this.isOpen = false;
    this.clearScheduledCheck();
    this.storeExtensionDismissUntil(this.computeDismissUntilDate());
  }

  private scheduleExtensionCheck(delay = 0, resetAttempts = false): void {
    if (typeof window === 'undefined') return;
    if (this.isMobile()) return;
    if (resetAttempts) {
      this.checkAttempts = 0;
      this.isOpen = false;
    }
    if (this.shouldSkipExtensionCheck()) {
      this.isOpen = false;
      return;
    }
    this.clearScheduledCheck();
    this.checkHandle = window.setTimeout(() => this.evaluateExtensionPresence(), delay);
  }

  private evaluateExtensionPresence(): void {
    const markerPresent = typeof document !== 'undefined' && !!document.getElementById(this.extensionMarkerId);
    if (markerPresent) {
      this.isOpen = false;
      this.clearScheduledCheck();
      return;
    }

    this.checkAttempts += 1;
    if (this.checkAttempts >= this.checkMaxAttempts) {
      this.isOpen = true;
      this.clearScheduledCheck();
      return;
    }

    this.checkHandle = window.setTimeout(() => this.evaluateExtensionPresence(), this.checkInterval);
  }

  private shouldSkipExtensionCheck(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(this.extensionDismissKey);
      if (!stored) return false;
      const until = new Date(stored);
      if (Number.isNaN(until.getTime())) {
        this.clearExtensionDismissal();
        return false;
      }
      if (until.getTime() > Date.now()) {
        return true;
      }
      this.clearExtensionDismissal();
      return false;
    } catch {
      return false;
    }
  }

  private storeExtensionDismissUntil(dateIso: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.extensionDismissKey, dateIso);
    } catch {
      // ignore storage failures
    }
  }

  private clearExtensionDismissal(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(this.extensionDismissKey);
    } catch {
      // ignore storage failures
    }
  }

  private computeDismissUntilDate(): string {
    const now = new Date();
    now.setDate(now.getDate() + this.extensionDismissDays);
    return now.toISOString();
  }

  private clearScheduledCheck(): void {
    if (this.checkHandle !== null) {
      window.clearTimeout(this.checkHandle);
      this.checkHandle = null;
    }
  }

  private isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  }
}
