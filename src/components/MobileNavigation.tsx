import { Home, Palette, FileText, Menu, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigationItems = [
  { icon: Palette, label: "Kumlama", href: "/kumlamalar" },
  { icon: FileText, label: "Tabela", href: "/tabelalar" },
  { icon: Home, label: "Anasayfa", href: "/", isMainButton: true },
  { icon: Calculator, label: "Hesapla", href: "/hesaplama" },
  { icon: Menu, label: "Menü", href: "#", isMenu: true },
];

const allPages = [
  { label: "Anasayfa", href: "/" },
  { label: "Kumlamalar", href: "/kumlamalar" },
  { label: "Araç Giydirme", href: "/arac-giydirme" },
  { label: "Tabelalar", href: "/tabelalar" },
  { label: "Referanslar", href: "/referanslar" },
  { label: "Video Galeri", href: "/video-galeri" },
  
  { label: "Hesaplama", href: "/hesaplama" },
  { label: "İletişim", href: "/iletisim" },
];

export const MobileNavigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mobile-nav lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          if (item.isMenu) {
            return (
              <Sheet key="menu" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-xl transition-all duration-200",
                      "min-w-0 flex-1",
                      "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">Menü</span>
                  </button>
                </SheetTrigger>
              </Sheet>
            );
          }
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-xl transition-all duration-200",
                "min-w-0 flex-1",
                item.isMainButton 
                  ? "bg-accent text-accent-foreground scale-105 shadow-lg border border-accent-foreground/20 mx-0.5"
                  : isActive 
                    ? "bg-primary/90 text-primary-foreground rounded-lg mx-0.5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted mx-0.5"
              )}
            >
              <Icon className={cn("h-5 w-5", item.isMainButton && "h-6 w-6")} />
              <span className={cn("text-xs font-medium truncate", item.isMainButton && "font-bold")}>{item.label}</span>
            </Link>
          );
        })}
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="bottom" className="h-[50vh]">
            <SheetHeader>
              <SheetTitle>Tüm Sayfalar</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {allPages.map((page) => (
                <Link
                  key={page.href}
                  to={page.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-center p-4 rounded-lg border transition-colors",
                    location.pathname === page.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">{page.label}</span>
                </Link>
              ))}
              
              {/* Admin Panel Link */}
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary/50 transition-colors",
                  location.pathname === "/admin"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10 text-primary"
                )}
              >
                <span className="text-sm font-medium">🔧 Yönetim Paneli</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      </nav>
  );
};