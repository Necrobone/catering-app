import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Dish } from './dish.model';

@Injectable({
    providedIn: 'root'
})
export class DishesService {
    private _dishes = new BehaviorSubject<Dish[]>([]);

    get dishes() {
        return this._dishes.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Dish }>(
                'http://api.test/api/dishes?api_token=' + this.authService.user.token
            )
            .pipe(
                map(dishes => {
                    const ds = [];
                    for (const key in dishes) {
                        if (dishes.hasOwnProperty(key)) {
                            ds.push(new Dish(
                                +dishes[key].id,
                                dishes[key].name,
                                dishes[key].description,
                                dishes[key].image,
                                dishes[key].suppliers,
                                dishes[key].events,
                                dishes[key].createdAt,
                                dishes[key].updatedAt,
                                dishes[key].deletedAt
                            ));
                        }
                    }

                    return ds;
                }),
                tap(dishes => {
                    this._dishes.next(dishes);
                })
            );
    }

    getDish(id: number) {
        return this.http
            .get<Dish>(`http://api.test/api/dishes/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(dish => {
                return new Dish(
                    id,
                    dish.name,
                    dish.description,
                    dish.image,
                    dish.suppliers,
                    dish.events,
                    dish.createdAt,
                    dish.updatedAt,
                    dish.deletedAt
                );
            }));
    }

    add(name: string, description: string, image: string, suppliers: [], events: []) {
        let generatedId: number;
        let newDish: Dish;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newDish = new Dish(
                        Math.random(),
                        name,
                        description,
                        image,
                        suppliers,
                        events,
                        new Date(),
                        null,
                        null
                    );
                    return this.http.post<{ id: number }>(
                        'http://api.test/api/dishes?api_token=' + this.authService.user.token,
                        {...newDish, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.dishes;
                }),
                take(1),
                tap(dishes => {
                    newDish.id = generatedId;
                    this._dishes.next(dishes.concat(newDish));
                })
            );
    }

    edit(id: number, name: string, description: string, image: string, suppliers: [], events: []) {
        let updatedDishes: Dish[];
        return this.dishes.pipe(
            take(1),
            switchMap(dishes => {
                if (!dishes || dishes.length <= 0) {
                    return this.fetch();
                } else {
                    return of(dishes);
                }
            }),
            switchMap(dishes => {
                const updatedDishIndex = dishes.findIndex(ds => ds.id === id);
                updatedDishes = [...dishes];
                const oldDish = updatedDishes[updatedDishIndex];

                updatedDishes[updatedDishIndex] = new Dish(
                    oldDish.id,
                    name,
                    description,
                    image,
                    suppliers,
                    events,
                    oldDish.createdAt,
                    new Date(),
                    oldDish.deletedAt
                );
                return this.http.put(
                    `http://api.test/api/dishes/${id}?api_token=${this.authService.user.token}`,
                    {...updatedDishes[updatedDishIndex], id: null}
                );
            }),
            tap(resData => {
                this._dishes.next(updatedDishes);
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
                        `http://api.test/api/dishes/${id}?api_token=${this.authService.user.token}`
                    );
                }),
                switchMap(() => {
                    return this.dishes;
                }),
                take(1),
                tap(dishes => {
                    this._dishes.next(dishes.filter(dish => dish.id !== id));
                })
            );
    }
}
