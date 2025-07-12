import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'sonner';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const isValid = await authService.verifyToken();
          setIsAuthenticated(isValid);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const requireAuth = (redirectTo = '/login') => {
    if (!isAuthenticated && !isLoading) {
      toast.info('Please log in to access detection features', {
        description: 'You need to be logged in to use our AI-powered crop disease detection.',
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      navigate(redirectTo);
      return false;
    }
    return true;
  };

  const handleDetectionClick = () => {
    if (requireAuth()) {
      navigate('/upload');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    requireAuth,
    handleDetectionClick
  };
}; 