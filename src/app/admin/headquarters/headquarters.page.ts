import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../app.component';
import { Headquarter } from './headquarter.model';
import { HeadquartersService } from './headquarters.service';

@Component({
    selector: 'app-headquarters',
    templateUrl: './headquarters.page.html',
    styleUrls: ['./headquarters.page.scss'],
})
export class HeadquartersPage implements OnInit {
    headquarters: Headquarter[] = [];
    private subscription: Subscription;

    constructor(
        private headquartersService: HeadquartersService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.subscription = this.headquartersService.headquarters.subscribe(headquarters => {
            this.headquarters = headquarters;
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
                    buttons: [{
                        text: 'Okay', handler: () => {
                            this.router.navigate(['admin']);
                        }
                    }]
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    doRefresh(event) {
        this.headquartersService.fetch().subscribe(() => {
            event.target.complete();
        }, error => {
            event.target.complete();
            this.alertController.create({
                header: 'An error ocurred!',
                message: 'Headquarters could not be fetched. Please try again later.',
                buttons: [{
                    text: 'Okay', handler: () => {
                        this.router.navigate(['admin']);
                    }
                }]
            }).then(alertEl => {
                alertEl.present();
            });
        });
    }
}

export const headquarterError = (error: any) => {
    let message;
    switch (error.error.error) {
        case 'NAME_REQUIRED':
            message = 'Name can not be empty';
            break;
        case 'NAME_INVALID':
            message = 'Name is invalid';
            break;
        case 'NAME_TOO_LONG':
            message = 'Name is too long';
            break;
        case 'ADDRESS_REQUIRED':
            message = 'Address can not be empty';
            break;
        case 'ADDRESS_INVALID':
            message = 'Address is invalid';
            break;
        case 'ADDRESS_TOO_LONG':
            message = 'Address is too long';
            break;
        case 'ZIP_REQUIRED':
            message = 'Zip can not be empty';
            break;
        case 'ZIP_INVALID':
            message = 'Zip is invalid';
            break;
        case 'ZIP_TOO_LONG':
            message = 'Zip is too long';
            break;
        case 'CITY_REQUIRED':
            message = 'City can not be empty';
            break;
        case 'CITY_INVALID':
            message = 'City is invalid';
            break;
        case 'CITY_TOO_LONG':
            message = 'City is too long';
            break;
        case 'PROVINCE_REQUIRED':
            message = 'Province can not be empty';
            break;
        case 'PROVINCE_INVALID':
            message = 'Province is invalid';
            break;
        case 'PROVINCE_NOT_FOUND':
            message = 'Province not found';
            break;
        default:
            message = 'Unexpected error. Please try again.';
            break;
    }

    showAlert('Persisting failed', message);
};
