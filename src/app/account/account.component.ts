import { Component, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { NgIf, NgStyle } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [NgIf, NgStyle],
  template: `
    <div style="width: 50vw">
      <form class="form-widget">
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
        <div>
          <label for="email">Name</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().name"
            disabled
          />
        </div>

        <div>
          <label for="email">Email</label>
          <input
            id="email"
            type="text"
            [value]="supabase.$profile().email"
            disabled
          />
        </div>

        <div>
          <label for="email">Spotify ID</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().spotify_id"
            disabled
          />
        </div>

        <div>
          <label for="email">Name</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().name"
            disabled
          />
        </div>

        <div>
          <label for="email">Premium?</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().premium"
            disabled
          />
        </div>

        <div>
          <label for="email">Country</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().country"
            disabled
          />
        </div>

        <div>
          <label for="email">Created At</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().created_at"
            disabled
          />
        </div>

        <div>
          <label for="email">Updated At</label>
          <input
            id="name"
            type="text"
            [value]="supabase.$profile().updated_at"
            disabled
          />
        </div>

        <div>
          <button class="button block" (click)="signOut()">Sign Out</button>
        </div>
      </form>
    </div>
  `,
})
export class AccountComponent {
  public readonly supabase: SupabaseService = inject(SupabaseService);

  signOut(): void {
    const signOut$ = from(this.supabase.signOut());

    signOut$.subscribe({
      error: (error) => {
        if (error instanceof Error) {
          alert(error.message);
        }
      },
    });
  }
}
