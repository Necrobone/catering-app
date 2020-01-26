import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from './location.model';
import { of } from "rxjs";

@Component({
    selector: 'app-location-picker',
    templateUrl: './location-picker.component.html',
    styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
    selectedLocationImage: string;
    isLoading = false;

    constructor(private modalController: ModalController, private http: HttpClient) {
    }

    ngOnInit() {
    }

    onPickLocation() {
        this.modalController.create({component: MapModalComponent}).then(modal => {
            modal.onDidDismiss().then(coordinates => {
                if (!coordinates.data) {
                    return;
                }
                const pickedLocation: PlaceLocation = {
                    lat: coordinates.data.lat,
                    lng: coordinates.data.lng,
                    address: null,
                    staticMapImageUrl: null,
                };
                this.isLoading = true;
                return this.getAddress(coordinates.data.lat, coordinates.data.lng).pipe(
                    switchMap(address => {
                        pickedLocation.address = address;

                        return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
                    })
                ).subscribe(staticMapImageUrl => {
                    pickedLocation.staticMapImageUrl = staticMapImageUrl;
                    this.selectedLocationImage = staticMapImageUrl;
                    this.isLoading = false;
                });
            });
            modal.present();
        });
    }

    private getAddress(lat: number, lng: number) {
        return this.http.get<any>(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
        ).pipe(map(geoData => {
            if (!geoData || !geoData.results || geoData.results.length === 0) {
                return null;
            }
            return geoData.results[0].formatted_address;
        }));
    }

    private getMapImage(lat: number, lng: number, zoom: number) {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
        &markers=color:red%7Clabel:Place%7C${lat},${lng}
        &key=${environment.googleMapsAPIKey}`;
    }
}
