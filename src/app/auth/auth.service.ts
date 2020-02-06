import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { Role } from './role.model';
import { Service } from '../admin/services/service.model';

export const ADMINISTRATOR = 1;
export const EMPLOYEE = 2;
export const USER = 3;

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    constructor(private http: HttpClient) {
    }

    private _user = new BehaviorSubject<User>(null);
    private activeLogoutTimer: any;

    private static storeAuthData(
        userId: number,
        token: string,
        tokenExpirationDate: string,
        email: string,
        firstName: string,
        lastName: string,
        role: Role,
        services: Service[]
    ) {
        const data = JSON.stringify({userId, token, tokenExpirationDate, email, firstName, lastName, role, services});
        Plugins.Storage.set({key: 'authData', value: data});
    }

    get token() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.token;
                } else {
                    return null;
                }
            })
        );
    }

    get userIsAuthenticated() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return !!user.token;
                } else {
                    return false;
                }
            })
        );
    }

    get user() {
        return this._user.getValue();
    }

    get userId() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.id;
                } else {
                    return null;
                }
            })
        );
    }

    isAdmin() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.role.id === ADMINISTRATOR;
                } else {
                    return false;
                }
            })
        );
    }

    isEmployee() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.role.id === EMPLOYEE;
                } else {
                    return false;
                }
            })
        );
    }

    isUser() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.role.id === USER;
                } else {
                    return false;
                }
            })
        );
    }

    autoLogin() {
        return from(Plugins.Storage.get({key: 'authData'})).pipe(
            map(storedData => {
                if (!storedData || !storedData.value) {
                    return null;
                }

                const parsedData = JSON.parse(storedData.value) as {
                    userId: number,
                    token: string,
                    tokenExpirationDate: string,
                    email: string,
                    firstName: string,
                    lastName: string,
                    role: Role,
                    services: Service[],
                };
                const expirationTime = new Date(parsedData.tokenExpirationDate);
                if (expirationTime <= new Date()) {
                    return null;
                }

                return new User(
                    parsedData.userId,
                    parsedData.firstName,
                    parsedData.lastName,
                    parsedData.email,
                    parsedData.token,
                    parsedData.role,
                    parsedData.services,
                    expirationTime
                );
            }),
            tap(user => {
                if (user) {
                    this._user.next(user);
                    this.autoLogout(user.tokenDuration);
                }
            }),
            map(user => {
                return !!user;
            })
        );
    }

    signup(firstName: string, lastName: string, email: string, password: string, passwordConfirmation: string) {
        return this.http.post<User>(
            `http://api.test/api/signup`,
            {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                password_confirmation: passwordConfirmation
            }
        ).pipe(tap(this.setUserData.bind(this)));
    }

    login(email: string, password: string) {
        return this.http.post<User>(
            `http://api.test/api/login`,
            {
                email,
                password,
            }
        ).pipe(tap(this.setUserData.bind(this)));
    }

    logout() {
        if (!this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }

        this._user.next(null);
        Plugins.Storage.remove({key: 'authData'});
    }

    private autoLogout(duration: number) {
        if (!this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }

        this.activeLogoutTimer = setTimeout(() => {
            this.logout();
        }, duration);
    }

    private setUserData(userData: User) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 2);
        const user = new User(
            userData.id,
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.apiToken,
            userData.role,
            userData.services,
            expirationTime
        );
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
        AuthService.storeAuthData(
            userData.id,
            userData.apiToken,
            expirationTime.toISOString(),
            userData.email,
            userData.firstName,
            userData.lastName,
            userData.role,
            userData.services,
        );
    }

    ngOnDestroy(): void {
        if (!this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }
    }

    getUrlByRole(id: number) {
        switch (id) {
            case ADMINISTRATOR:
                return '/admin';
            case EMPLOYEE:
                return '/employee';
            case USER:
                return '/user';
        }
    }
}
