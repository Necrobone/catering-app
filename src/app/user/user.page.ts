import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';

@Component({
    selector: 'app-user',
    templateUrl: './user.page.html',
    styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
    user: User;

    constructor(private authService: AuthService) {
    }

    ngOnInit() {
        this.user = this.authService.user;
    }

}
