import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute bileşeni türleri
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Korumalı route bileşeni
 * Kullanıcının oturum durumunu kontrol eder ve gerektiğinde yönlendirir
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // Yükleme durumunda loading göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Oturum gerekli ama kullanıcı giriş yapmamış
  if (requireAuth && (!user || !session)) {
    console.log('Korumalı sayfaya erişim reddedildi, auth sayfasına yönlendiriliyor...');
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Oturum var ama auth sayfasına gitmeye çalışıyor
  if (!requireAuth && user && session && location.pathname === '/auth') {
    console.log('Giriş yapmış kullanıcı auth sayfasından admin paneline yönlendiriliyor...');
    return <Navigate to="/admin" replace />;
  }

  // Her şey yolunda, children'ı render et
  return <>{children}</>;
};

export default ProtectedRoute;