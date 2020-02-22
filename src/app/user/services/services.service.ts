import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Dish } from '../../admin/dishes/dish.model';
import { Event } from '../../admin/events/event.model';
import { Service } from '../../admin/services/service.model';
import { AuthService } from '../../auth/auth.service';
import { Province } from '../../province.model';

@Injectable({
    providedIn: 'root'
})
export class ServicesService {
    private _services = new BehaviorSubject<Service[]>([]);

    get services() {
        return this._services.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Service }>(
                `${environment.api}/api/employees/${this.authService.user.id}/services?api_token=${this.authService.user.token}`
            )
            .pipe(
                map(services => {
                    const srvs = [];
                    for (const key in services) {
                        if (services.hasOwnProperty(key)) {
                            srvs.push(new Service(
                                +services[key].id,
                                services[key].address,
                                services[key].zip,
                                services[key].city,
                                new Date(services[key].startDate),
                                services[key].approved,
                                services[key].province,
                                services[key].event,
                                services[key].dishes,
                                services[key].users
                            ));
                        }
                    }

                    return srvs;
                }),
                tap(services => {
                    this._services.next(services);
                })
            );
    }

    getService(id: number) {
        return this.http
            .get<Service>(`${environment.api}/api/services/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(service => {
                return new Service(
                    id,
                    service.address,
                    service.zip,
                    service.city,
                    new Date(service.startDate),
                    service.approved,
                    service.province,
                    service.event,
                    service.dishes,
                    service.users
                );
            }));
    }

    add(
        address: string,
        zip: string,
        city: string,
        startDate: Date,
        province: number,
        event: number,
        dishes: number[]
    ) {
        let generatedId: number;
        let newService: Service;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newService = new Service(
                        Math.random(),
                        address,
                        zip,
                        city,
                        startDate,
                        null,
                        province,
                        event,
                        dishes,
                        [this.authService.user]
                    );
                    return this.http.post<{ id: number }>(
                        `${environment.api}/api/services?api_token=${this.authService.user.token}`,
                        {...newService, id: null, users: [this.authService.user.id]}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.services;
                }),
                take(1),
                tap(services => {
                    newService.id = generatedId;
                    this._services.next(services.concat(newService));
                })
            );
    }
}
