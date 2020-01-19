import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Supplier } from './supplier.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SuppliersService {
    private _suppliers = new BehaviorSubject<Supplier[]>([]);

    get suppliers() {
        return this._suppliers.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Supplier }>(
                'http://api.test/api/suppliers?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw'
            )
            .pipe(
                map(suppliers => {
                    const places = [];
                    for (const key in suppliers) {
                        if (suppliers.hasOwnProperty(key)) {
                            places.push(new Supplier(
                                +suppliers[key].id,
                                suppliers[key].name,
                                suppliers[key].headquarters,
                                suppliers[key].createdAt,
                                suppliers[key].updatedAt,
                                suppliers[key].deletedAt
                            ));
                        }
                    }

                    return places;
                }),
                tap(places => {
                    this._suppliers.next(places);
                })
            );
    }

    getSupplier(id: number) {
        return this.http
            .get<Supplier>(`http://api.test/api/suppliers/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`)
            .pipe(map(supplier => {
                return new Supplier(
                    id,
                    supplier.name,
                    supplier.headquarters,
                    supplier.createdAt,
                    supplier.updatedAt,
                    supplier.deletedAt
                );
            }));
    }

    add(name: string, headquarters: []) {
        let generatedId: number;
        let newSupplier: Supplier;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newSupplier = new Supplier(
                        Math.random(),
                        name,
                        headquarters,
                        new Date(),
                        null,
                        null
                    );
                    return this.http.post<{ id: number }>(
                        'http://api.test/api/suppliers?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw',
                        {...newSupplier, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.suppliers;
                }),
                take(1),
                tap(suppliers => {
                    newSupplier.id = generatedId;
                    this._suppliers.next(suppliers.concat(newSupplier));
                })
            );
    }

    edit(id: number, name: string, headquarters: []) {
        let updatedSuppliers: Supplier[];
        return this.suppliers.pipe(
            take(1),
            switchMap(suppliers => {
                if (!suppliers || suppliers.length <= 0) {
                    return this.fetch();
                } else {
                    return of(suppliers);
                }
            }),
            switchMap(suppliers => {
                const updatedSupplierIndex = suppliers.findIndex(supplier => supplier.id === id);
                updatedSuppliers = [...suppliers];
                const oldSupplier = updatedSuppliers[updatedSupplierIndex];

                updatedSuppliers[updatedSupplierIndex] = new Supplier(
                    oldSupplier.id,
                    name,
                    headquarters,
                    oldSupplier.createdAt,
                    new Date(),
                    oldSupplier.deletedAt
                );
                return this.http.put(
                    `http://api.test/api/suppliers/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`,
                    {...updatedSuppliers[updatedSupplierIndex], id: null}
                );
            }),
            tap(resData => {
                this._suppliers.next(updatedSuppliers);
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
                        `http://api.test/api/suppliers/${id}?api_token=e7A2uYBS89H4r0MoAi51YRkkfMC0O399YbA3Qhoc3oz9YtR6xw`
                    );
                }),
                switchMap(() => {
                    return this.suppliers;
                }),
                take(1),
                tap(suppliers => {
                    this._suppliers.next(suppliers.filter(supplier => supplier.id !== id));
                })
            );
    }
}
