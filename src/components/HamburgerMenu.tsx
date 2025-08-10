import { useState } from "react";
import { Menu, X, Home, Palette, FileText, Play, Calculator, Users, Phone, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: Home, label: "Anasayfa", href: "/" },
  { icon: Palette, label: "Cam Kumlama", href: "/kumlamalar" },
  { icon: FileText, label: "Tabelalar", href: "/tabelalar" },
  { icon: Play, label: "Video Galeri", href: "/video-galeri" },
  { icon: Calculator, label: "Hesaplama", href: "/hesaplama" },
  { icon: Users, label: "Referanslar", href: "/referanslar" },
  { icon: Phone, label: "İletişim", href: "/iletisim" },
];

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings, isLoading } = useSettings();

  // Supabase storage URL'sini dinamik olarak al
  const getStorageUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kepfuptrmccexgyzhcti.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/fotograflar/`;
  };

  // Ayarlar yüklenene kadar basit header göster
  if (isLoading || !settings) {
    return (
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-sm z-40 lg:hidden border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <Button variant="ghost" size="icon" className="bg-card/80 backdrop-blur-sm">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
            <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const firmaAdi = settings.firma_adi || 'Kumlama Web';
  const firmaLogo = settings.firma_logo_url;

  console.log('🔍 HamburgerMenu - firmaLogo:', firmaLogo);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-sm z-40 lg:hidden border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-card/80 backdrop-blur-sm"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      {firmaLogo && firmaLogo.trim() && (
                        <img 
                          src={firmaLogo.startsWith('http') 
                            ? firmaLogo 
                            : `${getStorageUrl()}${firmaLogo}`
                          }
                          alt="Logo" 
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            console.error('❌ Mobil menu logo hatası:', firmaLogo);
                            console.error('❌ Storage URL:', getStorageUrl());
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <h2 className="text-lg font-semibold">{firmaAdi}</h2>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                   </nav>
                  <div className="p-4 border-t border-border space-y-2">
                    {/* Yönetim Paneli Butonu */}
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors border border-dashed border-primary/50"
                    >
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Yönetim Paneli</span>
                    </Link>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {firmaLogo && firmaLogo.trim() && (
                <img 
                  src={firmaLogo.startsWith('http') 
                    ? firmaLogo 
                    : `https://kepfuptrmccexgyzhcti.supabase.co/storage/v1/object/public/fotograflar/${firmaLogo}`
                  }
                  alt="Logo" 
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    console.error('Header logo hatası:', firmaLogo);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h1 className="text-lg font-semibold text-primary">{firmaAdi}</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};