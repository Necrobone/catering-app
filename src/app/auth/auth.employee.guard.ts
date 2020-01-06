import { Injectable } from '@angular/core';
import {
    CanLoad,
    Route, Router,
    UrlSegment
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthEmployeeGuard implements CanLoad {
    constructor(private authService: AuthService, private router: Router) {
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isEmployee()
            .pipe(
                take(1),
                tap(isAuthenticated => {
                    if (!isAuthenticated) {
                        this.router.navigateByUrl('/auth');
                    }
                })
            );
    }
}
