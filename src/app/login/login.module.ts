import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { GearBackgroundComponent } from '../components/gear-background/gear-background.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, LoginPageRoutingModule],
  declarations: [LoginPage, GearBackgroundComponent],
})
export class LoginPageModule {}
