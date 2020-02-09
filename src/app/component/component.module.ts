import { NgModule } from '@angular/core';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MapModalComponent } from './map-modal/map-modal.component';
import { LocationDisplayComponent } from './location-display/location-display.component';

@NgModule({
    declarations: [ImagePickerComponent, MapModalComponent, LocationDisplayComponent],
    imports: [CommonModule, IonicModule],
    exports: [ImagePickerComponent, MapModalComponent, LocationDisplayComponent],
    entryComponents: [ImagePickerComponent, MapModalComponent]
})
export class ComponentModule {

}
