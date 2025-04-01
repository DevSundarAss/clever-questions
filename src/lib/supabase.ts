import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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

// Function to ensure we have a valid session
export const ensureSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Function to upload file with proper authentication
export const uploadFile = async (file: File, fileName: string) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  // Upload the file directly
  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error details:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('submissions')
    .getPublicUrl(fileName);

  return {
    path: fileName,
    url: urlData.publicUrl
  };
};

// Function to create a submission
export const createSubmission = async (submission: any) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert([{ ...submission, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Submission error:', error);
    throw new Error(`Submission failed: ${error.message}`);
  }

  return data;
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

