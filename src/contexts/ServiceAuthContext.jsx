import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/client';
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

  // check linked services when user changes
  useEffect(() => {
    if (user) {
      console.log('🔍 ServiceAuth: Checking linked services for user:', user.displayName);
      checkLinkedServices();
    }
  }, [user]);

  // check which services are linked
  const checkLinkedServices = () => {
    if (!user) {
      console.log('⚠️ ServiceAuth: No user, cannot check services');
      return;
    }

    console.log('📋 ServiceAuth: User auth tokens:', user.authTokens);
    
    // check if authTokens exists and has services
    let youtubeLinked = false;
    let appleLinked = false;

    if (user.authTokens) {
      // authTokens might be an object or Map
      if (user.authTokens instanceof Map) {
        youtubeLinked = user.authTokens.has('youtube');
        appleLinked = user.authTokens.has('apple');
      } else if (typeof user.authTokens === 'object') {
        youtubeLinked = !!user.authTokens.youtube;
        appleLinked = !!user.authTokens.apple;
      }
    }

    console.log('✅ ServiceAuth: Services status:', {
      youtube: youtubeLinked,
      apple: appleLinked
    });
    
    setLinkedServices({
      youtube: youtubeLinked,
      apple: appleLinked,
    });
  };

  // link YouTube Music
  const linkYouTube = () => {
    console.log('🔗 ServiceAuth: Initiating YouTube link...');
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.error('❌ ServiceAuth: API URL not configured');
      toast.error('API URL not configured', { id: 'youtube-link-error' });
      return;
    }

    // store current URL to return after auth
    sessionStorage.setItem('preAuthUrl', window.location.pathname);
    console.log('💾 ServiceAuth: Stored pre-auth URL:', window.location.pathname);
    
    // redirect to YouTube auth endpoint
    const authUrl = `${apiUrl}/auth/youtube/auth`;
    console.log('🔄 ServiceAuth: Redirecting to:', authUrl);
    window.location.href = authUrl;
  };

  // link Apple Music
  const linkAppleMusic = async (musicUserToken) => {
    console.log('🔗 ServiceAuth: Linking Apple Music...');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/apple/token', {
        musicUserToken,
      });

      console.log('✅ ServiceAuth: Apple Music linked successfully');
      await refreshUser();
      
      setLinkedServices(prev => ({ ...prev, apple: true }));
      toast.success('Apple Music account linked successfully!', { id: 'apple-link-success' });
      
      return data;
    } catch (error) {
      console.error('❌ ServiceAuth: Failed to link Apple Music:', error);
      toast.error(error.response?.data?.message || 'Failed to link Apple Music', { 
        id: 'apple-link-error' 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // unlink service
  const unlinkService = async (service) => {
    if (!['youtube', 'apple'].includes(service)) {
      console.error('❌ ServiceAuth: Invalid service:', service);
      toast.error('Invalid service', { id: 'unlink-error' });
      return;
    }

    console.log('🔓 ServiceAuth: Unlinking service:', service);
    setLoading(true);

    try {
      await api.delete(`/auth/${service}/unlink`);
      console.log('✅ ServiceAuth: Service unlinked successfully');
      
      await refreshUser();
      
      setLinkedServices(prev => ({ ...prev, [service]: false }));
      
      const serviceName = service === 'youtube' ? 'YouTube' : 'Apple';
      toast.success(`${serviceName} Music account unlinked`, { 
        id: `${service}-unlink-success` 
      });
    } catch (error) {
      console.error(`❌ ServiceAuth: Failed to unlink ${service}:`, error);
      toast.error(`Failed to unlink ${service}`, { 
        id: `${service}-unlink-error` 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // check if service is linked
  const isServiceLinked = (service) => {
    const linked = linkedServices[service] || false;
    console.log(`🔍 ServiceAuth: Is ${service} linked?`, linked);
    return linked;
  };

  // get all linked services
  const getLinkedServices = () => {
    const services = Object.entries(linkedServices)
      .filter(([_, isLinked]) => isLinked)
      .map(([service]) => service);
    
    console.log('📋 ServiceAuth: Linked services:', services);
    return services;
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