import { Component, inject } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AccountComponent, AuthComponent, NgIf],
  template: `
    <div class="container">
      <app-account
        *ngIf="
          supabase.$session() && supabase.$session()?.provider_token;
          else auth
        "
      ></app-account>
      <ng-template #auth>
        <app-auth></app-auth>
      </ng-template>
    </div>
  `,
})
export class AppComponent {
  public readonly supabase: SupabaseService = inject(SupabaseService);

  title = 'supabase-auth';
}
