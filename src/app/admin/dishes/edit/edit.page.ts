import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Dish } from '../dish.model';
import { DishesService } from '../dishes.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    dish: Dish;
    private subscription: Subscription;

    constructor(
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
                this.navCtrl.navigateBack('/admin/dishes');
                return;
            }

            this.subscription = this.dishesService.getDish(+paramMap.get('id')).subscribe(dish => {
                this.dish = dish;
                this.form = new FormGroup({
                    name: new FormControl(this.dish.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                    description: new FormControl(this.dish.description, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(65535)]
                    }),
                    image: new FormControl(this.dish.image, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)]
                    }),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Dish could not be fetched. Please try again later.',
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin/dishes']);
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
            message: 'Updating dish...'
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.edit(
                this.dish.id,
                this.form.value.name,
                this.form.value.description,
                this.form.value.image,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/dishes']);
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
                        this.dishesService.delete(
                            this.dish.id
                        ).subscribe(() => {
                            this.form.reset();
                            this.router.navigate(['/admin/dishes']);
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
