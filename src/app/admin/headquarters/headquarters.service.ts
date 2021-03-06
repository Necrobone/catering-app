import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Headquarter } from './headquarter.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class HeadquartersService {
    private _headquarters = new BehaviorSubject<Headquarter[]>([]);

    get headquarters() {
        return this._headquarters.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Headquarter }>(
                `${environment.api}/api/headquarters?api_token=${this.authService.user.token}`
            )
            .pipe(
                map(headquarters => {
                    const hqs = [];
                    for (const key in headquarters) {
                        if (headquarters.hasOwnProperty(key)) {
                            hqs.push(new Headquarter(
                                +headquarters[key].id,
                                headquarters[key].name,
                                headquarters[key].address,
                                headquarters[key].zip,
                                headquarters[key].city,
                                headquarters[key].province
                            ));
                        }
                    }

                    return hqs;
                }),
                tap(headquarters => {
                    this._headquarters.next(headquarters);
                })
            );
    }

    getHeadquarter(id: number) {
        return this.http
            .get<Headquarter>(`${environment.api}/api/headquarters/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(headquarter => {
                return new Headquarter(
                    id,
                    headquarter.name,
                    headquarter.address,
                    headquarter.zip,
                    headquarter.city,
                    headquarter.province
                );
            }));
    }

    add(name: string, address: string, zip: string, city: string, province: number) {
        let generatedId: number;
        let newHeadquarter: Headquarter;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newHeadquarter = new Headquarter(
                        Math.random(),
                        name,
                        address,
                        zip,
                        city,
                        province
                    );
                    return this.http.post<{ id: number }>(
                        `${environment.api}/api/headquarters?api_token=${this.authService.user.token}`,
                        {...newHeadquarter, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.headquarters;
                }),
                take(1),
                tap(headquarters => {
                    newHeadquarter.id = generatedId;
                    this._headquarters.next(headquarters.concat(newHeadquarter));
                })
            );
    }

    edit(id: number, name: string, address: string, zip: string, city: string, province: number) {
        let updatedHeadquarters: Headquarter[];
        return this.headquarters.pipe(
            take(1),
            switchMap(headquarters => {
                if (!headquarters || headquarters.length <= 0) {
                    return this.fetch();
                } else {
                    return of(headquarters);
                }
            }),
            switchMap(headquarters => {
                const updatedHeadquarterIndex = headquarters.findIndex(hq => hq.id === id);
                updatedHeadquarters = [...headquarters];
                const oldHeadquarter = updatedHeadquarters[updatedHeadquarterIndex];

                updatedHeadquarters[updatedHeadquarterIndex] = new Headquarter(
                    oldHeadquarter.id,
                    name,
                    address,
                    zip,
                    city,
                    province
                );
                return this.http.put(
                    `${environment.api}/api/headquarters/${id}?api_token=${this.authService.user.token}`,
                    {...updatedHeadquarters[updatedHeadquarterIndex], id: null}
                );
            }),
            tap(resData => {
                this._headquarters.next(updatedHeadquarters);
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
                        `${environment.api}/api/headquarters/${id}?api_token=${this.authService.user.token}`
                    );
                }),
                switchMap(() => {
                    return this.headquarters;
                }),
                take(1),
                tap(headquarters => {
                    this._headquarters.next(headquarters.filter(headquarter => headquarter.id !== id));
                })
            );
    }
}
