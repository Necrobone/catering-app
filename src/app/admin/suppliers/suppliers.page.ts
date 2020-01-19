import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Supplier } from './supplier.model';
import { Subscription } from 'rxjs';
import { SuppliersService } from './suppliers.service';

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.page.html',
    styleUrls: ['./suppliers.page.scss'],
})
export class SuppliersPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    suppliers: Supplier[];
    private subscription: Subscription;

    constructor(private suppliersService: SuppliersService, private loadingController: LoadingController) {
        this.suppliers = [];
    }

    ngOnInit() {
        this.subscription = this.suppliersService.suppliers.subscribe(suppliers => {
            this.suppliers = suppliers;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.suppliersService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    doRefresh(event) {
        this.suppliersService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.suppliersService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
