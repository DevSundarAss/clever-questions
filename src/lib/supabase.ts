
import { createClient } from '@supabase/supabase-js';

// These values would typically come from environment variables
// For now, we'll use placeholders that users will replace with their own values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize the Supabase client with URL validation
const createSupabaseClient = () => {
  try {
    // Validate the URL before creating the client
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    // Return a mock client that doesn't make actual API calls
    // This prevents runtime errors while allowing the app to load
    return {
      from: () => ({
        select: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
        insert: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
        update: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
        delete: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
        eq: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
      }),
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: { message: 'Supabase configuration error' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      functions: {
        setAuth: () => {},
      },
    };
  }
};

// Initialize the Supabase client
export const supabase = createSupabaseClient();

// Helper function to get the current user from localStorage
export const getCurrentUser = () => {
  const userString = localStorage.getItem('aceInApril_user');
  if (!userString) return null;
  
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Add custom header with user ID for RLS policies
export const addUserToRequest = () => {
  const user = getCurrentUser();
  if (user && user.id) {
    supabase.functions.setAuth(user.id);
  }
};

// Call this function to set up the custom header
addUserToRequest();

