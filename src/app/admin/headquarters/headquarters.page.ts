import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Headquarter } from './headquarter.model';
import { Subscription } from 'rxjs';
import { HeadquartersService } from './headquarters.service';

@Component({
    selector: 'app-headquarters',
    templateUrl: './headquarters.page.html',
    styleUrls: ['./headquarters.page.scss'],
})
export class HeadquartersPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    headquarters: Headquarter[];
    private subscription: Subscription;

    constructor(private headquartersService: HeadquartersService, private loadingController: LoadingController) {
        this.headquarters = [];
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
            });
        });
    }

    doRefresh(event) {
        this.headquartersService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.headquartersService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
