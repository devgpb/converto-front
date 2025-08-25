import { Component, Input, OnInit } from '@angular/core';

interface Gear {
  left: number;
  size: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-gear-background',
  standalone: false,
  templateUrl: './gear-background.component.html',
  styleUrls: ['./gear-background.component.scss'],
})
export class GearBackgroundComponent implements OnInit {
  @Input() gearCount = 8;
  @Input() color = '#00c16a';
  @Input() minSize = 40;
  @Input() maxSize = 80;
  @Input() minDuration = 10;
  @Input() maxDuration = 20;

  gears: Gear[] = [];

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.generateGears();
  }

  private generateGears(): void {
    this.gears = Array.from({ length: this.gearCount }).map(() => {
      const size = this.random(this.minSize, this.maxSize);
      return {
        left: Math.random() * 100,
        size,
        duration: this.random(this.minDuration, this.maxDuration),
        delay: Math.random() * 2,
      };
    });
  }

  private random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

