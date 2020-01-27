import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Service } from '../../admin/services/service.model';

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
                `http://api.test/api/employees/${this.authService.user.id}/services?api_token=${this.authService.user.token}`
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
                    new Date(service.startDate),
                    service.approved,
                    service.province,
                    service.event,
                    service.dishes,
                    service.users
                );
            }));
    }
}
