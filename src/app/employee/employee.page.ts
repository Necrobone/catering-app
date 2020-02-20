import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
    selector: 'app-employee',
    templateUrl: './employee.page.html',
    styleUrls: ['./employee.page.scss'],
})
export class EmployeePage implements OnInit {
    user: User;

    constructor(private authService: AuthService) {
    }

    ngOnInit() {
        this.user = this.authService.user;
    }
}
