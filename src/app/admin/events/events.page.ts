import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Event } from './event.model';
import { EventsService } from './events.service';

@Component({
    selector: 'app-events',
    templateUrl: './events.page.html',
    styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    events: Event[] = [];
    private subscription: Subscription;

    constructor(
        private eventsService: EventsService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.subscription = this.eventsService.events.subscribe(events => {
            this.events = events;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.eventsService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Events could not be fetched. Please try again later.',
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
        this.eventsService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Events could not be fetched. Please try again later.',
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

export const eventError = (error: any) => {
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
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    return message;
};
