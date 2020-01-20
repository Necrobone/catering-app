import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CameraResultType, CameraSource, Capacitor, Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-image-picker',
    templateUrl: './image-picker.component.html',
    styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
    @ViewChild('filePicker', {read: undefined, static: false}) filePicker: ElementRef<HTMLInputElement>;
    @Output() imagePick = new EventEmitter<string | File>();
    @Input() showPreview = false;
    @Input() selectedImage: string;
    usePicker = false;

    constructor(private platform: Platform) {
    }

    ngOnInit() {
        console.log('Mobile:', this.platform.is('mobile'));
        console.log('Hybrid:', this.platform.is('hybrid'));
        console.log('iOs:', this.platform.is('ios'));
        console.log('Android:', this.platform.is('android'));
        console.log('Desktop:', this.platform.is('desktop'));

        if ((this.platform.is('mobile') && !this.platform.is('hybrid'))
            || this.platform.is('desktop')
        ) {
            this.usePicker = true;
        }
    }

    onPickImage() {
        if (!Capacitor.isPluginAvailable('Camera')) {
            this.filePicker.nativeElement.click();
            return;
        }
        Plugins.Camera.getPhoto({
            quality: 50,
            source: CameraSource.Prompt,
            correctOrientation: true,
            width: 600,
            resultType: CameraResultType.Base64
        }).then(image => {
            this.selectedImage = image.base64String;
            this.imagePick.emit(image.base64String);
        }).catch(error => {
            console.log(error);
            if (this.usePicker) {
                this.filePicker.nativeElement.click();
            }
            return false;
        });
    }

    onFileChosen(event: Event) {
        const pickedFile = (event.target as HTMLInputElement).files[0];
        if (!pickedFile) {
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            this.selectedImage = fileReader.result.toString();
            this.imagePick.emit(fileReader.result.toString());
        };

        fileReader.readAsDataURL(pickedFile);
    }
}
