import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Employee } from '../../admin/employees/employee.model';
import { showAlert } from '../../app.component';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from './profile.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
    form: FormGroup;
    user: Employee;
    formLoaded = false;
    private subscription: Subscription;

    constructor(
        private profileService: ProfileService,
        private authService: AuthService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.subscription = this.profileService.getProfile(this.authService.user.id).subscribe(user => {
            this.user = user;
            this.form = new FormGroup({
                firstName: new FormControl(this.user.firstName, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(255)],
                }),
                lastName: new FormControl(this.user.lastName, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(255)],
                }),
                email: new FormControl(this.user.email, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(255), Validators.email],
                }),
                password: new FormControl(null, {
                    updateOn: 'blur',
                    validators: [Validators.maxLength(255), Validators.minLength(8)],
                }),
            });
        }, error => {
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Profile could not be fetched. Please try again later.',
                buttons: [
                    {
                        text: 'Okay', handler: () => {
                            this.router.navigate(['user']);
                        },
                    },
                ],
            }).then(alertEl => {
                alertEl.present();
            });
        });
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating profile...',
        }).then(loadingEl => {
            loadingEl.present();
            this.profileService.edit(
                this.user.id,
                this.form.value.firstName,
                this.form.value.lastName,
                this.form.value.email,
                this.form.value.password,
            ).subscribe(() => {
                this.authService.updateProfile(this.user).subscribe((logged) => {
                    loadingEl.dismiss();

                    if (logged) {
                        this.router.navigate(['/user']);
                    }
                }, error => {
                    loadingEl.dismiss();

                    showAlert('Error updating profile', userError(error));
                });
            }, error => {
                loadingEl.dismiss();

                showAlert('Error updating profile', userError(error));
            });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const userError = (error: any) => {
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

    return message;
};
