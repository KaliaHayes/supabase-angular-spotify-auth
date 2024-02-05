import { Component, Input, OnInit, effect } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthSession } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { JsonPipe } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AvatarComponent, JsonPipe],
  template: `
    <form
      [formGroup]="updateProfileForm"
      (ngSubmit)="updateProfile()"
      class="form-widget"
    >
      <app-avatar [avatarUrl]="this.avatarUrl" (upload)="updateAvatar($event)">
      </app-avatar>

      <div>
        <label for="email">Email</label>
        <input id="email" type="text" [value]="session.user.email" disabled />
      </div>
      <div>
        <label for="username">Name</label>
        <input formControlName="username" id="username" type="text" />
      </div>
      <div>
        <label for="website">Website</label>
        <input formControlName="website" id="website" type="url" />
      </div>

      <div>
        <button type="submit" class="button primary block" [disabled]="loading">
          {{ loading ? 'Loading ...' : 'Update' }}
        </button>
      </div>

      <div>
        <button class="button block" (click)="signOut()">Sign Out</button>
      </div>
    </form>

    {{ supabase.$profile() | json }}
  `,
})
export class AccountComponent {
  loading = false;

  @Input()
  session: AuthSession | any;

  updateProfileForm = this.formBuilder.group({
    username: '',
    website: '',
    avatar_url: '',
  });

  patchProfileForm = effect(() => {
    if (this.supabase.$profile()) {
      const { username, website, avatar_url } = this.supabase.$profile();

      this.updateProfileForm.patchValue({
        username,
        website,
        avatar_url,
      });
    }
  });

  constructor(
    public readonly supabase: SupabaseService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {}

  updateProfile(): void {
    this.loading = true;
    const { user } = this.session;

    const username = this.updateProfileForm.value.username as string;
    const website = this.updateProfileForm.value.website as string;
    const avatar_url = this.updateProfileForm.value.avatar_url as string;

    const profile: Profile = {
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    };

    this.supabase.updateProfile(profile).subscribe({
      error: (error) => {
        if (error instanceof Error) {
          alert(error.message);
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  updateAvatar(event: string): void {
    this.updateProfileForm.patchValue({
      avatar_url: event,
    });
    this.updateProfile();
  }

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
    return this.updateProfileForm.value.avatar_url as string;
  }
}
