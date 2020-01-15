import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MenusService } from '../menus.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
    form: FormGroup;

    constructor(
        private menusService: MenusService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            name: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(255)]
            }),
        });
    }

    onCreate() {
        if (!this.form.valid) {
            return;
        }
        this.loadingController.create({
            message: 'Creating menu...'
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.add(this.form.value.name).subscribe(() => {
                loadingEl.dismiss();
                this.form.reset();
                this.router.navigate(['/admin/menus']);
            });
        });
    }
}
