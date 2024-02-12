// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabaseUrl: '<your_supabase_project_url>', // https://examplesupabaseurl.supabase.co
  supabaseKey: '<your_supabase_api_key>',
  supabaseSessionItem: 'sb-<your_supabase_reference_id>-auth-token', // sb-examplesupabaseurl-auth-token
};
