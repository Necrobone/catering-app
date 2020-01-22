import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Role } from './role.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private _roles = new BehaviorSubject<Role[]>([]);

    get roles() {
        return this._roles.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: number]: Role }>('http://api.test/api/roles?api_token=' + this.authService.user.token)
            .pipe(
                map(roles => {
                    const result = [];
                    for (const key in roles) {
                        if (roles.hasOwnProperty(key)) {
                            result.push(new Role(
                                roles[key].id,
                                roles[key].name,
                            ));
                        }
                    }

                    return result;
                }),
                tap(places => {
                    this._roles.next(places);
                })
            );
    }
}
