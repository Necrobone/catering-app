import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { HeadquartersService } from '../headquarters.service';
import { ProvincesService } from '../../../provinces.service';
import { Province } from '../../../province.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    form: FormGroup;
    provinces: Province[];
    private subscription: Subscription;

    constructor(
        private headquartersService: HeadquartersService,
        private provincesService: ProvincesService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        this.subscription = this.provincesService.provinces.subscribe(provinces => {
            this.provinces = provinces;
        });
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            address: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            zip: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            city: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            province: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.min(1)]
            })
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.provincesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating headquarter...'
        }).then(loadingEl => {
            loadingEl.present();
            this.headquartersService.add(
                this.form.value.name,
                this.form.value.address,
                this.form.value.zip,
                this.form.value.city,
                +this.form.value.province,
            ).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/headquarters']);
            });
        });
    }
}
