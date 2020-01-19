import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ServicesService } from '../services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Service } from '../service.model';
import { Role } from '../../../auth/role.model';
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
                    address: new FormControl(this.service.address, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    zip: new FormControl(this.service.zip, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    city: new FormControl(this.service.city, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    startDate: new FormControl(this.service.startDate, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    province: new FormControl(this.service.province, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.min(1)]
                    }),
                    event: new FormControl(typeof this.service.event === 'number' ? this.service.event : this.service.event.id, {
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
                    loadingEl.dismiss();
                });
            });
        });
    }

    selectedRole = (province1: Role, province2: Role): boolean => {
        console.log(province1);
        console.log(province2);
        return province1 && province2 ? province1.id === province2.id : province1 === province2;
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating service...'
        }).then(loadingEl => {
            loadingEl.present();
            this.servicesService.edit(
                this.service.id,
                this.form.value.address,
                this.form.value.zip,
                this.form.value.city,
                this.form.value.startDate,
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

    ngOnDestroy(): void {
        if (this.serviceSubscription) {
            this.serviceSubscription.unsubscribe();
        }

        if (this.provinceSubscription) {
            this.provinceSubscription.unsubscribe();
        }
    }
}
