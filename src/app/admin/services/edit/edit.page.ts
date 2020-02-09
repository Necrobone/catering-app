import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { EMPLOYEE, USER } from '../../../auth/auth.service';
import { User } from '../../../auth/user.model';
import { Province } from '../../../province.model';
import { ProvincesService } from '../../../provinces.service';
import { Dish } from '../../dishes/dish.model';
import { DishesService } from '../../dishes/dishes.service';
import { Event } from '../../events/event.model';
import { EventsService } from '../../events/events.service';
import { Service } from '../service.model';
import { serviceError } from '../services.page';
import { ServicesService } from '../services.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    provinces: Province[];
    events: Event[];
    client: User;
    employees: User[];
    dishes: Dish[];
    service: Service;
    formLoaded = false;
    selectedSegment = 'where';
    private provinceSubscription: Subscription;
    private eventSubscription: Subscription;
    private dishSubscription: Subscription;
    private serviceSubscription: Subscription;

    constructor(
        private servicesService: ServicesService,
        private provincesService: ProvincesService,
        private eventsService: EventsService,
        private dishesService: DishesService,
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
                this.navCtrl.navigateBack('/admin/services');
                return;
            }

            this.serviceSubscription = this.servicesService.getService(+paramMap.get('id')).subscribe(service => {
                this.service = service;
                this.client = this.service.users.filter(user => user.role.id === USER).pop();
                this.employees = this.service.users.filter(user => user.role.id === EMPLOYEE);

                if (this.service.approved === 1) {
                    this.provinceSubscription = this.provincesService.provinces.subscribe(provinces => {
                        this.provinces = provinces;
                    });

                    this.eventSubscription = this.eventsService.events.subscribe(events => {
                        this.events = events;
                    });

                    this.dishSubscription = this.dishesService.dishes.subscribe(dishes => {
                        this.dishes = dishes;
                    });

                    this.loadingController.create({
                        message: 'Fetching...',
                    }).then(loadingEl => {
                        loadingEl.present();
                        this.provincesService.fetch().subscribe(() => {
                            this.eventsService.fetch().subscribe(() => {
                                this.dishesService.fetch().subscribe(() => {
                                    this.formLoaded = true;
                                    loadingEl.dismiss();
                                }, error => {
                                    loadingEl.dismiss();
                                    this.alertController.create({
                                        header: 'An error ocurred!',
                                        message: 'Dishes could not be fetched. Please try again later.',
                                        buttons: [
                                            {
                                                text: 'Okay', handler: () => {
                                                    this.router.navigate(['admin/services']);
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
                                    message: 'Events could not be fetched. Please try again later.',
                                    buttons: [
                                        {
                                            text: 'Okay', handler: () => {
                                                this.router.navigate(['admin/services']);
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
                                message: 'Provinces could not be fetched. Please try again later.',
                                buttons: [
                                    {
                                        text: 'Okay', handler: () => {
                                            this.router.navigate(['admin/services']);
                                        },
                                    },
                                ],
                            }).then(alertEl => {
                                alertEl.present();
                            });
                        });
                    });

                    this.form = new FormGroup({
                        address: new FormControl({value: this.service.address, disabled: !service.approved}, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.maxLength(255)],
                        }),
                        zip: new FormControl({value: this.service.zip, disabled: !service.approved}, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.maxLength(255)],
                        }),
                        city: new FormControl({value: this.service.city, disabled: !service.approved}, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.maxLength(255)],
                        }),
                        startDate: new FormControl({
                            value: this.service.startDate.toISOString(),
                            disabled: !service.approved,
                        }, {
                            updateOn: 'blur',
                            validators: [Validators.required],
                        }),
                        startTime: new FormControl({
                            value: this.service.startDate.toISOString(),
                            disabled: !service.approved,
                        }, {
                            updateOn: 'blur',
                            validators: [Validators.required],
                        }),
                        province: new FormControl({value: this.service.provinceId, disabled: !service.approved}, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.min(1)],
                        }),
                        event: new FormControl({value: this.service.eventId, disabled: !service.approved}, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.min(1)],
                        }),
                        dishes: new FormControl(this.service.dishesIds, {
                            updateOn: 'blur',
                            validators: [Validators.required],
                        }),
                    });
                }
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Service could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/services']);
                            },
                        },
                    ],
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating service...',
        }).then(loadingEl => {
            loadingEl.present();
            const startDate = new Date(this.form.value.startDate);
            const startTime = new Date(this.form.value.startTime);
            startDate.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());

            this.servicesService.edit(
                this.service.id,
                this.form.value.address,
                this.form.value.zip,
                this.form.value.city,
                startDate,
                +this.form.value.province,
                +this.form.value.event,
                this.form.value.dishes,
                this.service.users,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/services']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error updating service', serviceError(error));
            });
        });
    }

    onApprove() {
        this.alertController.create({
            header: 'Approve Service',
            message: 'Are you sure that you want to approve this service?',
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
                            message: 'Approving service...',
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.servicesService.toggle(
                                this.service.id,
                                true,
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.router.navigate(['/admin/services']);
                            }, error => {
                                loadingEl.dismiss();

                                showAlert('Approving failed', 'Unexpected error. Please try again.');
                            });
                        });
                    },
                },
            ],
        }).then(loadingEl => {
            loadingEl.present();
        });
    }

    onReject() {
        this.alertController.create({
            header: 'Reject Service',
            message: 'Are you sure that you want to reject this service?',
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
                            message: 'Rejecting service...',
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.servicesService.toggle(
                                this.service.id,
                                false,
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.router.navigate(['/admin/services']);
                            }, error => {
                                loadingEl.dismiss();

                                showAlert('Rejecting failed', 'Unexpected error. Please try again.');
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
        if (this.serviceSubscription) {
            this.serviceSubscription.unsubscribe();
        }

        if (this.provinceSubscription) {
            this.provinceSubscription.unsubscribe();
        }

        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }

        if (this.dishSubscription) {
            this.dishSubscription.unsubscribe();
        }
    }

    onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
        this.selectedSegment = event.detail.value;
    }
}
