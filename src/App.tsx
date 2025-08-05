import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { PWAIconManager } from "@/components/PWAIconManager";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
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
import Admin from "./pages/Admin";
import GizlilikPolitikasi from "./pages/GizlilikPolitikasi";
import KullanimSartlari from "./pages/KullanimSartlari";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAIconManager />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kumlamalar" element={<Kumlamalar />} />
          <Route path="/arac-giydirme" element={<AracGiydirme />} />
          <Route path="/tabelalar" element={<Tabelalar />} />
          <Route path="/referanslar" element={<Referanslar />} />
          <Route path="/video-galeri" element={<VideoGaleri />} />
          {/* Servis Bedeli sayfası sadece admin panelinde erişilebilir */}
          <Route path="/hesaplama" element={<Hesaplama />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
          <Route path="/kullanim-sartlari" element={<KullanimSartlari />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
