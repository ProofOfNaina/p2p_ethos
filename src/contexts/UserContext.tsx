import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserProfile, SocialConnection, DealAgreement, Order } from '@/types';
import { ethosAPI, getTrustTier, getMaxConcurrentDeals } from '@/lib/ethos-api';

interface UserContextType {
  user: UserProfile | null;
  isConnecting: boolean;
  isLoading: boolean;
  connectSocial: (platform: 'twitter' | 'discord', username: string, userId?: string) => Promise<void>;
  disconnectSocial: (platform: 'twitter' | 'discord') => void;
  refreshEthosScore: () => Promise<void>;
  hasRequiredConnection: boolean;
  canAccessP2P: boolean;
  trustTier: ReturnType<typeof getTrustTier> | null;
  maxConcurrentDeals: number;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  activeDeals: DealAgreement[];
  setActiveDeals: React.Dispatch<React.SetStateAction<DealAgreement[]>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeDeals, setActiveDeals] = useState<DealAgreement[]>([]);

  const connectSocial = useCallback(async (platform: 'twitter' | 'discord', username: string, userId?: string) => {
    setIsConnecting(true);
    try {
      const userkey = ethosAPI.createUserkey({ platform, username });
      const score = await ethosAPI.fetchScoreByUserkey(userkey);
      
      const newConnection: SocialConnection = {
        platform,
        username: username.replace('@', ''),
        userId,
        verified: true,
        connectedAt: new Date()
      };

      setUser(prev => {
        if (prev) {
          const existingSocials = prev.socials.filter(s => s.platform !== platform);
          return {
            ...prev,
            ethosScore: score,
            socials: [...existingSocials, newConnection]
          };
        }
        return {
          id: `user_${Date.now()}`,
          ethosScore: score,
          socials: [newConnection],
          totalDeals: 0,
          activeDeals: 0,
          completedDeals: [],
          createdAt: new Date()
        };
      });
    } catch (error) {
      console.error('Failed to connect social:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectSocial = useCallback((platform: 'twitter' | 'discord') => {
    setUser(prev => {
      if (!prev) return null;
      const newSocials = prev.socials.filter(s => s.platform !== platform);
      if (newSocials.length === 0) return null;
      return { ...prev, socials: newSocials };
    });
  }, []);

  const refreshEthosScore = useCallback(async () => {
    if (!user || user.socials.length === 0) return;
    
    setIsLoading(true);
    try {
      const primary = user.socials[0];
      const userkey = ethosAPI.createUserkey({ 
        platform: primary.platform, 
        username: primary.username 
      });
      const score = await ethosAPI.fetchScoreByUserkey(userkey);
      setUser(prev => prev ? { ...prev, ethosScore: score } : null);
    } catch (error) {
      console.error('Failed to refresh score:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const hasRequiredConnection = user !== null && user.socials.length > 0;
  const canAccessP2P = hasRequiredConnection && user.ethosScore >= 1400;
  const trustTier = user ? getTrustTier(user.ethosScore) : null;
  const maxConcurrentDeals = user ? getMaxConcurrentDeals(user.ethosScore) : 0;

  return (
    <UserContext.Provider value={{
      user,
      isConnecting,
      isLoading,
      connectSocial,
      disconnectSocial,
      refreshEthosScore,
      hasRequiredConnection,
      canAccessP2P,
      trustTier,
      maxConcurrentDeals,
      orders,
      setOrders,
      activeDeals,
      setActiveDeals
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
