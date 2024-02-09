import { Component, Input, OnInit, effect } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthSession } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { JsonPipe, NgIf } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AvatarComponent, JsonPipe, NgIf],
  template: `
    <div style="width: 50vw">
      <form [formGroup]="profileForm" class="form-widget">
        <app-avatar> </app-avatar>
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
  loading = false;

  @Input()
  session: AuthSession | any;

  profileForm = this.formBuilder.group({
    name: '',
    avatar_url: '',
  });

  patchProfileForm = effect(() => {
    if (this.supabase.$profile()) {
      const { name, avatar_url } = this.supabase.$profile();

      this.profileForm.patchValue({
        name,
        avatar_url,
      });
    }
  });

  constructor(
    public readonly supabase: SupabaseService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {}

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

  get avatarUrl() {
    return this.profileForm.value.avatar_url as string;
  }
}
