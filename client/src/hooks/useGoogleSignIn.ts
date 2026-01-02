import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { apiClient } from '@/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleSignIn = () => {
  const { setToken } = useAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = useCallback(
    async (credentialResponse: any, role: 'admin' | 'lecturer') => {
      try {
        const token = credentialResponse.credential;

        // Send token to backend for verification and user creation
        const response = await apiClient.post('/auth/google/signin', {
          token,
          role,
        });

        if (response.access_token && response.user) {
          // Store token and user
          await setToken(response.access_token, response.user);
          toast({
            title: 'Success',
            description: `Welcome, ${response.user.name}!`,
          });
          return response.user;
        } else {
          throw new Error('No token received from server');
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        toast({
          title: 'Sign-In Failed',
          description: err.message || 'Failed to sign in with Google',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [setToken, toast]
  );

  const initializeGoogleSignIn = useCallback((buttonId: string, role: 'admin' | 'lecturer') => {
    if (!window.google) {
      console.error('Google SDK not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
      callback: (credentialResponse: any) => {
        handleGoogleSignIn(credentialResponse, role);
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById(buttonId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      }
    );
  }, [handleGoogleSignIn]);

  return { initializeGoogleSignIn, handleGoogleSignIn };
};
