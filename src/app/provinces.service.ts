import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { Province } from './province.model';

@Injectable({
    providedIn: 'root'
})
export class ProvincesService {
    private _provinces = new BehaviorSubject<Province[]>([]);

    get provinces() {
        return this._provinces.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: number]: Province }>('http://api.test/api/provinces?api_token=cnRmsou5IIdU1eEhmNajBA91taYVPMTubdHu4dJ52PhNoJYv16')
            .pipe(
                map(provinces => {
                    const result = [];
                    for (const key in provinces) {
                        if (provinces.hasOwnProperty(key)) {
                            result.push(new Province(
                                provinces[key].id,
                                provinces[key].name,
                            ));
                        }
                    }

                    return result;
                }),
                tap(places => {
                    this._provinces.next(places);
                })
            );
    }
}
