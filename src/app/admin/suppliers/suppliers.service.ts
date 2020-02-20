import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
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
                `${environment.api}/api/suppliers?api_token=${this.authService.user.token}`
            )
            .pipe(
                map(suppliers => {
                    const places = [];
                    for (const key in suppliers) {
                        if (suppliers.hasOwnProperty(key)) {
                            places.push(new Supplier(
                                +suppliers[key].id,
                                suppliers[key].name,
                                suppliers[key].headquarters
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
            .get<Supplier>(`${environment.api}/api/suppliers/${id}?api_token=${this.authService.user.token}`)
            .pipe(map(supplier => {
                return new Supplier(
                    id,
                    supplier.name,
                    supplier.headquarters
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
                        headquarters
                    );
                    return this.http.post<{ id: number }>(
                        `${environment.api}/api/suppliers?api_token=${this.authService.user.token}`,
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
                    headquarters
                );
                return this.http.put(
                    `${environment.api}/api/suppliers/${id}?api_token=${this.authService.user.token}`,
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
                        `${environment.api}/api/suppliers/${id}?api_token=${this.authService.user.token}`
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
