import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenusService } from '../menus.service';
import { Event } from '../../events/event.model';
import { Dish } from '../../dishes/dish.model';
import { Subscription } from 'rxjs';
import { DishesService } from '../../dishes/dishes.service';
import { EventsService } from '../../events/events.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    form: FormGroup;
    dishes: Dish[];
    events: Event[];
    private dishSubscription: Subscription;
    private eventSubscription: Subscription;

    constructor(
        private menusService: MenusService,
        private dishesService: DishesService,
        private eventsService: EventsService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        this.dishSubscription = this.dishesService.dishes.subscribe(dishes => {
            this.dishes = dishes;
        });
        this.eventSubscription = this.eventsService.events.subscribe(events => {
            this.events = events;
        });
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            dishes: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
            events: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.fetch().subscribe(() => {
                this.eventsService.fetch().subscribe(() => {
                    loadingEl.dismiss();
                });
            });
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating menu...'
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.add(
                this.form.value.name,
                this.form.value.dishes,
                this.form.value.events
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/menus']);
            });
        });
    }
}
