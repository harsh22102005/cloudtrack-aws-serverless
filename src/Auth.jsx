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

  // CONFIRM OTP CODE
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
      setError('');
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

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#0A0E1F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      color: '#F4F6FA'
    },
    shell: {
      display: 'flex',
      width: '920px',
      maxWidth: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #262F52',
      boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
      flexWrap: 'wrap'
    },
    side: {
      flex: '1 1 320px',
      background:
        'radial-gradient(circle at 30% 20%, rgba(155,107,255,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(77,127,255,0.3), transparent 50%), linear-gradient(160deg,#0d1230,#171033 70%)',
      padding: '48px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '20px', fontFamily: "'Space Grotesk', sans-serif" },
    dot: { width: '9px', height: '9px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 12px #34D399' },
    heading: { fontSize: '28px', lineHeight: 1.25, margin: '36px 0 12px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" },
    accent: { color: '#4D7FFF' },
    para: { color: '#8A93B8', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '340px' },
    illustrationWrap: { position: 'relative', height: '150px', margin: '28px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cloudGlow: {
      width: '110px',
      height: '110px',
      borderRadius: '46% 54% 60% 40%/55% 45% 55% 45%',
      background: 'linear-gradient(135deg,#4D7FFF,#9B6BFF)',
      boxShadow: '0 0 60px 10px rgba(155,107,255,0.45), 0 0 110px 30px rgba(77,127,255,0.25)',
      position: 'relative'
    },
    cloudInner: {
      position: 'absolute',
      inset: '6px',
      borderRadius: '46% 54% 60% 40%/55% 45% 55% 45%',
      background: '#0A0E1F',
      opacity: 0.92
    },
    arrow: { position: 'absolute', color: '#F4F6FA', fontSize: '28px', fontWeight: 700 },
    featureRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '16px' },
    featureIcon: {
      width: '30px', height: '30px', borderRadius: '8px',
      background: 'rgba(77,127,255,0.15)', border: '1px solid rgba(77,127,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0
    },
    featureT: { fontSize: '13.5px', fontWeight: 600 },
    featureD: { fontSize: '12px', color: '#8A93B8', marginTop: '2px' },
    footNote: { fontSize: '11.5px', color: '#8A93B8', marginTop: '24px' },
    form: { flex: '0 0 380px', background: '#141B33', padding: '48px 40px', display: 'flex', flexDirection: 'column' },
    topLink: { alignSelf: 'flex-end', fontSize: '13px', color: '#8A93B8', marginBottom: '26px', background: 'none', border: 'none', cursor: 'pointer' },
    topLinkAccent: { color: '#4D7FFF', fontWeight: 600 },
    h2: { fontSize: '24px', marginBottom: '6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
    sub: { color: '#8A93B8', fontSize: '13.5px', marginBottom: '26px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#8A93B8', marginBottom: '7px', letterSpacing: '0.02em', textTransform: 'uppercase' },
    field: { marginBottom: '18px' },
    input: {
      width: '100%', background: '#1B2444', border: '1px solid #262F52',
      borderRadius: '10px', padding: '12px 14px', color: '#F4F6FA', fontSize: '14px',
      fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box'
    },
    btn: {
      width: '100%', border: 'none', borderRadius: '10px', padding: '13px 0',
      background: 'linear-gradient(135deg,#4D7FFF,#9B6BFF)', color: 'white',
      fontWeight: 600, fontSize: '14.5px', cursor: 'pointer', marginTop: '6px',
      boxShadow: '0 8px 24px -6px rgba(77,127,255,0.5)'
    },
    switch: { textAlign: 'center', fontSize: '13px', color: '#8A93B8', marginTop: '20px' },
    switchBtn: { color: '#4D7FFF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 },
    err: {
      background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)',
      color: '#FCA5A5', fontSize: '12.5px', padding: '10px 12px', borderRadius: '8px', marginBottom: '18px'
    },
    success: {
      background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)',
      color: '#6EE7B7', fontSize: '12.5px', padding: '10px 12px', borderRadius: '8px', marginBottom: '18px'
    }
  };

  const headingCopy = {
    login: { h1: <>Track tasks.<br />Tame <span style={styles.accent}>expenses.</span></>, p: 'Your tasks, expenses, and receipts — synced to the cloud and backed by a serverless AWS pipeline.' },
    signup: { h1: <>One account.<br />Every <span style={styles.accent}>task tracked.</span></>, p: 'Sign up in seconds — a verification code lands in your inbox via Amazon SNS.' },
    confirm: { h1: <>Almost <span style={styles.accent}>there.</span></>, p: 'Enter the verification code we just emailed you to activate your account.' }
  };

  const copy = headingCopy[mode];

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
      <div style={styles.shell}>
        <div style={styles.side}>
          <div style={styles.brand}><span style={styles.dot}></span>CloudTrack</div>
          <div>
            <h1 style={styles.heading}>{copy.h1}</h1>
            <p style={styles.para}>{copy.p}</p>
            <div style={styles.illustrationWrap}>
              <div style={styles.cloudGlow}>
                <div style={styles.cloudInner}></div>
              </div>
              <div style={styles.arrow}>&uarr;</div>
            </div>
            <div style={styles.featureRow}>
              <div style={styles.featureIcon}>&#9889;</div>
              <div>
                <div style={styles.featureT}>Instant sync</div>
                <div style={styles.featureD}>Every change lands in DynamoDB in real time</div>
              </div>
            </div>
            <div style={styles.featureRow}>
              <div style={styles.featureIcon}>&#128274;</div>
              <div>
                <div style={styles.featureT}>Secured by Cognito</div>
                <div style={styles.featureD}>JWT-authenticated, scoped to you alone</div>
              </div>
            </div>
          </div>
          <div style={styles.footNote}>&copy; 2026 CloudTrack &mdash; built on AWS serverless</div>
        </div>

        <div style={styles.form}>
          {mode === 'login' && (
            <>
              <button style={styles.topLink} onClick={() => { setMode('signup'); setError(''); }}>
                No account? <span style={styles.topLinkAccent}>Sign up</span>
              </button>
              <h2 style={styles.h2}>Welcome back</h2>
              <div style={styles.sub}>Sign in to pick up where you left off.</div>
              {error && <div style={styles.err}>{error}</div>}
              <form onSubmit={handleLogin}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button style={styles.btn} type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              <div style={styles.switch}>
                New here? <button style={styles.switchBtn} onClick={() => { setMode('signup'); setError(''); }}>Create an account</button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <button style={styles.topLink} onClick={() => { setMode('login'); setError(''); }}>
                Have an account? <span style={styles.topLinkAccent}>Log in</span>
              </button>
              <h2 style={styles.h2}>Create your account</h2>
              <div style={styles.sub}>Start tracking in under a minute.</div>
              {error && <div style={styles.err}>{error}</div>}
              <form onSubmit={handleSignUp}>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <input style={styles.input} type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button style={styles.btn} type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
              <div style={styles.switch}>
                Already have an account? <button style={styles.switchBtn} onClick={() => { setMode('login'); setError(''); }}>Log in</button>
              </div>
            </>
          )}

          {mode === 'confirm' && (
            <>
              <h2 style={styles.h2}>Verify your email</h2>
              <div style={styles.sub}>We sent a code to <strong>{email}</strong></div>
              {error && <div style={styles.err}>{error}</div>}
              <form onSubmit={handleConfirm}>
                <div style={styles.field}>
                  <label style={styles.label}>Verification code</label>
                  <input style={styles.input} type="text" placeholder="123456" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} required />
                </div>
                <button style={styles.btn} type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify and continue'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;