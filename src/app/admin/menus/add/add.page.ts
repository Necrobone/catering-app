import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Dish } from '../../dishes/dish.model';
import { DishesService } from '../../dishes/dishes.service';
import { Event } from '../../events/event.model';
import { EventsService } from '../../events/events.service';
import { menuError } from '../menus.page';
import { MenusService } from '../menus.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
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
        private loadingController: LoadingController,
        private alertController: AlertController,
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
                validators: [Validators.required, Validators.maxLength(255)],
            }),
            dishes: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required],
            }),
            events: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required],
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
                }, error => {
                    loadingEl.dismiss();
                    this.alertController.create({
                        header: 'An error ocurred!',
                        message: 'Events could not be fetched. Please try again later.',
                        buttons: [
                            {
                                text: 'Okay', handler: () => {
                                    this.router.navigate(['admin/menus']);
                                },
                            },
                        ],
                    }).then(alertEl => {
                        alertEl.present();
                    });
                });
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Dishes could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/menus']);
                            },
                        },
                    ],
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating menu...',
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.add(
                this.form.value.name,
                this.form.value.dishes,
                this.form.value.events,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/menus']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error creating menu', menuError(error));
            });
        });
    }

    ngOnDestroy(): void {
        if (this.dishSubscription) {
            this.dishSubscription.unsubscribe();
        }

        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }
    }
}
