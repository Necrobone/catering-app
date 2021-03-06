import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Event } from '../../events/event.model';
import { EventsService } from '../../events/events.service';
import { Supplier } from '../../suppliers/supplier.model';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { Dish } from '../dish.model';
import { dishError } from '../dishes.page';
import { DishesService } from '../dishes.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    dish: Dish;
    suppliers: Supplier[];
    events: Event[];
    formLoaded = false;
    private subscription: Subscription;
    private supplierSubscription: Subscription;
    private eventSubscription: Subscription;

    constructor(
        private dishesService: DishesService,
        private suppliersService: SuppliersService,
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
                this.navCtrl.navigateBack('/admin/dishes');
                return;
            }

            this.supplierSubscription = this.suppliersService.suppliers.subscribe(suppliers => {
                this.suppliers = suppliers;
            });

            this.eventSubscription = this.eventsService.events.subscribe(events => {
                this.events = events;
            });

            this.subscription = this.dishesService.getDish(+paramMap.get('id')).subscribe(dish => {
                this.dish = dish;
                this.form = new FormGroup({
                    name: new FormControl(this.dish.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)],
                    }),
                    description: new FormControl(this.dish.description, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(65535)],
                    }),
                    suppliers: new FormControl(this.dish.suppliersIds, {
                        updateOn: 'blur',
                        validators: [Validators.required],
                    }),
                    events: new FormControl(this.dish.eventsIds, {
                        updateOn: 'blur',
                        validators: [Validators.required],
                    }),
                    image: new FormControl(this.dish.image),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Dish could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/dishes']);
                            },
                        },
                    ],
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
            this.suppliersService.fetch().subscribe(() => {
                this.eventsService.fetch().subscribe(() => {
                    this.formLoaded = true;
                    loadingEl.dismiss();
                }, error => {
                    loadingEl.dismiss();
                    this.alertController.create({
                        header: 'An error ocurred!',
                        message: 'Events could not be fetched. Please try again later.',
                        buttons: [
                            {
                                text: 'Okay', handler: () => {
                                    this.router.navigate(['admin/headquarters']);
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
                    message: 'Suppliers could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/headquarters']);
                            },
                        },
                    ],
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onImagePicked(image: string) {
        this.form.patchValue({image});
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating dish...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.edit(
                this.dish.id,
                this.form.value.name,
                this.form.value.description,
                this.form.value.image,
                this.form.value.suppliers,
                this.form.value.events,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/dishes']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error updating dish', dishError(error));
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Dish',
            message: 'Are you sure that you want to delete this dish?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Okay',
                    handler: () => {
                        this.loadingController.create({
                            message: 'Deleting dish...',
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.dishesService.delete(
                                this.dish.id,
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.form.reset();
                                this.router.navigate(['/admin/dishes']);
                            }, error => {
                                loadingEl.dismiss();

                                showAlert('Deleting failed', 'Unexpected error. Please try again.');
                            });
                        });
                    },
                },
            ],
        }).then(loadingEl => {
            loadingEl.present();
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        if (this.supplierSubscription) {
            this.supplierSubscription.unsubscribe();
        }

        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }
    }
}
