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

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    <div class="row flex-center flex">
      <div class="col-6 form-widget" aria-live="polite">
        <h1 class="header">Supabase + Angular</h1>
        <p class="description">Sign in via magic link with your email below</p>
        <form
          [formGroup]="signInForm"
          (ngSubmit)="onSubmit()"
          class="form-widget"
        >
          <div>
            <label for="email">Email</label>
            <input
              id="email"
              formControlName="email"
              class="inputField"
              type="email"
              placeholder="Your email"
            />
          </div>
          <div>
            <button type="submit" class="button block" [disabled]="loading">
              {{ loading ? 'Loading' : 'Send magic link' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AuthComponent {
  loading = false;
  private readonly supabase: SupabaseService = inject(SupabaseService);

  signInForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  onSubmit(): void {
    this.loading = true;
    const email = this.signInForm.controls.email.value || '';

    const signIn$ = from(this.supabase.signIn(email));

    signIn$.subscribe({
      next: ({ error }) => {
        if (error) throw error;
        alert('Check your email for the login link!');
      },
      error: (error) => {
        if (error instanceof Error) {
          alert(error.message);
        }
        this.signInForm.reset();
        this.loading = false;
      },
      complete: () => {
        this.signInForm.reset();
        this.loading = false;
      },
    });
  }
}
