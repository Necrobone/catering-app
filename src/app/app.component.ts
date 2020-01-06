import {Component, OnDestroy, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthService} from './auth/auth.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    private authSub: Subscription;
    private previousAuthState = false;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private authService: AuthService,
        private router: Router
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    onLogout() {
        this.authService.logout();
    }

    ngOnInit(): void {
        this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
            if (!isAuth && this.previousAuthState !== isAuth) {
                this.router.navigateByUrl('/auth');
            }

            this.previousAuthState = isAuth;
        });
    }

    ngOnDestroy(): void {
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }
}
