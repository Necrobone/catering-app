import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Supplier } from '../supplier.model';
import { SuppliersService } from '../suppliers.service';
import { Headquarter } from '../../headquarters/headquarter.model';
import { HeadquartersService } from '../../headquarters/headquarters.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    supplier: Supplier;
    headquarters: Headquarter[];
    formLoaded = false;
    private subscription: Subscription;
    private headquarterSubscription: Subscription;

    constructor(
        private suppliersService: SuppliersService,
        private headquartersService: HeadquartersService,
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
                this.navCtrl.navigateBack('/admin/suppliers');
                return;
            }

            this.headquarterSubscription = this.headquartersService.headquarters.subscribe(headquarters => {
                this.headquarters = headquarters;
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Headquarters could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/suppliers']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
            this.subscription = this.suppliersService.getSupplier(+paramMap.get('id')).subscribe(supplier => {
                this.supplier = supplier;
                this.form = new FormGroup({
                    name: new FormControl(this.supplier.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    headquarters: new FormControl(this.supplier.headquartersIds, {
                        updateOn: 'blur',
                        validators: [Validators.required]
                    }),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Supplier could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/suppliers']);
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
            this.headquartersService.fetch().subscribe(() => {
                this.formLoaded = true;
                loadingEl.dismiss();
            });
        });
    }

    onEdit() {
        if (!this.form.valid) {
            return;
        }

        this.loadingController.create({
            message: 'Updating supplier...'
        }).then(loadingEl => {
            loadingEl.present();
            this.suppliersService.edit(
                this.supplier.id,
                this.form.value.name,
                this.form.value.headquarters,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/suppliers']);
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Supplier',
            message: 'Are you sure that you want to delete this supplier?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                },
                {
                    text: 'Okay',
                    handler: () => {
                        this.suppliersService.delete(
                            this.supplier.id
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/suppliers']);
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

        if (this.headquarterSubscription) {
            this.headquarterSubscription.unsubscribe();
        }
    }
}
