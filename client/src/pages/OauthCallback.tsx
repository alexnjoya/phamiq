import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OauthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/upload'); // or wherever you want to redirect after login
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [navigate]);

  return <div className="flex items-center justify-center min-h-screen text-lg">Logging you in...</div>;
};

export default OauthCallback; 