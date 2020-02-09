import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Service } from './service.model';
import { ServicesService } from './services.service';

@Component({
    selector: 'app-services',
    templateUrl: './services.page.html',
    styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit, OnDestroy {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    services: Service[];
    filteredServices: Service[];
    actualFilter = 'pending';
    private subscription: Subscription;

    constructor(
        private servicesService: ServicesService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.subscription = this.servicesService.services.subscribe(services => {
            this.services = services;
            switch (this.actualFilter) {
                case 'approved':
                    this.filteredServices = this.services.filter(service => service.approved === 1);
                    break;
                case 'rejected':
                    this.filteredServices = this.services.filter(service => service.approved === 0);
                    break;
                case 'pending':
                default:
                    this.filteredServices = this.services.filter(service => service.approved === null);
                    break;
            }
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.servicesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Services could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin']);
                            }
                        }
                    ]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    doRefresh(event) {
        this.servicesService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Services could not be fetched. Please try again later.',
                buttons: [
                    {
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin']);
                        },
                    },
                ],
            }).then(alertEl => {
                alertEl.present();
            });
        });
    }

    onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
        switch (event.detail.value) {
            case 'approved':
                this.actualFilter = 'approved';
                this.filteredServices = this.services.filter(service => service.approved === 1);
                break;
            case 'rejected':
                this.actualFilter = 'rejected';
                this.filteredServices = this.services.filter(service => service.approved === 0);
                break;
            case 'pending':
            default:
                this.actualFilter = 'pending';
                this.filteredServices = this.services.filter(service => service.approved === null);
                break;
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const serviceError = (error: any) => {
    let message;
    switch (error.error.error) {
        case 'ADDRESS_REQUIRED':
            message = 'Address can not be empty';
            break;
        case 'ADDRESS_INVALID':
            message = 'Address is invalid';
            break;
        case 'ADDRESS_TOO_LONG':
            message = 'Address is too long';
            break;
        case 'ZIP_REQUIRED':
            message = 'Zip can not be empty';
            break;
        case 'ZIP_INVALID':
            message = 'Zip is invalid';
            break;
        case 'ZIP_TOO_LONG':
            message = 'Zip is too long';
            break;
        case 'CITY_REQUIRED':
            message = 'City can not be empty';
            break;
        case 'CITY_INVALID':
            message = 'City is invalid';
            break;
        case 'CITY_TOO_LONG':
            message = 'City is too long';
            break;
        case 'START_DATE_REQUIRED':
            message = 'Start Date can not be empty';
            break;
        case 'START_DATE_INVALID':
            message = 'Start Date is invalid';
            break;
        case 'START_DATE_PAST':
            message = 'Start Date is a past date';
            break;
        case 'APPROVED_REQUIRED':
            message = 'Approved can not be empty';
            break;
        case 'APPROVED_INVALID':
            message = 'Approved is invalid';
            break;
        case 'PROVINCE_REQUIRED':
            message = 'Province cant no be empty';
            break;
        case 'PROVINCE_INVALID':
            message = 'Province is invalid';
            break;
        case 'PROVINCE_NOT_FOUND':
            message = 'Province not found';
            break;
        case 'EVENT_REQUIRED':
            message = 'Event can not be empty';
            break;
        case 'EVENT_INVALID':
            message = 'Event is invalid';
            break;
        case 'EVENT_NOT_FOUND':
            message = 'Event not found';
            break;
        case 'DISHES_REQUIRED':
            message = 'Dishes can not be empty';
            break;
        case 'DISHES_INVALID':
            message = 'Dishes are invalid';
            break;
        case 'DISHES_NOT_FOUND':
            message = 'Dishes not found';
            break;
        case 'USERS_REQUIRED':
            message = 'Users can not be empty';
            break;
        case 'USERS_INVALID':
            message = 'Users are invalid';
            break;
        case 'USERS_NOT_FOUND':
            message = 'Users not found';
            break;
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    return message;
};
