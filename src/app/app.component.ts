import { Component, OnDestroy, OnInit } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';
import { AuthService, ADMINISTRATOR, EMPLOYEE, USER } from './auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';
import { User } from './auth/user.model';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    user: User;
    administrator = ADMINISTRATOR;
    employee = EMPLOYEE;
    client = USER;
    private subscription: Subscription;
    private previousAuthState = false;

    constructor(
        private platform: Platform,
        private authService: AuthService,
        private router: Router
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (Capacitor.isPluginAvailable('SplashScreen')) {
                Plugins.SplashScreen.hide();
            }
        });
    }

    onLogout() {
        this.authService.logout();
    }

    ngOnInit(): void {
        this.subscription = this.authService.userIsAuthenticated.subscribe(isAuth => {
            if (!isAuth && this.previousAuthState !== isAuth) {
                this.router.navigateByUrl('/auth');
            }

            this.user = this.authService.user;

            this.previousAuthState = isAuth;
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const showAlert = (header: string, message: string) => {
    return new AlertController().create({
        header,
        message,
        buttons: ['Okay']
    }).then(alert => {
        alert.present();
    });
};
