import { useState, useEffect } from 'react';
import Auth from './Auth.jsx';
import Dashboard from './Dashboard.jsx';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // App load hote waqt check karo agar already login hai
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      setUser(currentUser.username);
      setToken(idToken);
    } catch (err) {
      // User login nahi hai, koi baat nahi
    }
    setCheckingAuth(false);
  };

  const handleLoginSuccess = (username, idToken) => {
    setUser(username);
    setToken(idToken);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setToken(null);
  };

  if (checkingAuth) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  }

  return (
    <div>
      {user ? (
        <Dashboard userId={user} token={token} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;