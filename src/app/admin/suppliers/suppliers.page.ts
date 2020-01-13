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
        for (let i = 0; i < 10; i++) {
            const supplier = new Supplier(
                i,
                'Sede',
                [],
                new Date(),
                null,
                null,
            );
            this.suppliers.push(supplier);
        }
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
        const data = [{
            text: 'text',
        }];
        setTimeout(() => {
            console.log('Done');
            for (let i = 0; i < 10; i++) {
                const supplier = new Supplier(
                    i,
                    'Sede',
                    [],
                    new Date(),
                    null,
                    null,
                );
                this.suppliers.push(supplier);
            }
            event.target.complete();

            // App logic to determine if all data is loaded
            // and disable the infinite scroll
            if (data.length === 1000) {
                event.target.disabled = true;
            }
        }, 500);
    }
}
