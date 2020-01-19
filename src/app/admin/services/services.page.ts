import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
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
    private subscription: Subscription;

    constructor(private servicesService: ServicesService, private loadingController: LoadingController) {
        this.services = [];
    }

    ngOnInit() {
        this.subscription = this.servicesService.services.subscribe(services => {
            this.services = services;
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
}
