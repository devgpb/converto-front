import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from './header/header.component';
import { GearBackgroundComponent } from './gear-background/gear-background.component';

@NgModule({
  declarations: [HeaderComponent, GearBackgroundComponent],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, GearBackgroundComponent],
})
export class ComponentsModule {}

