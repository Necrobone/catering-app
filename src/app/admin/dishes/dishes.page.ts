import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Dish } from './dish.model';
import { Subscription } from 'rxjs';
import { DishesService } from './dishes.service';

@Component({
    selector: 'app-dishes',
    templateUrl: './dishes.page.html',
    styleUrls: ['./dishes.page.scss'],
})
export class DishesPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    dishes: Dish[];
    private subscription: Subscription;

    constructor(private dishesService: DishesService, private loadingController: LoadingController) {
        this.dishes = [];
    }

    ngOnInit() {
        this.subscription = this.dishesService.dishes.subscribe(dishes => {
            this.dishes = dishes;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.dishesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    doRefresh(event) {
        this.dishesService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.dishesService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
