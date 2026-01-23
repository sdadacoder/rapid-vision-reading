'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, User, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  if (!user) return null;

  const userImage = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="glass rounded-xl px-3 py-2 h-auto flex items-center gap-2 hover:bg-white/10 transition-colors"
      >
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-8 h-8 rounded-full ring-2 ring-purple-500/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
          {userName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-white/10 mb-2">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
