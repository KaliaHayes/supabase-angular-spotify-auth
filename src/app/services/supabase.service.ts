import { Injectable, computed, effect, signal, inject } from '@angular/core';
import {
  AuthSession,
  createClient,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import {
  BehaviorSubject,
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Profile {
  id?: string;
  spotify_id?: string;
  name?: string;
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
  premium?: boolean;
  country?: string;
  email?: string;
}

interface SpotifyProfile {
  display_name: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  type: string;
  uri: string;
  followers: {
    href: null;
    total: number;
  };
  country: string;
  product: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  route = inject(ActivatedRoute);
  http = inject(HttpClient);

  private sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  session$ = this.sessionSubject.asObservable();
  $session = toSignal(this.session$, { initialValue: null }); //

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  $user = toSignal(this.user$, { initialValue: null });

  $profile = signal<Profile>({});
  $errorDescription = signal<string>('');
  $showEmailVerificationMessage = signal<boolean>(false);

  currentUser: string = '';
  isGettingProviderToken: boolean = false;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.onAuthStateChange();

    this.route.queryParams.subscribe((params) => {
      const errorDescription = params['error_description'];

      if (errorDescription && errorDescription.includes('spotify')) {
        this.$errorDescription.set(errorDescription);
        this.$showEmailVerificationMessage.set(true);
      }
    });
  }

  signInWithSpotify(): Observable<any> {
    // if (this.isGettingProviderToken) this.isGettingProviderToken = false;
    // console.log('this.isGettingProviderToken: ', this.isGettingProviderToken);

    return from(
      this.supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          scopes:
            'user-read-currently-playing, user-read-recently-played, user-read-playback-state, user-top-read, user-modify-playback-state, user-library-read, user-library-modify, user-read-private, playlist-read-private, playlist-read-collaborative, playlist-modify-public, playlist-modify-private, user-read-email, user-follow-read',
        },
      })
    );
  }

  onAuthStateChange() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('event: ', event);
      console.log('session: ', session);
      this.sessionSubject.next(session);

      if (session) {
        if (
          event === 'SIGNED_IN' ||
          event == 'TOKEN_REFRESHED' ||
          event === 'INITIAL_SESSION'
        ) {
          if (!session.provider_token) {
            this.isGettingProviderToken = true;
            this.signInWithSpotify().subscribe();
          } else {
            if (!this.currentUser) {
              this.currentUser = session.user?.id ?? '';

              this.getUser();
            }
          }

          this.$showEmailVerificationMessage.set(false);
        }

        if (event === 'TOKEN_REFRESHED') {
          this.supabase.auth.refreshSession();
          this.getUser();
        }

        if (event === 'USER_UPDATED') {
          this.currentUser = session.user?.id ?? '';
          this.getUser();
        }
      } else {
        this.sessionSubject.next(null);
      }
    });
  }

  getUser() {
    this.supabase.auth.getUser().then(({ data, error }) => {
      this.userSubject.next(data?.user ?? null);
      if (data?.user) {
        console.log('data?.user: ', data?.user);
        this.getProfile(data.user).subscribe();
      }
    });
  }

  getProfile(user: User): Observable<any> {
    return from(
      this.supabase.from('profiles').select().eq('id', user.id).single()
    ).pipe(
      tap(({ data, error }) => {
        if (error) throw error;
        this.$profile.set(data);
      }),
      switchMap(({ data }) => {
        let profile = data as Profile;
        const spotifyId = profile?.spotify_id;

        if (spotifyId) {
          return this.http
            .get(`https://api.spotify.com/v1/me`, {
              headers: {
                Authorization: `Bearer ${this.$session()?.provider_token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
            .pipe(
              map((response) => response as SpotifyProfile),
              switchMap((spotifyProfile: SpotifyProfile) => {
                console.log('Spotify profile: ', spotifyProfile);
                if (profile.premium === null || profile.country === null) {
                  profile.premium = spotifyProfile.product === 'premium';
                  profile.country = spotifyProfile.country;

                  if (
                    spotifyProfile.images &&
                    spotifyProfile.images.length >= 2
                  ) {
                    profile.avatar_url =
                      spotifyProfile.images[1]?.url || profile.avatar_url;
                  }

                  return this.updateProfile(profile).pipe(
                    tap(({ error }) => {
                      if (error) throw error;
                    })
                  );
                }
                return of(spotifyProfile);
              })
            );
        }

        return of(profile);
      })
    );
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

  signOut(): Observable<any> {
    return from(this.supabase.auth.signOut());
  }
}
