import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthAdminGuard } from './auth/auth.admin.guard';
import { AuthEmployeeGuard } from './auth/auth.employee.guard';
import { AuthUserGuard } from './auth/auth.user.guard';

const routes: Routes = [
    {path: '', redirectTo: 'auth', pathMatch: 'full'},
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule)
    },
    {
        path: 'signup',
        loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule)
    },
    {
        path: 'admin/home',
        loadChildren: () => import('./admin/home/home.module').then(m => m.HomePageModule),
        canLoad: [AuthAdminGuard]
    },
    {
        path: 'employee/home',
        loadChildren: () => import('./employee/home/home.module').then(m => m.HomePageModule),
        canLoad: [AuthEmployeeGuard]
    },
    {
        path: 'user/home',
        loadChildren: () => import('./user/home/home.module').then(m => m.HomePageModule),
        canLoad: [AuthUserGuard]
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
