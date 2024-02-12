import { Injectable, effect, signal, inject } from '@angular/core';
import {
  AuthSession,
  createClient,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import {
  BehaviorSubject,
  catchError,
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

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  private sessionSubject = new BehaviorSubject<AuthSession | null>(null);
  session$ = this.sessionSubject.asObservable();
  $session = toSignal(this.session$, { initialValue: null });

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  $user = toSignal(this.user$, { initialValue: null });

  $profile = signal<UserProfile>({});
  $currentUser = signal<string>('');
  $showEmailVerificationMessage = signal<boolean>(false);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.route.queryParams.subscribe(({ error_description }) => {
      console.log('error_description: ', error_description);
      if (error_description && error_description.includes('spotify')) {
        this.$showEmailVerificationMessage.set(true);
      }
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('event: ', event);
      console.log('session: ', session);
      this.sessionSubject.next(session);

      if (!session) {
        this.sessionSubject.next(null);
        return;
      }

      // Handle sign-in and initial session events
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (!session.provider_token) {
          this.signInWithSpotify().subscribe();
        } else if (!this.$currentUser()) {
          this.$currentUser.set(session.user?.id ?? '');
          this.getUser();
        }

        this.$showEmailVerificationMessage.set(false);
      }

      // Handle token refreshed event
      if (event === 'TOKEN_REFRESHED') {
        this.supabase.auth.refreshSession();
        this.getUser();
      }

      // Handle user updated event
      if (event === 'USER_UPDATED') {
        this.$currentUser.set(session.user?.id ?? '');
        this.getUser();
      }
    });
  }

  signInWithSpotify(): Observable<any> {
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

  getUser() {
    this.supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error getting user', error);
          return;
        }

        const { user } = data ?? {};
        this.userSubject.next(user ?? null);

        if (user) {
          console.log('user: ', user);
          this.getProfile(user).subscribe();
        }
      })
      .catch((error) => {
        console.error('Error getting user', error);
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
        let profile = data as UserProfile;
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
              catchError((err) => {
                console.error('Error getting Spotify profile', err);
                return of({});
              }),
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

  updateProfile(profile: UserProfile): Observable<any> {
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
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        window.localStorage.removeItem(environment.supabaseAuthToken);
      }),
      catchError((error) => {
        console.error('Error during sign out:', error);
        throw error;
      })
    );
  }
}

export interface UserProfile {
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

export interface SpotifyProfile {
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
