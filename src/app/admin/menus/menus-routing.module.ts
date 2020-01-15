import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenusPage } from './menus.page';

const routes: Routes = [
  {
    path: '',
    component: MenusPage
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then( m => m.AddPageModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./edit/edit.module').then( m => m.EditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenusPageRoutingModule {}
