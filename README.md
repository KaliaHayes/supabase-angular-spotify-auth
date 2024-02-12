# SupabaseAuth

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Adding your Supabase URL and Key

Update the `environment.ts` file with your Supabase URL and Key:

```typescript
export const environment = {
  production: false,
  supabaseUrl: '<your_supabase_project_url>', // https://examplesupabaseurl.supabase.co
  supabaseKey: '<your_supabase_api_key>',
  supabaseAuthToken: 'sb-<your_supabase_reference_id>-auth-token', // sb-examplesupabaseurl-auth-token
};
```
