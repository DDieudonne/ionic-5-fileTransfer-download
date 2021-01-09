import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { AlertController, Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private androidPermissions: AndroidPermissions,
    private openNativeSettings: OpenNativeSettings,
    private alertController: AlertController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private transfer: FileTransfer,
    private platform: Platform,
    private file: File,
  ) { }

  public download(type: string): void {

    //  ANY FILE (image, video, image, pdf, docx...) WORK!
    // NIMPORTE QUEL FICHIER SERA ENREGISTRé (image, video, image, pdf, docx...)

    let url: string;
    // ex: url = "http://res.cloudinary.com/dtj7y1r0l/video/upload/v1458851262/msgSound_x2laav.mp3";

    //  docName the name of the file in which the file is saved
    let docName: string;

    // RANDOM NAME 
    let nameFile: string;

    // TYPE
    let typeFile: string;


    // TYPE
    switch (type) {
      case 'audio':
        nameFile = 'audio_' + new Date().getTime();
        url = "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3";
        docName = 'audios';
        typeFile = 'mp3';
        this.nextDetectDevice(url, typeFile, nameFile, docName);
        break;
      case 'video':
        nameFile = 'video_' + new Date().getTime();
        url = "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0b/Big_buck_bunny_low_angle_shot.ogv/Big_buck_bunny_low_angle_shot.ogv.480p.vp9.webm";
        docName = 'videos';
        typeFile = 'mp4';
        this.nextDetectDevice(url, typeFile, nameFile, docName);
        break;
      case 'image':
        nameFile = 'image_' + new Date().getTime();
        url = "https://images.unsplash.com/photo-1526498460520-4c246339dccb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80*";
        docName = 'images';
        typeFile = 'jpg';
        this.nextDetectDevice(url, typeFile, nameFile, docName);
        break;
      case 'file':
        nameFile = 'file_' + new Date().getTime();
        url = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
        const part = url.split('/').pop();
        const type = part.split('.').pop();
        docName = 'files';
        // (ex : pdf, docx, svg, any type file....)
        typeFile = type;
        this.nextDetectDevice(url, typeFile, nameFile, docName);
        break;
    }

  }

  private nextDetectDevice(url, typeFile, nameFile, docName): void {
    const safeUrlString: any = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // ANDROID
    if (this.platform.is('android')) {
      this.checkPermissionBefore().then((permission) => {
        switch (permission.hasPermission) {
          case true:
            this.save(safeUrlString.changingThisBreaksApplicationSecurity, typeFile, nameFile, docName);
            break;
          case false:
            this.requestPermissionsSetting();
            break;
        }
      }).catch()
      // SAVE IN 
    }
  }

  private save(url, type: string, name: string, doc: string): Promise<void> {
    return new Promise(() => {
      const path = this.file.externalRootDirectory + '/MyAppName/' + doc + '/' + name + '.' + type;
      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.download(
        url, this.file.externalRootDirectory + '/MyAppName/' + doc + '/' + name + '.' + type).then(() =>
          this.rootFileSaved(path), () => alert('OOPS ERROR!!!'));
    });
  }

  async fileDwonloaded(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Fichier enregistré!',
      duration: 2000,
      buttons: ['Fermer']
    });
    return toast.present();
  }

  async rootFileSaved(path): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Chemin / Path',
      message: 'CHEMIN / PATH: ' + path,
      buttons: ['Fermer']
    });
    await alert.present();
    await alert.onDidDismiss().then(() => this.fileDwonloaded());
  }

  private checkPermissionBefore(): Promise<any> {
    return this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    ]);
  }

  private async requestPermissionsSetting(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Paramètres application / Settings application',
      message: 'Verifier dans les configurations!',
      buttons: [
        {
          text: 'Verifier / Check settings',
          handler: () => {
            this.openNativeSettings.open('application_details')
              .then((state) => { })
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

}
