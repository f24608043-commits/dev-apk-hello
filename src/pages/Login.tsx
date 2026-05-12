import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  if (user) {
    if (isAdmin) navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        navigate('/', { replace: true });
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profile?.role === 'admin') navigate('/admin', { replace: true });
        else navigate('/', { replace: true });
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="display-heading mb-8 text-2xl">{isSignUp ? 'CREATE_ACCOUNT' : 'LOGIN'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="label-text mb-1 block">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-2 border-border bg-background p-2 font-mono text-sm outline-none focus:border-foreground"
                required
              />
            </div>
          )}
          <div>
            <label className="label-text mb-1 block">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-border bg-background p-2 font-mono text-sm outline-none focus:border-foreground"
              required
            />
          </div>
          <div>
            <label className="label-text mb-1 block">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-border bg-background p-2 font-mono text-sm outline-none focus:border-foreground"
              required
              minLength={6}
            />
          </div>

          {error && <p className="font-mono text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE_ACCOUNT' : 'LOGIN'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="mt-4 w-full text-center font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          {isSignUp ? 'ALREADY HAVE AN ACCOUNT? LOGIN' : 'NO ACCOUNT? CREATE ONE'}
        </button>

        <Link to="/" className="mt-4 block text-center font-mono text-xs text-muted-foreground hover:text-foreground">
          ← BACK TO STORE
        </Link>
      </div>
    </div>
  );
}
