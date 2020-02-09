import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Service } from '../../admin/services/service.model';
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
                            },
                        },
                    ],
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
