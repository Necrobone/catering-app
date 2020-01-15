import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Menu } from './menu.model';

@Injectable({
    providedIn: 'root'
})
export class MenusService {
    private _menus = new BehaviorSubject<Menu[]>([]);

    get menus() {
        return this._menus.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Menu }>(
                'http://api.test/api/menus?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw'
            )
            .pipe(
                map(menus => {
                    const ms = [];
                    for (const key in menus) {
                        if (menus.hasOwnProperty(key)) {
                            ms.push(new Menu(
                                +menus[key].id,
                                menus[key].name,
                                menus[key].createdAt,
                                menus[key].updatedAt,
                                menus[key].deletedAt
                            ));
                        }
                    }

                    return ms;
                }),
                tap(menus => {
                    this._menus.next(menus);
                })
            );
    }

    getMenu(id: number) {
        return this.http
            .get<Menu>(`http://api.test/api/menus/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`)
            .pipe(map(menu => {
                return new Menu(
                    id,
                    menu.name,
                    menu.createdAt,
                    menu.updatedAt,
                    menu.deletedAt
                );
            }));
    }

    add(name: string) {
        let generatedId: number;
        let newMenu: Menu;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newMenu = new Menu(
                        Math.random(),
                        name,
                        new Date(),
                        null,
                        null
                    );
                    return this.http.post<{ id: number }>(
                        'http://api.test/api/menus?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw',
                        {...newMenu, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.menus;
                }),
                take(1),
                tap(menus => {
                    newMenu.id = generatedId;
                    this._menus.next(menus.concat(newMenu));
                })
            );
    }

    edit(id: number, name: string) {
        let updatedMenus: Menu[];
        return this.menus.pipe(
            take(1),
            switchMap(menus => {
                if (!menus || menus.length <= 0) {
                    return this.fetch();
                } else {
                    return of(menus);
                }
            }),
            switchMap(menus => {
                const updatedMenuIndex = menus.findIndex(ds => ds.id === id);
                updatedMenus = [...menus];
                const oldMenu = updatedMenus[updatedMenuIndex];

                updatedMenus[updatedMenuIndex] = new Menu(
                    oldMenu.id,
                    name,
                    oldMenu.createdAt,
                    new Date(),
                    oldMenu.deletedAt
                );
                return this.http.put(
                    `http://api.test/api/menus/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`,
                    {...updatedMenus[updatedMenuIndex], id: null}
                );
            }),
            tap(resData => {
                this._menus.next(updatedMenus);
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
                        `http://api.test/api/menus/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`
                    );
                }),
                switchMap(() => {
                    return this.menus;
                }),
                take(1),
                tap(menus => {
                    this._menus.next(menus.filter(ds => ds.id !== id));
                })
            );
    }
}
