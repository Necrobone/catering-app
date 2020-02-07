import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Province } from '../../../province.model';
import { ProvincesService } from '../../../provinces.service';
import { Headquarter } from '../headquarter.model';
import { headquarterError } from '../headquarters.page';
import { HeadquartersService } from '../headquarters.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    provinces: Province[];
    headquarter: Headquarter;
    formLoaded = false;
    private provinceSubscription: Subscription;
    private headquarterSubscription: Subscription;

    constructor(
        private headquartersService: HeadquartersService,
        private provincesService: ProvincesService,
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
                this.navCtrl.navigateBack('/admin/headquarters');
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
                            this.router.navigate(['admin/headquarters']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
            this.headquarterSubscription = this.headquartersService.getHeadquarter(+paramMap.get('id')).subscribe(headquarter => {
                this.headquarter = headquarter;
                this.form = new FormGroup({
                    name: new FormControl(this.headquarter.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    address: new FormControl(this.headquarter.address, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    zip: new FormControl(this.headquarter.zip, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    city: new FormControl(this.headquarter.city, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    province: new FormControl(this.headquarter.provinceId, {
                        updateOn: 'change',
                        validators: [Validators.required, Validators.min(1)]
                    }),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Headquarter could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/headquarters']);
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
                this.formLoaded = true;
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Provinces could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/headquarters']);
                        }
                    }]
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
            message: 'Updating headquarter...'
        }).then(loadingEl => {
            loadingEl.present();
            this.headquartersService.edit(
                this.headquarter.id,
                this.form.value.name,
                this.form.value.address,
                this.form.value.zip,
                this.form.value.city,
                +this.form.value.province
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/headquarters']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error updating headquarter', headquarterError(error));
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Headquarter',
            message: 'Are you sure that you want to delete this headquarter?',
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
                            message: 'Deleting headquarter...'
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.headquartersService.delete(
                                this.headquarter.id
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.form.reset();
                                this.router.navigate(['/admin/headquarters']);
                            }, error => {
                                loadingEl.dismiss();

                                showAlert('Deleting failed', 'Unexpected error. Please try again.');
                            });
                        });
                    }
                }
            ]
        }).then(loadingEl => {
            loadingEl.present();
        });
    }

    ngOnDestroy(): void {
        if (this.headquarterSubscription) {
            this.headquarterSubscription.unsubscribe();
        }

        if (this.provinceSubscription) {
            this.provinceSubscription.unsubscribe();
        }
    }
}
