import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Employee } from '../../admin/employees/employee.model';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private _profile = new BehaviorSubject<Employee>(null);

    get profile() {
        return this._profile.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    getProfile(id: number) {
        return this.http
            .get<Employee>(`http://api.test/api/employees/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(employee => {
                return new Employee(
                    id,
                    employee.firstName,
                    employee.lastName,
                    employee.email,
                    employee.password,
                    employee.apiToken,
                    employee.role
                );
            }));
    }

    edit(id: number, firstName: string, lastName: string, email: string, password: string|null) {
        let updatedProfile = null;
        return this.profile.pipe(
            take(1),
            switchMap(profile => {

                if (!profile) {
                    return this.getProfile(id);
                } else {
                    return of(profile);
                }
            }),
            switchMap(profile => {
                const oldProfile = profile;

                updatedProfile = new Employee(
                    oldProfile.id,
                    firstName,
                    lastName,
                    email,
                    password,
                    null,
                    oldProfile.roleId
                );

                return this.http.put(
                    `http://api.test/api/employees/${id}?api_token=${this.authService.user.token}`,
                    {...updatedProfile, id: null}
                );
            }),
            tap(resData => {
                this._profile.next(updatedProfile);
            })
        );
    }
}
