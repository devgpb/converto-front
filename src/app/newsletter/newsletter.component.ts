import { Component, OnInit } from '@angular/core';
import { WelcomeComponent } from './news/welcome/welcome.component';

interface NewsItem {
  name: string;
  title: string;
  component: any;
}

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
})
export class NewsletterComponent implements OnInit {
  queue: NewsItem[] = [
    { name: 'welcome', title: 'Bem-vindo', component: WelcomeComponent },
  ];

  current?: NewsItem;
  isOpen = false;

  ngOnInit(): void {
    this.next();
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
