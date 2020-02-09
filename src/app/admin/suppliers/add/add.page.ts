import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Headquarter } from '../../headquarters/headquarter.model';
import { HeadquartersService } from '../../headquarters/headquarters.service';
import { supplierError } from '../suppliers.page';
import { SuppliersService } from '../suppliers.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
    form: FormGroup;
    headquarters: Headquarter[];
    private subscription: Subscription;

    constructor(
        private suppliersService: SuppliersService,
        private headquartersService: HeadquartersService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController,
    ) {
    }

    ngOnInit() {
        this.subscription = this.headquartersService.headquarters.subscribe(headquarters => {
            this.headquarters = headquarters;
        });
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)],
            }),
            headquarters: new FormControl(null, {
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
            this.headquartersService.fetch().subscribe(() => {
                loadingEl.dismiss();
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Headquarters could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/suppliers']);
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
            message: 'Creating supplier...',
        }).then(loadingEl => {
            loadingEl.present();
            this.suppliersService.add(this.form.value.name, this.form.value.headquarters).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/suppliers']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error creating supplier', supplierError(error));
            });
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
