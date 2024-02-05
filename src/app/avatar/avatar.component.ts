import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SupabaseService } from '../services/supabase.service';
import { NgIf } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf],
  template: `
    <div>
      <img
        *ngIf="_avatarUrl"
        [src]="_avatarUrl"
        alt="Avatar"
        class="avatar image"
        style="height: 150px; width: 150px"
      />
    </div>
    <div
      *ngIf="!_avatarUrl"
      class="avatar no-image"
      style="height: 150px; width: 150px"
    ></div>
    <div style="width: 150px">
      <label class="button primary block" for="single">
        {{ uploading ? 'Uploading ...' : 'Upload' }}
      </label>
      <input
        style="visibility: hidden; position: absolute"
        type="file"
        id="single"
        accept="image/*"
        (change)="uploadAvatar($event)"
        [disabled]="uploading"
      />
    </div>
  `,
})
export class AvatarComponent {
  _avatarUrl: SafeResourceUrl | undefined;
  uploading = false;

  @Input()
  set avatarUrl(url: string | null) {
    if (url) {
      this.downloadImage(url);
    }
  }

  @Output() upload = new EventEmitter<string>();

  constructor(
    private readonly supabase: SupabaseService,
    private readonly dom: DomSanitizer
  ) {}

  downloadImage(path: string): void {
    const downloadImage$ = from(this.supabase.downLoadImage(path));

    downloadImage$.subscribe({
      next: ({ data }) => {
        if (data instanceof Blob) {
          this._avatarUrl = this.dom.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(data)
          );
        }
      },
      error: (error) => {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message);
        }
      },
    });
  }

  uploadAvatar(event: any): void {
    this.uploading = true;

    if (!event.target.files || event.target.files.length === 0) {
      alert('You must select an image to upload.');
      this.uploading = false;
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random()}.${fileExt}`;

    const uploadAvatar$ = from(this.supabase.uploadAvatar(filePath, file));

    uploadAvatar$.subscribe({
      next: () => {
        this.upload.emit(filePath);
      },
      error: (error) => {
        if (error instanceof Error) {
          alert(error.message);
        }
        this.uploading = false;
      },
      complete: () => {
        this.uploading = false;
      },
    });
  }
}
