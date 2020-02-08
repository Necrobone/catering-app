import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { AuthService } from '../../../auth/auth.service';
import { Role } from '../../../auth/role.model';
import { RolesService } from '../../../auth/roles.service';
import { Employee } from '../employee.model';
import { employeeError } from '../employees.page';
import { EmployeesService } from '../employees.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    roles: Role[];
    employee: Employee;
    formLoaded = false;
    private roleSubscription: Subscription;
    private employeeSubscription: Subscription;

    constructor(
        private employeesService: EmployeesService,
        private rolesService: RolesService,
        private authService: AuthService,
        private router: Router,
        private loadingController: LoadingController,
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('id')) {
                this.navCtrl.navigateBack('/admin/employees');
                return;
            }

            this.roleSubscription = this.rolesService.roles.subscribe(roles => {
                this.roles = roles;
            });

            this.employeeSubscription = this.employeesService.getEmployee(+paramMap.get('id')).subscribe(employee => {
                this.employee = employee;
                this.form = new FormGroup({
                    firstName: new FormControl(this.employee.firstName, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    lastName: new FormControl(this.employee.lastName, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    email: new FormControl(this.employee.email, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255), Validators.email]
                    }),
                    password: new FormControl(null, {
                        updateOn: 'blur',
                        validators: [
                            Validators.maxLength(255),
                            Validators.minLength(8),
                            Validators.pattern('^.*(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\\d\\X])(?=.*[!$#%]).*$')
                        ]
                    }),
                    role: new FormControl(this.employee.roleId, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.min(1)]
                    })
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Employee could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/employees']);
                            }
                        }
                    ]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.rolesService.fetch().subscribe(() => {
                this.formLoaded = true;
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Roles could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/employees']);
                            }
                        }
                    ]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating employee...'
        }).then(loadingEl => {
            loadingEl.present();
            this.employeesService.edit(
                this.employee.id,
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

                showAlert('Error updating employee', employeeError(error));
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Employee',
            message: 'Are you sure that you want to delete this employee?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Okay',
                    handler: () => {
                        this.loadingController.create({
                            message: 'Deleting employee...'
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.employeesService.delete(
                                this.employee.id
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.form.reset();
                                this.router.navigate(['/admin/employees']);
                            }, error => {
                                loadingEl.dismiss();

                                showAlert('Deleting failed', 'Unexpected error. Please try again.');
                            });
                        });
                    }
                }
            ]
        }).then(loadingEl => {
            loadingEl.present();
        });
    }

    ngOnDestroy(): void {
        if (this.employeeSubscription) {
            this.employeeSubscription.unsubscribe();
        }

        if (this.roleSubscription) {
            this.roleSubscription.unsubscribe();
        }
    }
}
