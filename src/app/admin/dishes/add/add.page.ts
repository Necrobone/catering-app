import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Event } from '../../events/event.model';
import { EventsService } from '../../events/events.service';
import { Supplier } from '../../suppliers/supplier.model';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { dishError } from '../dishes.page';
import { DishesService } from '../dishes.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
    form: FormGroup;
    suppliers: Supplier[];
    events: Event[];
    private supplierSubscription: Subscription;
    private eventSubscription: Subscription;

    constructor(
        private dishesService: DishesService,
        private suppliersService: SuppliersService,
        private eventsService: EventsService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.supplierSubscription = this.suppliersService.suppliers.subscribe(suppliers => {
            this.suppliers = suppliers;
        });
        this.eventSubscription = this.eventsService.events.subscribe(events => {
            this.events = events;
        });
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)],
            }),
            description: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(65535)],
            }),
            suppliers: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required],
            }),
            events: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required],
            }),
            image: new FormControl(null, {
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
            this.suppliersService.fetch().subscribe(() => {
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

    onCreate() {
        if (!this.form.valid || !this.form.get('image').value) {
            return;
        }
        this.loadingController.create({
            message: 'Creating dish...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.add(
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

                showAlert('Error creating dish', dishError(error));
            });
        });
    }

    ngOnDestroy(): void {
        if (this.supplierSubscription) {
            this.supplierSubscription.unsubscribe();
        }

        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }
    }
}
