/**
 * Email Confirmation Page
 * Handles email verification callback from Supabase
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the hash from URL (Supabase sends #access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Email confirmation:', { type, hasAccessToken: !!accessToken });

        // If this is an email confirmation
        if (type === 'signup' || type === 'email' || accessToken) {
          // Set the session with the tokens
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error);
              setStatus('error');
              setMessage('Failed to verify email. Please try logging in.');
            } else {
              setStatus('success');
              setMessage('Email verified successfully! Redirecting...');
              
              // Redirect to login after 2 seconds
              setTimeout(() => {
                navigate('/login', {
                  state: {
                    message: 'Email verified! Please log in to continue.'
                  }
                });
              }, 2000);
            }
          } else {
            // No tokens, but email might already be verified
            setStatus('success');
            setMessage('Email verification complete! You can now log in.');
          }
        } else {
          // No confirmation params found
          setStatus('error');
          setMessage('No verification token found. The link may have expired.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {status === 'verifying' && (
                  <Loader2 className="h-16 w-16 animate-spin text-accent mx-auto" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                )}
                {status === 'error' && (
                  <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                )}
              </div>
              
              <CardTitle className="text-2xl">
                {status === 'verifying' && 'Verifying Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </CardTitle>
              
              <CardDescription className="text-base mt-4">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {status === 'success' && (
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Your email has been successfully verified. You can now access all features of JAANU BOUTIQUE.
                  </p>
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full btn-gold"
                  >
                    Continue to Login
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Don't worry! Your email might already be verified. Try logging in to your account.
                  </p>
                  <div className="grid gap-2">
                    <Button 
                      onClick={() => navigate('/login')} 
                      className="w-full btn-gold"
                    >
                      Go to Login
                    </Button>
                    <Button 
                      onClick={() => navigate('/signup')} 
                      variant="outline"
                      className="w-full"
                    >
                      Create New Account
                    </Button>
                  </div>
                </div>
              )}

              {status === 'verifying' && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Please wait while we verify your email address...</p>
                  <p className="mt-2">This should only take a moment.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmailConfirmation;

