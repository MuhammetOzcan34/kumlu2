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
import Kumlamalar from "./pages/Kumlamalar";
import AracGiydirme from "./pages/AracGiydirme";
import Tabelalar from "./pages/Tabelalar";
import Referanslar from "./pages/Referanslar";
import VideoGaleri from "./pages/VideoGaleri";
import ServisBedelleri from "./pages/ServisBedelleri";
import Hesaplama from "./pages/Hesaplama";
import Iletisim from "./pages/Iletisim";
import Auth from "./pages/Auth";
import GizlilikPolitikasi from "./pages/GizlilikPolitikasi";
import KullanimSartlari from "./pages/KullanimSartlari";
import NotFound from "./pages/NotFound";

// Lazy load büyük componentler
const Admin = lazy(() => import('./pages/Admin'));

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