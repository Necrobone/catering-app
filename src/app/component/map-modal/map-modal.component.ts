import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-map-modal',
    templateUrl: './map-modal.component.html',
    styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('map', {static: false}) mapElementRef: ElementRef;
    clickListener: any;
    googleMaps: any;

    constructor(private modalController: ModalController, private renderer: Renderer2) {
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.getGoogleMaps().then(googleMaps => {
            this.googleMaps = googleMaps;
            const mapElement = this.mapElementRef.nativeElement;
            const map = new googleMaps.Map(mapElement, {
                center: {lat: -34.397, lng: 150.644},
                zoom: 16,
            });

            this.googleMaps.event.addListenerOnce(map, 'idle', () => {
                this.renderer.addClass(mapElement, 'visible');
            });

            this.clickListener = map.addListener('click', event => {
                const coordinates = {lat: event.latLng.lat(), lng: event.latLng.lng()};
                this.modalController.dismiss(coordinates);
            });
        }).catch(err => {
            console.log(err);
        });
    }

    onCancel() {
        this.modalController.dismiss();
    }

    ngOnDestroy(): void {
        if (this.clickListener) {
            this.googleMaps.event.removeListener(this.clickListener);
        }
    }

    private getGoogleMaps(): Promise<any> {
        const win = window as any;
        const googleModule = win.google;
        if (googleModule && googleModule.maps) {
            return Promise.resolve(googleModule.maps);
        }

        return new Promise<any>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsAPIKey;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            script.onload = () => {
                const loadedGoogleModule = win.google;
                if (loadedGoogleModule && loadedGoogleModule.maps) {
                    resolve(loadedGoogleModule.maps);
                } else {
                    reject('Google maps SDK not available.');
                }
            };
        });
    }
}
