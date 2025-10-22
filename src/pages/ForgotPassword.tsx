/**
 * Forgot Password Page
 * Password reset request page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                We'll send you an email with instructions to reset your password
              </CardDescription>
            </CardHeader>

            {success ? (
              <CardContent className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset email sent! Please check your inbox and follow the
                    instructions to reset your password.
                  </AlertDescription>
                </Alert>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="text-accent"
                  >
                    try again
                  </Button>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="pl-10"
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full btn-gold" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <Link 
                    to="/login" 
                    className="text-sm text-muted-foreground hover:text-accent flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

