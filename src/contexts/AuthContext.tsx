import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useAuth hook'u - named export olarak tanımlandı
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profil yüklenirken hata:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          // Oturum yoksa profili null olarak ayarla
          setProfile(null);
        }
      } catch (error) {
        console.error('Oturum alınırken hata:', error);
        // Hata durumunda kullanıcı ve profili null olarak ayarla
        setUser(null);
        setProfile(null);
      } finally {
        // Her durumda loading'i false yap
        setLoading(false);
      }
    };

    // Timeout ekleyerek oturum kontrolünün takılı kalmasını önle
    const timeoutId = setTimeout(() => {
      setLoading(false); // 5 saniye içinde yanıt gelmezse loading'i kapat
    }, 5000);

    getSession().finally(() => clearTimeout(timeoutId));
    

    // Auth durumu değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Auth durumu değişikliği işlenirken hata:', error);
          // Hata durumunda kullanıcı ve profili null olarak ayarla
          setUser(null);
          setProfile(null);
        } finally {
          // Her durumda loading'i false yap
          setLoading(false);
        }
      }
    );

    // Komponent unmount olduğunda subscription'ı temizle

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};