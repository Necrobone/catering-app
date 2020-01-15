import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Event } from './event.model';
import { Subscription } from 'rxjs';
import { EventsService } from './events.service';

@Component({
    selector: 'app-events',
    templateUrl: './events.page.html',
    styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    events: Event[];
    private subscription: Subscription;

    constructor(private eventsService: EventsService, private loadingController: LoadingController) {
        this.events = [];
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
            });
        });
    }

    doRefresh(event) {
        this.eventsService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.eventsService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
