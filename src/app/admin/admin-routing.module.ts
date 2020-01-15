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
  },
  {
    path: 'dishes',
    loadChildren: () => import('./dishes/dishes.module').then( m => m.DishesPageModule)
  },
  {
    path: 'menus',
    loadChildren: () => import('./menus/menus.module').then( m => m.MenusPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
