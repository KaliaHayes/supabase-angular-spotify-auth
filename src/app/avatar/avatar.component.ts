import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  effect,
} from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SupabaseService } from '../services/supabase.service';
import { JsonPipe, NgIf, NgStyle } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf, JsonPipe, NgStyle],
  template: `
    <div
      *ngIf="supabase.$profile().avatar_url; else noImage"
      class="avatar"
      [ngStyle]="{
        'background-image': 'url(' + supabase.$profile().avatar_url + ')'
      }"
    ></div>
    <ng-template #noImage>
      <div class="avatar no-image"></div>
    </ng-template>
  `,
})
export class AvatarComponent {
  uploading = false;

  constructor(
    public readonly supabase: SupabaseService,
    private readonly dom: DomSanitizer
  ) {}
}
