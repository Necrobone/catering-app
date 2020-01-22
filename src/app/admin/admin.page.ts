import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

    constructor(private menuController: MenuController) {
    }

    ngOnInit() {
    }

    openMenu(menu) {
        switch (menu) {
            case 'adminMenu':
                this.menuController.enable(true, 'adminMenu');
                this.menuController.enable(false, 'employeeMenu');
                break;
            case 'employeeMenu':
                this.menuController.enable(false, 'adminMenu');
                this.menuController.enable(true, 'employeeMenu');
                break;
        }
        this.menuController.toggle();
    }

}
