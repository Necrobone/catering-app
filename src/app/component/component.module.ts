import { NgModule } from '@angular/core';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { LocationDisplayComponent } from './location-display/location-display.component';

@NgModule({
    declarations: [ImagePickerComponent, LocationPickerComponent, MapModalComponent, LocationDisplayComponent],
    imports: [CommonModule, IonicModule],
    exports: [ImagePickerComponent, LocationPickerComponent, MapModalComponent, LocationDisplayComponent],
    entryComponents: [ImagePickerComponent, MapModalComponent]
})
export class ComponentModule {

}
