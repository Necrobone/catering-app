import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Menu } from '../menu.model';
import { MenusService } from '../menus.service';
import { Event } from '../../events/event.model';
import { Dish } from '../../dishes/dish.model';
import { EventsService } from '../../events/events.service';
import { DishesService } from '../../dishes/dishes.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    menu: Menu;
    dishes: Dish[];
    events: Event[];
    formLoaded = false;
    private subscription: Subscription;
    private dishSubscription: Subscription;
    private eventSubscription: Subscription;

    constructor(
        private menusService: MenusService,
        private dishesService: DishesService,
        private eventsService: EventsService,
        private router: Router,
        private loadingController: LoadingController,
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('id')) {
                this.navCtrl.navigateBack('/admin/menus');
                return;
            }

            this.dishSubscription = this.dishesService.dishes.subscribe(dishes => {
                this.dishes = dishes;
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Dishes could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/dishes']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });

            this.eventSubscription = this.eventsService.events.subscribe(events => {
                this.events = events;
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Events could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/suppliers']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });

            this.subscription = this.menusService.getMenu(+paramMap.get('id')).subscribe(menu => {
                this.menu = menu;
                this.form = new FormGroup({
                    name: new FormControl(this.menu.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    dishes: new FormControl(this.menu.dishesIds, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                    events: new FormControl(this.menu.eventsIds, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Menu could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/menus']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.fetch().subscribe(() => {
                this.eventsService.fetch().subscribe(() => {
                    this.formLoaded = true;
                    loadingEl.dismiss();
                });
            });
        });
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating menu...'
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.edit(
                this.menu.id,
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

    onDestroy() {
        this.alertController.create({
            header: 'Delete Menu',
            message: 'Are you sure that you want to delete this menu?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Okay',
                    handler: () => {
                        this.menusService.delete(
                            this.menu.id
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/menus']);
                        });
                    }
                }
            ]
        }).then(loadingEl => {
            loadingEl.present();
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
