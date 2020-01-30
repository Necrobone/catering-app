import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ComponentModule } from '../../../component/component.module';

import { AddPageRoutingModule } from './add-routing.module';

import { AddPage } from './add.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddPageRoutingModule,
        ReactiveFormsModule,
        ComponentModule
    ],
  declarations: [AddPage]
})
export class AddPageModule {}
