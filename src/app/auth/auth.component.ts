import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { from } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  template: `
    <div class="row flex-center flex">
      <div class="col-6 form-widget" aria-live="polite">
        <h1 class="header">Supabase + Angular + Spotify</h1>
        <p class="description">
          Welcome to my introduction to Spotify OAuth with Supabase & Angular!
          Sign in with Spotify to get started ⚡
        </p>
        <div>
          <button class="button green block" (click)="signInWithSpotify()">
            Sign In With Spotify
          </button>
          <p *ngIf="supabase.$showEmailVerificationMessage()" class="confirmation">
            A confirmation email has been sent to your Spotify email! Please
            click the link in the email to verify your email address.
          </p>
        </div>
        <p>Made by Kalia Hayes</p>
      </div>
    </div>
  `,
})
export class AuthComponent {
  loading = false;
  public readonly supabase: SupabaseService = inject(SupabaseService);

  signInWithSpotify(): void {
    this.supabase.signInWithSpotify();
  }
}
