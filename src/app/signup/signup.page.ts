import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { showAlert } from '../app.component';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.page.html',
    styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingController: LoadingController,
    ) {
    }

    ngOnInit() {
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const firstName = form.value.first_name;
        const lastName = form.value.last_name;
        const email = form.value.email;
        const password = form.value.password;
        const passwordConfirmation = form.value.password_confirmation;

        this.signup(firstName, lastName, email, password, passwordConfirmation);
    }

    signup(firstName: string, lastName: string, email: string, password: string, passwordConfirmation: string) {
        this.loadingController.create({
            keyboardClose: true,
            message: 'Logging in...'
        }).then(loadingEl => {
            loadingEl.present();
            let authObs: Observable<User>;

            authObs = this.authService.signup(firstName, lastName, email, password, passwordConfirmation);

            authObs.subscribe(resData => {
                loadingEl.dismiss();
                this.router.navigateByUrl(this.authService.getUrlByRole(resData.role.id));
            }, error => {
                loadingEl.dismiss();

                let message;
                switch (error.error.error) {
                    case 'FIRST_NAME_REQUIRED':
                        message = 'First name can not be empty';
                        break;
                    case 'FIRST_NAME_INVALID':
                        message = 'First name is invalid';
                        break;
                    case 'FIRST_NAME_TOO_LONG':
                        message = 'First name is too long';
                        break;
                    case 'LAST_NAME_REQUIRED':
                        message = 'Last name can not be empty';
                        break;
                    case 'LAST_NAME_INVALID':
                        message = 'Last name is invalid';
                        break;
                    case 'LAST_NAME_TOO_LONG':
                        message = 'Last name is too long';
                        break;
                    case 'EMAIL_REQUIRED':
                        message = 'Email address can not be empty';
                        break;
                    case 'EMAIL_INVALID':
                        message = 'Email address is invalid';
                        break;
                    case 'EMAIL_TOO_LONG':
                        message = 'Email address is too long';
                        break;
                    case 'EMAIL_EXISTS':
                        message = 'Email address already exist';
                        break;
                    case 'PASSWORD_REQUIRED':
                        message = 'Password can not be empty';
                        break;
                    case 'PASSWORD_UNMATCHED':
                        message = 'Repeated password do not match';
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
                    default:
                        message = 'Unexpected error. Please try again.';
                        break;
                }

                showAlert('Signup failed', message);
            });
        });
    }
}
