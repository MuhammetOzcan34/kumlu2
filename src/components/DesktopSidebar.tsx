import { Home, Palette, FileText, Play, Calculator, Users, Phone, Car, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useSetting } from "@/hooks/useSettings";

const sidebarItems = [
  { icon: Home, label: "Anasayfa", href: "/" },
  { icon: Palette, label: "Cam Kumlama", href: "/kumlamalar" },
  { icon: Car, label: "Araç Giydirme", href: "/arac-giydirme" },
  { icon: FileText, label: "Tabelalar", href: "/tabelalar" },
  { icon: Play, label: "Video Galeri", href: "/video-galeri" },
  
  { icon: Calculator, label: "Hesaplama", href: "/hesaplama" },
  { icon: Users, label: "Referanslar", href: "/referanslar" },
  { icon: Phone, label: "İletişim", href: "/iletisim" },
];

export const DesktopSidebar = () => {
  const location = useLocation();
  const firmaAdi = useSetting('firma_adi') || 'Kumlama Web';
  const firmaLogo = useSetting('firma_logo_url');

  console.log('🔍 DesktopSidebar - firmaLogo:', firmaLogo);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex-col z-40">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {firmaLogo && firmaLogo.trim() && (
            <img 
              src={firmaLogo.startsWith('http') 
                ? firmaLogo 
                : `https://kepfuptrmccexgyzhcti.supabase.co/storage/v1/object/public/fotograflar/${firmaLogo}`
              }
              alt="Logo" 
              className="h-8 w-8 object-contain"
              onError={(e) => {
                console.error('Sidebar logo hatası:', firmaLogo);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            {firmaAdi}
          </h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Admin Panel and Theme Toggle */}
      <div className="mt-auto p-4 border-t border-border space-y-3">
        <Link
          to="/admin"
          className={cn(
            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full",
            location.pathname === "/admin"
              ? "bg-primary text-primary-foreground shadow-md"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Yönetim Paneli</span>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
};