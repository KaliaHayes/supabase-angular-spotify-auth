import { Injectable, computed, effect, signal } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { profile } from 'console';

export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  private sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  session$ = this.sessionSubject.asObservable();
  $session = toSignal(this.session$, { initialValue: null }); //

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  $user = toSignal(this.user$, { initialValue: null });

  $profile = signal<any>('');

  test = effect(() => {
    // console.log(this.$session());
    // console.log(this.$user());
  });

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.getUser();
  }

  getUser() {
    this.supabase.auth.getUser().then(({ data, error }) => {
      this.userSubject.next(data?.user ?? null);
      if (data?.user) {
        this.getProfile(data.user);
      }
      console.log('data: ', data);

      this.supabase.auth.onAuthStateChange((event, session) => {
        this.sessionSubject.next(session ?? null);
      });
    });
  }

  getProfile(user: User): Observable<any> {
    const getProfilePromise = this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        this.$profile.set(data);
        return data;
      });

    return from(getProfilePromise);
  }

  signIn(email: string): Observable<any> {
    return from(this.supabase.auth.signInWithOtp({ email }));
  }

  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut());
  }

  updateProfile(profile: Profile): Observable<any> {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    const updateProfilePromise = this.supabase
      .from('profiles')
      .upsert(update)
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });

    return from(updateProfilePromise);
  }

  downLoadImage(path: string): Observable<any> {
    return from(this.supabase.storage.from('avatars').download(path));
  }

  uploadAvatar(filePath: string, file: File): Observable<any> {
    return from(this.supabase.storage.from('avatars').upload(filePath, file));
  }
}
