import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Supplier } from './supplier.model';
import { SuppliersService } from './suppliers.service';

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.page.html',
    styleUrls: ['./suppliers.page.scss'],
})
export class SuppliersPage implements OnInit, OnDestroy {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    suppliers: Supplier[];
    private subscription: Subscription;

    constructor(
        private suppliersService: SuppliersService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
    ) {
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
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Suppliers could not be fetched. Please try again later.',
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
        this.suppliersService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Suppliers could not be fetched. Please try again later.',
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

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const supplierError = (error: any) => {
    let message;
    switch (error.error.error) {
        case 'NAME_REQUIRED':
            message = 'Name can not be empty';
            break;
        case 'NAME_INVALID':
            message = 'Name is invalid';
            break;
        case 'NAME_TOO_LONG':
            message = 'Name is too long';
            break;
        case 'HEADQUARTERS_REQUIRED':
            message = 'Headquarters can not be empty';
            break;
        case 'HEADQUARTERS_INVALID':
            message = 'Headquarters are invalid';
            break;
        case 'HEADQUARTERS_NOT_FOUND':
            message = 'Headquarters not found';
            break;
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    return message;
};
