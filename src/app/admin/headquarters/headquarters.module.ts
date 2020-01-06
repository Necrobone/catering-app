import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HeadquartersPageRoutingModule } from './headquarters-routing.module';

import { HeadquartersPage } from './headquarters.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeadquartersPageRoutingModule
  ],
  declarations: [HeadquartersPage]
})
export class HeadquartersPageModule {}
