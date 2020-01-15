import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Menu } from './menu.model';
import { Subscription } from 'rxjs';
import { MenusService } from './menus.service';

@Component({
    selector: 'app-menus',
    templateUrl: './menus.page.html',
    styleUrls: ['./menus.page.scss'],
})
export class MenusPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    menus: Menu[];
    private subscription: Subscription;

    constructor(private menusService: MenusService, private loadingController: LoadingController) {
        this.menus = [];
    }

    ngOnInit() {
        this.subscription = this.menusService.menus.subscribe(menus => {
            this.menus = menus;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.menusService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    doRefresh(event) {
        this.menusService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.menusService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
