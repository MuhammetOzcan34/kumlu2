import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/auth" element={<ProtectedRoute requireAuth={false}><Auth /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAuth={true} requireRole="admin" redirectUnauthorized="/auth"><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;