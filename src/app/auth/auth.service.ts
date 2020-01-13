import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, from} from 'rxjs';
import {User} from './user.model';
import {map, tap} from 'rxjs/operators';
import {Plugins} from '@capacitor/core';

export interface AuthResponseData {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    api_token: string;
    role_id: number;
}

const ADMINISTRATOR = 1;
const EMPLOYEE = 2;
const USER = 3;

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
        roleId: number
    ) {
        const data = JSON.stringify({userId, token, tokenExpirationDate, email, firstName, lastName, roleId});
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
                    return user.roleId === ADMINISTRATOR;
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
                    return user.roleId === EMPLOYEE;
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
                    return user.roleId === USER;
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
                    roleId: number
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
                    parsedData.roleId,
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

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            `http://api.test/api/user?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`,
            {
                email,
                password,
                returnSecureToken: true
            }
        ).pipe(tap(this.setUserData.bind(this)));
    }

    login(email: string, password: string) {
        return this.http.get<AuthResponseData>(
            `http://api.test/api/user?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`,
            // {
            //     email,
            //     password,
            //     returnSecureToken: true
            // }
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

    private setUserData(userData: AuthResponseData) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 1);
        const user = new User(
            userData.id,
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.api_token,
            userData.role_id,
            expirationTime
        );
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
        AuthService.storeAuthData(
            userData.id,
            userData.api_token,
            expirationTime.toISOString(),
            userData.email,
            userData.first_name,
            userData.last_name,
            userData.role_id
        );
    }

    ngOnDestroy(): void {
        if (!this.activeLogoutTimer) {
            clearTimeout(this.activeLogoutTimer);
        }
    }

    getUrlByRole(roleId: number) {
        switch (roleId) {
            case ADMINISTRATOR:
                return '/admin';
            case EMPLOYEE:
                return '/employee';
            case USER:
                return '/user';
        }
    }
}
