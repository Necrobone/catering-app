import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonSlides, LoadingController } from '@ionic/angular';
import { CheckboxChangeEventDetail, SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Dish } from '../../../admin/dishes/dish.model';
import { DishesService } from '../../../admin/dishes/dishes.service';
import { Event } from '../../../admin/events/event.model';
import { EventsService } from '../../../admin/events/events.service';
import { Menu } from '../../../admin/menus/menu.model';
import { MenusService } from '../../../admin/menus/menus.service';
import { Province } from '../../../province.model';
import { ProvincesService } from '../../../provinces.service';
import { ServicesService } from '../services.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
    @ViewChild('slider', {static: false}) slider: IonSlides;
    @ViewChild('eventForm', {static: false}) eventForm: NgForm;
    @ViewChild('serviceForm', {static: false}) serviceForm: NgForm;
    events: Event[] = [];
    dishes: Dish[] = [];
    menus: Menu[] = [];
    provinces: Province[];
    selectedEvent: Event;
    selectedDishes: Dish[] = [];
    selectedMenus: Menu[] = [];
    selectedAddress: string;
    selectedZip: string;
    selectedCity: string;
    selectedStartDate: Date;
    selectedProvince: Province;
    list: any;
    firstSlide = true;
    lastSlide = false;
    formLoaded = false;
    formError = false;
    actualFilter = 'dishes';
    private eventSubscription: Subscription;
    private dishSubscription: Subscription;
    private menuSubscription: Subscription;
    private provinceSubscription: Subscription;

    config = {
        allowSlidePrev: false,
        allowSlideNext: false,
    };

    constructor(
        private eventsService: EventsService,
        private dishesService: DishesService,
        private menusService: MenusService,
        private provincesService: ProvincesService,
        private servicesService: ServicesService,
        private router: Router,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        this.eventSubscription = this.eventsService.events.subscribe(events => {
            this.events = events;
        });
        this.dishSubscription = this.dishesService.dishes.subscribe(dishes => {
            this.dishes = dishes;

            this.menuSubscription = this.menusService.menus.subscribe(menus => {
                this.menus = menus;

                switch (this.actualFilter) {
                    case 'menus':
                        this.actualFilter = 'menus';
                        this.list = this.menus;
                        break;
                    case 'dishes':
                    default:
                        this.actualFilter = 'dishes';
                        this.list = this.dishes;
                        break;
                }
            });
        });
        this.provinceSubscription = this.provincesService.provinces.subscribe(provinces => {
            this.provinces = provinces;
        });
    }

    ionViewWillEnter() {
        this.loadingController.create({
            message: 'Fetching...',
        }).then(loadingEl => {
            loadingEl.present();
            this.eventsService.fetch().subscribe(() => {
                this.dishesService.fetch().subscribe(() => {
                    this.menusService.fetch().subscribe(() => {
                        this.provincesService.fetch().subscribe(() => {
                            this.formLoaded = true;
                            loadingEl.dismiss();
                        });
                    });
                });
            });
        });
    }

    isBeginning() {
        this.slider.isBeginning().then(result => {
            this.firstSlide = result;
        }).catch(error => {
            console.log(error);
        });
    }

    isEnd() {
        this.slider.isEnd().then(result => {
            this.lastSlide = result;
        }).catch(error => {
            console.log(error);
        });
    }

    nextSlide() {
        this.slider.getActiveIndex().then(index => {
            switch (index) {
                case 0:
                default:
                    if (this.eventForm.invalid) {
                        this.formError = true;
                        return false;
                    }

                    this.selectedEvent = this.eventForm.value.event;
                    break;
                case 1:
                    if (this.selectedMenus.length === 0 && this.selectedDishes.length === 0) {
                        this.formError = true;
                        return false;
                    }
                    break;
                case 2:
                    if (this.serviceForm.invalid) {
                        this.formError = true;
                        return false;
                    }

                    const startDate = new Date(this.serviceForm.value.startDate);
                    const startTime = new Date(this.serviceForm.value.startTime);
                    startDate.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());

                    this.selectedAddress = this.serviceForm.value.address;
                    this.selectedZip = this.serviceForm.value.zip;
                    this.selectedCity = this.serviceForm.value.city;
                    this.selectedStartDate = startDate;
                    this.selectedProvince = this.serviceForm.value.province;
                    break;
            }

            this.formError = false;

            this.slider.lockSwipes(false).then(() => {
                this.slider.slideNext(500).then(() => {
                    this.slider.lockSwipes(true).then(() => {
                        this.isBeginning();
                        this.isEnd();
                    });
                });
            });
        });
    }

    previousSlide() {
        this.formError = false;

        this.selectedAddress = null;
        this.selectedZip = null;
        this.selectedCity = null;

        this.slider.lockSwipes(false).then(() => {
            this.slider.slidePrev(500).then(() => {
                this.slider.lockSwipes(true).then(() => {
                    this.isBeginning();
                    this.isEnd();
                });
            });
        });
    }

    onCreate() {
        if (this.formError) {
            return;
        }
        this.loadingController.create({
            message: 'Creating service...'
        }).then(loadingEl => {
            loadingEl.present();

            this.selectedMenus.forEach(menu => {
                menu.dishes.forEach(dish => {
                    this.selectedDishes.push(dish);
                });
            });
            this.servicesService.add(
                this.selectedAddress,
                this.selectedZip,
                this.selectedCity,
                this.selectedStartDate,
                this.selectedProvince,
                this.selectedEvent,
                this.selectedDishes
            ).subscribe(() => {
                loadingEl.dismiss();
                this.eventForm.reset();
                this.serviceForm.reset();
                this.router.navigate(['/user/services']);
            });
        });
    }

    toggleDish(event: CustomEvent<CheckboxChangeEventDetail>) {
        if (event.detail.checked) {
            this.selectedDishes.push(event.detail.value);
        } else {
            this.selectedDishes.splice(this.selectedDishes.indexOf(event.detail.value), 1);
        }
    }

    toggleMenu(event: CustomEvent<CheckboxChangeEventDetail>) {
        if (event.detail.checked) {
            this.selectedMenus.push(event.detail.value);
        } else {
            this.selectedMenus.splice(this.selectedMenus.indexOf(event.detail.value), 1);
        }
    }

    onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
        switch (event.detail.value) {
            case 'menus':
                this.actualFilter = 'menus';
                this.list = this.menus;
                break;
            case 'dishes':
            default:
                this.actualFilter = 'dishes';
                this.list = this.dishes;
                break;
        }
    }

    ngOnDestroy(): void {
        if (this.eventSubscription) {
            this.eventSubscription.unsubscribe();
        }

        if (this.dishSubscription) {
            this.dishSubscription.unsubscribe();
        }

        if (this.menuSubscription) {
            this.menuSubscription.unsubscribe();
        }
    }
}
