import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Headquarter } from './headquarter.model';

@Component({
    selector: 'app-headquarters',
    templateUrl: './headquarters.page.html',
    styleUrls: ['./headquarters.page.scss'],
})
export class HeadquartersPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    headquarters: Headquarter[];

    constructor() {
        this.headquarters = [];
        for (let i = 0; i < 10; i++) {
            const headquarter = new Headquarter(
                i,
                'Sede',
                'C/ Acentejo 4, 1º Izquierda',
                '28017',
                'Madrid',
                28,
                new Date(),
                null,
                null,
            );
            this.headquarters.push(headquarter);
        }
    }

    ngOnInit() {
    }

    doRefresh(event) {
        console.log('Begin async operation');

        setTimeout(() => {
            console.log('Async operation has ended');
            event.target.complete();
        }, 2000);

        for (let i = 0; i < 10; i++) {
            const headquarter = new Headquarter(
                i,
                'Sede',
                'C/ Acentejo 4, 1º Izquierda',
                '28017',
                'Madrid',
                28,
                new Date(),
                null,
                null,
            );
            this.headquarters.push(headquarter);
        }
    }

    loadData(event) {
        const data = [{
            text: 'text',
        }];
        setTimeout(() => {
            console.log('Done');
            for (let i = 0; i < 10; i++) {
                const headquarter = new Headquarter(
                    i,
                    'Sede',
                    'C/ Acentejo 4, 1º Izquierda',
                    '28017',
                    'Madrid',
                    28,
                    new Date(),
                    null,
                    null,
                );
                this.headquarters.push(headquarter);
            }
            event.target.complete();

            // App logic to determine if all data is loaded
            // and disable the infinite scroll
            if (data.length === 1000) {
                event.target.disabled = true;
            }
        }, 500);
    }
}
