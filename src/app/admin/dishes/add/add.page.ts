import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DishesService } from '../dishes.service';
import { Supplier } from '../../suppliers/supplier.model';
import { Event } from '../../events/event.model';
import { Subscription } from 'rxjs';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { EventsService } from '../../events/events.service';

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, {type: contentType});
}

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
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
        private loadingController: LoadingController
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
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            description: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(65535)]
            }),
            suppliers: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
            events: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
            image: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
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
            message: 'Creating dish...'
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.add(
                this.form.value.name,
                this.form.value.description,
                this.form.value.image,
                this.form.value.suppliers,
                this.form.value.events
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/dishes']);
            });
        });
    }
}
