import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { PWAIconManager } from "@/components/PWAIconManager";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { lazy, Suspense } from 'react';
import Index from "./pages/Index";

// Lazy load büyük ve az kullanılan sayfalar - performans optimizasyonu
const Kumlamalar = lazy(() => import('./pages/Kumlamalar'));
const AracGiydirme = lazy(() => import('./pages/AracGiydirme'));
const Tabelalar = lazy(() => import('./pages/Tabelalar'));
const Referanslar = lazy(() => import('./pages/Referanslar'));
const VideoGaleri = lazy(() => import('./pages/VideoGaleri'));
const ServisBedelleri = lazy(() => import('./pages/ServisBedelleri'));
const Hesaplama = lazy(() => import('./pages/Hesaplama'));
const Iletisim = lazy(() => import('./pages/Iletisim'));
const Auth = lazy(() => import('./pages/Auth'));
const Admin = lazy(() => import('./pages/Admin'));
const GizlilikPolitikasi = lazy(() => import('./pages/GizlilikPolitikasi'));
const KullanimSartlari = lazy(() => import('./pages/KullanimSartlari'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Gelişmiş loading bileşeni
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground animate-pulse">Yükleniyor...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      gcTime: 1000 * 60 * 10, // 10 dakika
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
      // Ağ durumuna göre otomatik yeniden deneme
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAIconManager />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/kumlamalar" element={<Kumlamalar />} />
              <Route path="/arac-giydirme" element={<AracGiydirme />} />
              <Route path="/tabelalar" element={<Tabelalar />} />
              <Route path="/referanslar" element={<Referanslar />} />
              <Route path="/video-galeri" element={<VideoGaleri />} />
              <Route path="/servis-bedelleri" element={<ServisBedelleri />} />
              <Route path="/hesaplama" element={<Hesaplama />} />
              <Route path="/iletisim" element={<Iletisim />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
              <Route path="/kullanim-sartlari" element={<KullanimSartlari />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <WhatsAppWidget />
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;