import { useState } from 'react';
import { signUp, confirmSignUp, signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'confirm'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // SIGNUP
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: { email: email }
        }
      });
      setMode('confirm');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // CONFIRM OTP CODE (email se aaya hua code)
  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmCode
      });
      setMode('login');
      setError('Account verified! Ab login karo.');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ username: email, password: password });
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const token = session.tokens.idToken.toString();
      onLoginSuccess(user.username, token);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>CloudTrack {mode === 'signup' ? 'Sign Up' : mode === 'confirm' ? 'Verify Email' : 'Login'}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mode === 'login' && (
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ marginTop: '10px' }}>
            Account nahi hai? <button type="button" onClick={() => setMode('signup')}>Sign Up</button>
          </p>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignUp}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <p style={{ marginTop: '10px' }}>
            Already account hai? <button type="button" onClick={() => setMode('login')}>Login</button>
          </p>
        </form>
      )}

      {mode === 'confirm' && (
        <form onSubmit={handleConfirm}>
          <p>Email pe code bheja hai, woh daalo:</p>
          <input type="text" placeholder="Verification Code" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Auth;