import { NgModule } from '@angular/core';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';

@NgModule({
    declarations: [ImagePickerComponent, LocationPickerComponent, MapModalComponent],
    imports: [CommonModule, IonicModule],
    exports: [ImagePickerComponent, LocationPickerComponent, MapModalComponent],
    entryComponents: [ImagePickerComponent, MapModalComponent]
})
export class ComponentModule {

}
