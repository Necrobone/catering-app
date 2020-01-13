import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'headquarters',
    loadChildren: () => import('./headquarters/headquarters.module').then( m => m.HeadquartersPageModule)
  },
  {
    path: 'suppliers',
    loadChildren: () => import('./suppliers/suppliers.module').then( m => m.SuppliersPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
