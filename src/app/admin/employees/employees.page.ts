import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, LoadingController } from '@ionic/angular';
import { Employee } from './employee.model';
import { Subscription } from 'rxjs';
import { EmployeesService } from './employees.service';

@Component({
    selector: 'app-employees',
    templateUrl: './employees.page.html',
    styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit {
    @ViewChild(IonInfiniteScroll, {read: undefined, static: false}) infiniteScroll: IonInfiniteScroll;
    employees: Employee[];
    private subscription: Subscription;

    constructor(private employeesService: EmployeesService, private loadingController: LoadingController) {
        this.employees = [];
    }

    ngOnInit() {
        this.subscription = this.employeesService.employees.subscribe(employees => {
            this.employees = employees;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.employeesService.fetch().subscribe(() => {
                loadingEl.dismiss();
            });
        });
    }

    doRefresh(event) {
        this.employeesService.fetch().subscribe(() => {
            event.target.complete();
        });
    }

    loadData(event) {
        this.employeesService.fetch().subscribe(() => {
            event.target.complete();
        });
    }
}
