import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private menu = inject(MenuController);
  title = '';
  menuOpen = false;
  private sub!: Subscription;
  private cleanupMenuListeners?: () => void;

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.route),
        map((r) => {
          while (r.firstChild) {
            r = r.firstChild;
          }
          return r;
        }),
        mergeMap((r) => r.data)
      )
      .subscribe((data) => {
        this.title = data['title'] || '';
      });
  }

  async ngAfterViewInit(): Promise<void> {
    const menuEl = await this.menu.get('main-menu');
    if (!menuEl) {
      return;
    }

    const handleOpen = () => {
      this.menuOpen = true;
    };
    const handleClose = () => {
      this.menuOpen = false;
    };

    menuEl.addEventListener('ionDidOpen', handleOpen);
    menuEl.addEventListener('ionDidClose', handleClose);

    this.cleanupMenuListeners = () => {
      menuEl.removeEventListener('ionDidOpen', handleOpen);
      menuEl.removeEventListener('ionDidClose', handleClose);
    };

    this.menuOpen = await menuEl.isOpen();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.cleanupMenuListeners?.();
  }
}
