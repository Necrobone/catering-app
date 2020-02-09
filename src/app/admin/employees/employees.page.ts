import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Employee } from './employee.model';
import { EmployeesService } from './employees.service';

@Component({
    selector: 'app-employees',
    templateUrl: './employees.page.html',
    styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit, OnDestroy {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    employees: Employee[];
    private subscription: Subscription;

    constructor(
        private employeesService: EmployeesService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router
    ) {
        this.employees = [];
    }

    ngOnInit() {
        this.subscription = this.employeesService.employees.subscribe(employees => {
            this.employees = employees;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.employeesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Employees could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    doRefresh(event) {
        this.employeesService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Employees could not be fetched. Please try again later.',
                buttons: [{
                    text: 'Okay', handler: () => {
                        this.router.navigate(['admin']);
                    }
                }]
            }).then(alertEl => {
                alertEl.present();
            });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const employeeError = (error: any) => {
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
        case 'ROLE_REQUIRED':
            message = 'Role can not be empty';
            break;
        case 'ROLE_INVALID':
            message = 'Role is invalid';
            break;
        case 'ROLE_NOT_FOUND':
            message = 'Role not found';
            break;
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    return message;
};
