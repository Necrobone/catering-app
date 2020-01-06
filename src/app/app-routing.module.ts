import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthAdminGuard } from './auth/auth.admin.guard';
import { AuthEmployeeGuard } from './auth/auth.employee.guard';
import { AuthUserGuard } from './auth/auth.user.guard';
import { AuthGuard } from './auth/auth.guard';

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
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule),
        canLoad: [AuthGuard, AuthAdminGuard]
    },
    {
        path: 'employee',
        loadChildren: () => import('./employee/employee.module').then(m => m.EmployeePageModule),
        canLoad: [AuthGuard, AuthEmployeeGuard]
    },
    {
        path: 'user',
        loadChildren: () => import('./user/user.module').then(m => m.UserPageModule),
        canLoad: [AuthGuard, AuthUserGuard]
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
