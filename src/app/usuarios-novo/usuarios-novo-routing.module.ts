import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosNovoPage } from './usuarios-novo.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosNovoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosNovoPageRoutingModule {}

