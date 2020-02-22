import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Employee } from './employee.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesService {
    private _employees = new BehaviorSubject<Employee[]>([]);

    get employees() {
        return this._employees.asObservable();
    }

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    fetch() {
        return this.http
            .get<{ [key: string]: Employee }>(
                `${environment.api}/api/employees?api_token=${this.authService.user.token}`
            )
            .pipe(
                map(employees => {
                    const hqs = [];
                    for (const key in employees) {
                        if (employees.hasOwnProperty(key)) {
                            hqs.push(new Employee(
                                +employees[key].id,
                                employees[key].firstName,
                                employees[key].lastName,
                                employees[key].email,
                                employees[key].password,
                                employees[key].apiToken,
                                employees[key].role
                            ));
                        }
                    }

                    return hqs;
                }),
                tap(employees => {
                    this._employees.next(employees);
                })
            );
    }

    getEmployee(id: number) {
        return this.http
            .get<Employee>(`${environment.api}/api/employees/${id}?api_token=${this.authService.user.token}`)
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

    add(firstName: string, lastName: string, email: string, password: string, role: number) {
        let generatedId: number;
        let newEmployee: Employee;
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId) {
                        throw new Error('No user found!');
                    }

                    newEmployee = new Employee(
                        Math.random(),
                        firstName,
                        lastName,
                        email,
                        password,
                        null,
                        role
                    );
                    return this.http.post<{ id: number }>(
                        `${environment.api}/api/employees?api_token=${this.authService.user.token}`,
                        {...newEmployee, id: null}
                    );
                }),
                switchMap(resData => {
                    generatedId = resData.id;
                    return this.employees;
                }),
                take(1),
                tap(employees => {
                    newEmployee.id = generatedId;
                    this._employees.next(employees.concat(newEmployee));
                })
            );
    }

    edit(id: number, firstName: string, lastName: string, email: string, password: string|null, role: number) {
        let updatedEmployees: Employee[];
        return this.employees.pipe(
            take(1),
            switchMap(employees => {
                if (!employees || employees.length <= 0) {
                    return this.fetch();
                } else {
                    return of(employees);
                }
            }),
            switchMap(employees => {
                const updatedEmployeeIndex = employees.findIndex(hq => hq.id === id);
                updatedEmployees = [...employees];
                const oldEmployee = updatedEmployees[updatedEmployeeIndex];

                updatedEmployees[updatedEmployeeIndex] = new Employee(
                    oldEmployee.id,
                    firstName,
                    lastName,
                    email,
                    password,
                    null,
                    role
                );
                return this.http.put(
                    `${environment.api}/api/employees/${id}?api_token=${this.authService.user.token}`,
                    {...updatedEmployees[updatedEmployeeIndex], id: null}
                );
            }),
            tap(resData => {
                this._employees.next(updatedEmployees);
            })
        );
    }

    delete(id: number) {
        return this.authService.userId
            .pipe(
                take(1),
                switchMap(userId => {
                    if (!userId || userId === id) {
                        throw new Error('No user found!');
                    }

                    return this.http.delete(
                        `${environment.api}/api/employees/${id}?api_token=${this.authService.user.token}`
                    );
                }),
                switchMap(() => {
                    return this.employees;
                }),
                take(1),
                tap(employees => {
                    this._employees.next(employees.filter(employee => employee.id !== id));
                })
            );
    }
}
