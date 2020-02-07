import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Role } from '../../../auth/role.model';
import { RolesService } from '../../../auth/roles.service';
import { employeeError } from '../employees.page';
import { EmployeesService } from '../employees.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    form: FormGroup;
    roles: Role[];
    private subscription: Subscription;

    constructor(
        private employeesService: EmployeesService,
        private rolesService: RolesService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.subscription = this.rolesService.roles.subscribe(roles => {
            this.roles = roles;
        });
        this.form = new FormGroup({
            firstName: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            lastName: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            email: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255), Validators.email]
            }),
            password: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255), Validators.minLength(8)]
            }),
            role: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.min(1)]
            })
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.rolesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Roles could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/employees']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating employee...'
        }).then(loadingEl => {
            loadingEl.present();
            this.employeesService.add(
                this.form.value.firstName,
                this.form.value.lastName,
                this.form.value.email,
                this.form.value.password,
                +this.form.value.role,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/employees']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error creating employee', employeeError(error));
            });
        });
    }
}
