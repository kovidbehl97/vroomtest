// File: app/_components/GoogleSignInButton.tsx
'use client';

import { signIn } from 'next-auth/react'; // Import signIn


interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
  onSuccess?: () => void; // Optional success callback
  loading?: boolean; // Optional prop to control loading state from parent
}

const GoogleSignInButton = ({ onError, onSuccess, loading }: GoogleSignInButtonProps  ) => {
  // Use internal loading state if not controlled by parent

  const handleGoogleLogin = async () => {
    loading = true// Set loading state if provided by parent

    try {
      // --- CORRECTED: CALL next-auth's signIn function ---
      console.log('Initiating Google sign in via NextAuth...');
      const result = await signIn('google', {
        // Configure the redirect URL after successful Google sign-in
        // It's common to redirect back to the homepage after login
        callbackUrl: '/',
        // Add other options like 'redirect: false' if you want to handle redirection manually
        // redirect: false
      });

      // next-auth's signIn handles redirects automatically by default when redirect: true
      // If redirect: false, 'result' will contain error info on failure
      if (result?.error) {
         console.error('Google signIn returned an error:', result.error);
         if (onError) {
             // You might want to map next-auth errors to user-friendly messages
             onError('Failed to sign in with Google: ' + result.error);
         }
      } else {
        console.log('Google signIn initiated successfully (check browser redirect)');
        // If redirect: false, you would call onSuccess and handle routing here
        if (onSuccess && result?.ok) { // Check result.ok if redirect: false
           onSuccess();
           loading = false; // Reset loading state
        }
      }


    } catch (err: any) {
      // This catch is more for errors *during the signIn call itself*, not login failure
      console.error('Unexpected error during Google signIn call:', err);
      if (onError) {
        // General error message
        onError('An unexpected error occurred during Google sign in.');
      }
    } 
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading} // Use isLoading derived from internal or parent state
      style={{
        cursor: loading ? 'not-allowed' : 'pointer',
        border: 'none', // Added border-radius// Added font-weight
        display: 'flex', // Added flex// Added justify-content
        gap: '0.5rem', // Added gap between icon/text if you add an icon
      }}
      className=" bg-[#f2f2f2]  mt-5 text-white w-full flex items-center justify-between shadow-md shadow-gray-200 border border-gray-200" // Added hover class
    >
      <div className='h-[47px] w-[47px] flex items-center bg-[#f2f2f2] justify-center'>
      <span className="h-[47px] w-[47px] bg-[url(/google-btn.png)] bg-contain bg-no-repeat bg-center"></span>
      </div>
      {/* Optional: Add a loading spinner or icon here */}
      <span className='flex w-full justify-center text-gray-600 mr-5 font-bold'>

      {loading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  );
};

export default GoogleSignInButton;