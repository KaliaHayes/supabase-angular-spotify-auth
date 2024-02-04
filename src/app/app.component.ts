import { Component } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AccountComponent, AuthComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'supabase-auth';

  session: any = this.supabase.session;

  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
