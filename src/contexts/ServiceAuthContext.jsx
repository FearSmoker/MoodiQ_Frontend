import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ServiceAuthContext = createContext();

export const useServiceAuth = () => {
  const context = useContext(ServiceAuthContext);
  if (!context) {
    throw new Error('useServiceAuth must be used within ServiceAuthProvider');
  }
  return context;
};

export const ServiceAuthProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [linkedServices, setLinkedServices] = useState({
    youtube: false,
    apple: false,
  });
  const [loading, setLoading] = useState(false);

  // Check linked services when user changes
  useEffect(() => {
    if (user) {
      checkLinkedServices();
    }
  }, [user]);

  // Check which services are linked
  const checkLinkedServices = () => {
    if (user?.authTokens) {
      const youtubeLinked = user.authTokens.has ? user.authTokens.has('youtube') : false;
      const appleLinked = user.authTokens.has ? user.authTokens.has('apple') : false;
      
      setLinkedServices({
        youtube: youtubeLinked,
        apple: appleLinked,
      });
    }
  };

  // Link YouTube Music
  const linkYouTube = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      toast.error('API URL not configured');
      return;
    }

    // Store current URL to return after auth
    sessionStorage.setItem('preAuthUrl', window.location.pathname);
    
    // Redirect to YouTube auth endpoint
    window.location.href = `${apiUrl}/auth/youtube/auth`;
  };

  // Link Apple Music
  const linkAppleMusic = async (musicUserToken) => {
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/apple/token', {
        musicUserToken,
      });

      await refreshUser();
      
      setLinkedServices(prev => ({ ...prev, apple: true }));
      toast.success('Apple Music account linked successfully!');
      
      return data;
    } catch (error) {
      console.error('Failed to link Apple Music:', error);
      toast.error(error.response?.data?.message || 'Failed to link Apple Music');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Unlink service
  const unlinkService = async (service) => {
    if (!['youtube', 'apple'].includes(service)) {
      toast.error('Invalid service');
      return;
    }

    setLoading(true);

    try {
      await api.delete(`/auth/${service}/unlink`);
      await refreshUser();
      
      setLinkedServices(prev => ({ ...prev, [service]: false }));
      toast.success(`${service === 'youtube' ? 'YouTube' : 'Apple'} Music account unlinked`);
    } catch (error) {
      console.error(`Failed to unlink ${service}:`, error);
      toast.error(`Failed to unlink ${service}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if service is linked
  const isServiceLinked = (service) => {
    return linkedServices[service] || false;
  };

  // Get all linked services
  const getLinkedServices = () => {
    return Object.entries(linkedServices)
      .filter(([_, isLinked]) => isLinked)
      .map(([service]) => service);
  };

  const value = {
    linkedServices,
    loading,
    linkYouTube,
    linkAppleMusic,
    unlinkService,
    isServiceLinked,
    getLinkedServices,
    checkLinkedServices,
  };

  return (
    <ServiceAuthContext.Provider value={value}>
      {children}
    </ServiceAuthContext.Provider>
  );
};