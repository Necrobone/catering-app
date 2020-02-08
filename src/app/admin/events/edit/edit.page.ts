import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { showAlert } from '../../../app.component';
import { Event } from '../event.model';
import { eventError } from '../events.page';
import { EventsService } from '../events.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.page.html',
    styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {
    form: FormGroup;
    event: Event;
    private subscription: Subscription;

    constructor(
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
                this.navCtrl.navigateBack('/admin/events');
                return;
            }

            this.subscription = this.eventsService.getEvent(+paramMap.get('id')).subscribe(event => {
                this.event = event;
                this.form = new FormGroup({
                    name: new FormControl(this.event.name, {
                        updateOn: 'blur',
                        validators: [Validators.required, Validators.maxLength(255)],
                    }),
                });
            }, error => {
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Event could not be fetched. Please try again later.',
                    buttons: [
                        {
                            text: 'Okay', handler: () => {
                                this.router.navigate(['admin/events']);
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
            message: 'Updating event...',
        }).then(loadingEl => {
            loadingEl.present();
            this.eventsService.edit(
                this.event.id,
                this.form.value.name,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/events']);
            }, error => {
                loadingEl.dismiss();

                showAlert('Error updating event', eventError(error));
            });
        });
    }

    onDestroy() {
        this.alertController.create({
            header: 'Delete Event',
            message: 'Are you sure that you want to delete this event?',
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
                            message: 'Deleting event...',
                        }).then(loadingEl => {
                            loadingEl.present();
                            this.eventsService.delete(
                                this.event.id,
                            ).subscribe(() => {
                                loadingEl.dismiss();
                                this.form.reset();
                                this.router.navigate(['/admin/events']);
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
    }
}
