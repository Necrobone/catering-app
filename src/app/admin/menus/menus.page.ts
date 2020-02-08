import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Menu } from './menu.model';
import { MenusService } from './menus.service';

@Component({
    selector: 'app-menus',
    templateUrl: './menus.page.html',
    styleUrls: ['./menus.page.scss'],
})
export class MenusPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    menus: Menu[];
    private subscription: Subscription;

    constructor(
        private menusService: MenusService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
    ) {
        this.menus = [];
    }

    ngOnInit() {
        this.subscription = this.menusService.menus.subscribe(menus => {
            this.menus = menus;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Menus could not be fetched. Please try again later.',
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
        this.menusService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Menus could not be fetched. Please try again later.',
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
}

export const menuError = (error: any) => {
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
        case 'DISHES_REQUIRED':
            message = 'Dishes can not be empty';
            break;
        case 'DISHES_INVALID':
            message = 'Dishes are invalid';
            break;
        case 'DISHES_NOT_FOUND':
            message = 'Dishes not found';
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
