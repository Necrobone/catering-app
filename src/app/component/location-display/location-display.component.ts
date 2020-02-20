import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { PlaceLocation } from './location.model';

@Component({
    selector: 'app-location-display',
    templateUrl: './location-display.component.html',
    styleUrls: ['./location-display.component.scss'],
})
export class LocationDisplayComponent implements OnInit {

    constructor(
        private modalController: ModalController,
        private http: HttpClient,
        private loadingController: LoadingController,
        private alertController: AlertController,
    ) {
    }

    @Output() locationPick = new EventEmitter<PlaceLocation>();
    @Input() center = 'C/ Acentejo 4, 28017, Madrid';
    @Input() zoom = 15;
    location = {lat: -34.397, lng: 150.644};
    selectedLocationImage: string;
    isLoading = false;

    private static getMapImage(address: string, zoom: number) {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${address}&zoom=${zoom}&size=500x300&maptype=roadmap
        &markers=color:red%7Clabel:Place%7C${address}
        &key=${environment.googleMapsAPIKey}`;
    }

    ngOnInit() {
        this.selectedLocationImage = LocationDisplayComponent.getMapImage(this.center, this.zoom);

        this.loadingController.create({
            message: 'Finding location...',
        }).then(loadingEl => {
            loadingEl.present();
            this.getLocation(this.center).subscribe(location => {
                loadingEl.dismiss();
                this.location = location;
            }, error => {
                loadingEl.dismiss();
                this.alertController.create({
                    header: 'An error ocurred!',
                    message: 'Location could not be found. Please try again later.',
                }).then(alertEl => {
                    alertEl.present();
                });
            });
        });
    }

    onClickLocation() {
        this.modalController.create({
            component: MapModalComponent,
            componentProps: {
                center: this.location,
                selectable: false,
                closeButtonText: 'Close',
                title: this.center,
            },
        }).then(modal => {
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

                this.loadingController.create({
                    message: 'Loading location...',
                }).then(loadingEl => {
                    loadingEl.present();
                    return this.getAddress(coordinates.data.lat, coordinates.data.lng).pipe(
                        switchMap(address => {
                            pickedLocation.address = address;

                            return of(LocationDisplayComponent.getMapImage(pickedLocation.address, 15));
                        }),
                    ).subscribe(staticMapImageUrl => {
                        loadingEl.dismiss();
                        pickedLocation.staticMapImageUrl = staticMapImageUrl;
                        this.selectedLocationImage = staticMapImageUrl;
                        this.isLoading = false;
                        this.locationPick.emit(pickedLocation);
                    }, error => {
                        loadingEl.dismiss();
                        this.alertController.create({
                            header: 'An error ocurred!',
                            message: 'Location could not be load. Please try again later.',
                        }).then(alertEl => {
                            alertEl.present();
                        });
                    });
                });
            });
            modal.present();
        });
    }

    private getAddress(lat: number, lng: number) {
        return this.http.get<any>(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`,
        ).pipe(map(geoData => {
            if (!geoData || !geoData.results || geoData.results.length === 0) {
                return null;
            }
            return geoData.results[0].formatted_address;
        }));
    }

    private getLocation(address: string) {
        return this.http.get<any>(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${environment.googleMapsAPIKey}`,
        ).pipe(map(geoData => {
            if (!geoData || !geoData.results || geoData.results.length === 0) {
                return null;
            }
            return geoData.results[0].geometry.location;
        }));
    }
}
