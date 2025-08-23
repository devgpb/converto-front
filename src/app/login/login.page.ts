import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: false,
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements AfterViewInit, OnDestroy {
  @ViewChild('vantaRef', { static: true }) vantaRef!: ElementRef;
  private vantaEffect?: any;

  form: FormGroup;
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    const init = () => {
      this.vantaEffect = (window as any).VANTA.WAVES({
        el: this.vantaRef.nativeElement,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        waveHeight: 15,
        waveSpeed: 0.5,
        color: 0x00c16a,
      });
    };

    const scripts: Promise<void>[] = [];
    if (!(window as any).THREE) {
      scripts.push(loadScript('https://unpkg.com/three@0.152.2/build/three.min.js'));
    }
    if (!(window as any).VANTA) {
      scripts.push(loadScript('https://unpkg.com/vanta@latest/dist/vanta.waves.min.js'));
    }
    Promise.all(scripts).then(init);
  }

  ngOnDestroy(): void {
    this.vantaEffect?.destroy();
  }

  get themeIcon(): string {
    return this.theme.isDarkMode() ? 'sunny' : 'moon';
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/vendas/dashboard']),
    });
  }
}
