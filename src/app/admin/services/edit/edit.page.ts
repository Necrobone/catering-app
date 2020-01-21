import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ServicesService } from '../services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Service } from '../service.model';
import { Province } from '../../../province.model';
import { Event } from '../../events/event.model';
import { ProvincesService } from '../../../provinces.service';
import { EventsService } from '../../events/events.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    provinces: Province[];
    events: Event[];
    service: Service;
    formLoaded = false;
    private provinceSubscription: Subscription;
    private eventSubscription: Subscription;
    private serviceSubscription: Subscription;

    constructor(
        private servicesService: ServicesService,
        private provincesService: ProvincesService,
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
                this.navCtrl.navigateBack('/admin/services');
                return;
            }

            this.provinceSubscription = this.provincesService.provinces.subscribe(provinces => {
                this.provinces = provinces;
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Provinces could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/services']);
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
                            this.router.navigate(['admin/services']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
            this.serviceSubscription = this.servicesService.getService(+paramMap.get('id')).subscribe(service => {
                this.service = service;
                this.form = new FormGroup({
                    address: new FormControl({value: this.service.address, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    zip: new FormControl({value: this.service.zip, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    city: new FormControl({value: this.service.city, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    startDate: new FormControl({value: this.service.startDate, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                    startTime: new FormControl({value: this.service.startDate, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                    province: new FormControl({value: this.service.provinceId, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.min(1)]
                    }),
                    event: new FormControl({value: this.service.eventId, disabled: !service.approved}, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.min(1)]
                    })
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Service could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/services']);
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
            this.provincesService.fetch().subscribe(() => {
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
            message: 'Updating service...'
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
                +this.form.value.event
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/services']);
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Service',
            message: 'Are you sure that you want to delete this service?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Okay',
                    handler: () => {
                        this.servicesService.delete(
                            this.service.id
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/services']);
                        });
                    }
                }
            ]
        }).then(loadingEl => {
            loadingEl.present();
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
                        this.servicesService.toggle(
                            this.service.id,
                            true
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/services']);
                        });
                    }
                }
            ]
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
                        this.servicesService.toggle(
                            this.service.id,
                            false
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/services']);
                        });
                    }
                }
            ]
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
    }
}
