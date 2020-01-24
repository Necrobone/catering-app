import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Service } from './service.model';
import { AuthService } from '../../auth/auth.service';
import { Dish } from '../dishes/dish.model';
import { User } from '../../auth/user.model';

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
                'http://api.test/api/services?api_token=' + this.authService.user.token
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
                                services[key].startDate,
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
            .get<Service>(`http://api.test/api/services/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(service => {
                return new Service(
                    id,
                    service.address,
                    service.zip,
                    service.city,
                    service.startDate,
                    service.approved,
                    service.province,
                    service.event,
                    service.dishes,
                    service.users,
                );
            }));
    }

    edit(
        id: number,
        address: string,
        zip: string,
        city: string,
        startDate: Date,
        province: number,
        event: number,
        dishes: Dish[],
        users: User[]
    ) {
        let updatedServices: Service[];
        return this.services.pipe(
            take(1),
            switchMap(services => {
                if (!services || services.length <= 0) {
                    return this.fetch();
                } else {
                    return of(services);
                }
            }),
            switchMap(services => {
                const updatedServiceIndex = services.findIndex(service => service.id === id);
                updatedServices = [...services];
                const oldService = updatedServices[updatedServiceIndex];

                updatedServices[updatedServiceIndex] = new Service(
                    oldService.id,
                    address,
                    zip,
                    city,
                    startDate,
                    oldService.approved,
                    province,
                    event,
                    dishes,
                    users
                );

                return this.http.put(
                    `http://api.test/api/services/${id}?api_token=${this.authService.user.token}`,
                    {...updatedServices[updatedServiceIndex], id: null}
                );
            }),
            tap(resData => {
                this._services.next(updatedServices);
            })
        );
    }

    delete(id: number) {
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    return this.http.delete(
                        `http://api.test/api/services/${id}?api_token=${this.authService.user.token}`
                    );
                }),
                switchMap(() => {
                    return this.services;
                }),
                take(1),
                tap(services => {
                    this._services.next(services.filter(service => service.id !== id));
                })
            );
    }

    toggle(id: number, approved: boolean) {
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    return this.http.put(
                        `http://api.test/api/services/${id}/toggle?api_token=${this.authService.user.token}`,
                        {approved}
                    );
                }),
                switchMap(() => {
                    return this.services;
                }),
                take(1),
                tap(services => {
                    this._services.next(services.filter(service => service.id !== id));
                })
            );
    }
}
