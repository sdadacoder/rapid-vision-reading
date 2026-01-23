'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, BarChart3, Calendar } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="glass-card rounded-3xl p-8 space-y-8">
          {/* Logo and title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg animate-pulse-glow">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">
              Productivity Tracker
            </h1>
            <p className="text-muted-foreground">
              Track your time, boost your productivity
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-3 text-center space-y-2">
              <Calendar className="w-5 h-5 mx-auto text-purple-400" />
              <p className="text-xs text-muted-foreground">Schedule</p>
            </div>
            <div className="glass rounded-xl p-3 text-center space-y-2">
              <Sparkles className="w-5 h-5 mx-auto text-pink-400" />
              <p className="text-xs text-muted-foreground">Track</p>
            </div>
            <div className="glass rounded-xl p-3 text-center space-y-2">
              <BarChart3 className="w-5 h-5 mx-auto text-blue-400" />
              <p className="text-xs text-muted-foreground">Analyze</p>
            </div>
          </div>

          {/* Sign in button */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 glass-button text-white font-medium rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>

            {error && (
              <div className="glass rounded-xl p-3 border border-red-500/30">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
