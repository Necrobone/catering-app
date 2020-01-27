import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ProfileService } from './profile.service';
import { AuthService } from '../../auth/auth.service';
import { Employee } from '../../admin/employees/employee.model';

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
                    validators: [Validators.required, Validators.maxLength(255)]
                }),
                lastName: new FormControl(this.user.lastName, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(255)]
                }),
                email: new FormControl(this.user.email, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(255), Validators.email]
                }),
                password: new FormControl(null, {
                    updateOn: 'blur',
                    validators: [Validators.maxLength(255), Validators.minLength(8)]
                })
            });
        }, error => {
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Profile could not be fetched. Please try again later.',
                buttons: [{
                    text: 'Okay', handler: () => {
                        this.router.navigate(['user']);
                    }
                }]
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
            message: 'Updating user...'
        }).then(loadingEl => {
            loadingEl.present();
            this.profileService.edit(
                this.user.id,
                this.form.value.firstName,
                this.form.value.lastName,
                this.form.value.email,
                this.form.value.password
            ).subscribe(() => {
                loadingEl.dismiss();
                this.router.navigate(['/user']);
            });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
