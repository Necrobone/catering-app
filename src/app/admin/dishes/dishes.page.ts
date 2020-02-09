import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Dish } from './dish.model';
import { DishesService } from './dishes.service';

@Component({
    selector: 'app-dishes',
    templateUrl: './dishes.page.html',
    styleUrls: ['./dishes.page.scss'],
})
export class DishesPage implements OnInit, OnDestroy {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    dishes: Dish[];
    private subscription: Subscription;

    constructor(
        private dishesService: DishesService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
    ) {
        this.dishes = [];
    }

    ngOnInit() {
        this.subscription = this.dishesService.dishes.subscribe(dishes => {
            this.dishes = dishes;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Dishes could not be fetched. Please try again later.',
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
        this.dishesService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Dishes could not be fetched. Please try again later.',
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
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const dishError = (error: any) => {
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
        case 'DESCRIPTION_REQUIRED':
            message = 'Description can not be empty';
            break;
        case 'DESCRIPTION_INVALID':
            message = 'Description is invalid';
            break;
        case 'DESCRIPTION_TOO_LONG':
            message = 'Description is too long';
            break;
        case 'IMAGE_REQUIRED':
            message = 'Image can not be empty';
            break;
        case 'IMAGE_INVALID':
            message = 'Image is invalid';
            break;
        case 'SUPPLIERS_REQUIRED':
            message = 'Suppliers can not be empty';
            break;
        case 'SUPPLIERS_INVALID':
            message = 'Suppliers are invalid';
            break;
        case 'SUPPLIERS_NOT_FOUND':
            message = 'Suppliers not found';
            break;
        case 'EVENTS_REQUIRED':
            message = 'Events can not be empty';
            break;
        case 'EVENTS_INVALID':
            message = 'Events are invalid';
            break;
        case 'EVENTS_NOT_FOUND':
            message = 'Events not found';
            break;
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    return message;
};
