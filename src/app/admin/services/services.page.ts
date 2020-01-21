import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Service } from './service.model';
import { Subscription } from 'rxjs';
import { ServicesService } from './services.service';

@Component({
    selector: 'app-services',
    templateUrl: './services.page.html',
    styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    services: Service[];
    filteredServices: Service[];
    actualFilter = 'pending';
    private subscription: Subscription;

    constructor(
        private servicesService: ServicesService,
        private loadingController: LoadingController
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
            });
        });
    }

    doRefresh(event) {
        this.servicesService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.servicesService.fetch().subscribe(() => {
            event.target.complete();
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
}
