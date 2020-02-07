import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { showAlert } from '../app.component';
import { AuthService } from './auth.service';
import { User } from './user.model';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        this.authenticate(email, password);
        form.reset();
    }

    authenticate(email: string, password: string) {
        this.loadingController.create({
            keyboardClose: true,
            message: 'Logging in...'
        }).then(loadingEl => {
            loadingEl.present();
            let authObs: Observable<User>;

            authObs = this.authService.login(email, password);

            authObs.subscribe(resData => {
                loadingEl.dismiss();
                this.router.navigateByUrl(this.authService.getUrlByRole(resData.role.id));
            }, error => {
                loadingEl.dismiss();

                let message;
                switch (error.error.error) {
                    case 'EMAIL_REQUIRED':
                        message = 'Email address can not be empty';
                        break;
                    case 'EMAIL_INVALID':
                        message = 'Email address is invalid';
                        break;
                    case 'EMAIL_TOO_LONG':
                        message = 'Email address is too long';
                        break;
                    case 'EMAIL_NOT_FOUND':
                        message = 'Email address do not exist';
                        break;
                    case 'PASSWORD_REQUIRED':
                        message = 'Password can not be empty';
                        break;
                    case 'PASSWORD_INVALID':
                        message = 'Password is invalid';
                        break;
                    case 'PASSWORD_TOO_SHORT':
                        message = 'Password is too short';
                        break;
                    case 'PASSWORD_TOO_LONG':
                        message = 'Password is too long';
                        break;
                    case 'LOGIN_ERROR':
                        message = 'Credentials you supplied were not correct';
                        break;
                    default:
                        message = 'Unexpected error. Please try again.';
                        break;
                }

                showAlert('Authentication failed', message);
            });
        });
    }
}
