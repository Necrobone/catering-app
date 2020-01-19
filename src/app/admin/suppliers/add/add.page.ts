import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { SuppliersService } from '../suppliers.service';
import { Headquarter } from '../../headquarters/headquarter.model';
import { Subscription } from 'rxjs';
import { HeadquartersService } from '../../headquarters/headquarters.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    form: FormGroup;
    headquarters: Headquarter[];
    private subscription: Subscription;

    constructor(
        private suppliersService: SuppliersService,
        private headquartersService: HeadquartersService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        this.subscription = this.headquartersService.headquarters.subscribe(headquarters => {
            this.headquarters = headquarters;
        });
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
            headquarters: new FormControl(null, {
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
            this.headquartersService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating supplier...'
        }).then(loadingEl => {
            loadingEl.present();
            this.suppliersService.add(this.form.value.name, this.form.value.headquarters).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/suppliers']);
            });
        });
    }
}
