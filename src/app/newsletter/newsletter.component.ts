import { Component, OnInit, inject } from '@angular/core';
import { WelcomeComponent } from './news/welcome/welcome.component';
import { AuthService } from '../services/auth.service';

interface NewsItem {
  name: string;
  title: string;
  component: any;
}

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
  standalone: false,
})
export class NewsletterComponent implements OnInit {
  private auth = inject(AuthService);
  queue: NewsItem[] = [
    { name: 'welcome', title: 'Bem-vindo', component: WelcomeComponent },
  ];

  current?: NewsItem;
  isOpen = false;

  ngOnInit(): void {
    // Somente exibe após autenticação válida
    if (this.auth.isAuthenticated()) {
      this.next();
    } else {
      this.isOpen = false;
    }
  }

  continue(): void {
    if (this.current) {
      localStorage.setItem(`newsletter_${this.current.name}`, '1');
    }
    this.next();
  }

  private next(): void {
    this.current = undefined;
    for (const item of this.queue) {
      if (!localStorage.getItem(`newsletter_${item.name}`)) {
        this.current = item;
        break;
      }
    }
    this.isOpen = !!this.current;
  }
}
