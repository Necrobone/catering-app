import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-employee',
    templateUrl: './employee.page.html',
    styleUrls: ['./employee.page.scss'],
})
export class EmployeePage implements OnInit {

    constructor(private authService: AuthService) {
    }

    ngOnInit() {
    }
}
