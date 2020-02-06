import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ComponentModule } from "../../../component/component.module";

import { EditPageRoutingModule } from './edit-routing.module';

import { EditPage } from './edit.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        EditPageRoutingModule,
        ReactiveFormsModule,
        ComponentModule
    ],
    declarations: [EditPage]
})
export class EditPageModule {
}
