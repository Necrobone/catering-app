import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeadquartersPage } from './headquarters.page';

const routes: Routes = [
  {
    path: '',
    component: HeadquartersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HeadquartersPageRoutingModule {}
