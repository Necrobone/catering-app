import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ServicesService } from '../services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Service } from '../../../admin/services/service.model';
import { User } from '../../../auth/user.model';
import { EMPLOYEE, USER } from '../../../auth/auth.service';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Dish } from "../../../admin/dishes/dish.model";

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    service: Service;
    client: User;
    employees: User[];
    formLoaded = false;
    selectedSegment = 'where';
    private serviceSubscription: Subscription;

    constructor(
        private servicesService: ServicesService,
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
                this.navCtrl.navigateBack('/employee/services');
                return;
            }

            this.serviceSubscription = this.servicesService.getService(+paramMap.get('id')).subscribe(service => {
                this.service = service;
                this.client = this.service.users.filter(user => user.role.id === USER).pop();
                this.employees = this.service.users.filter(user => user.role.id === EMPLOYEE);
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Service could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['employee/services']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    ngOnDestroy(): void {
        if (this.serviceSubscription) {
            this.serviceSubscription.unsubscribe();
        }
    }

    doRefresh(event) {
        this.servicesService.getService(this.service.id).subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.servicesService.getService(this.service.id).subscribe(() => {
            event.target.complete();
        });
    }

    onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
        this.selectedSegment = event.detail.value;
    }
}
