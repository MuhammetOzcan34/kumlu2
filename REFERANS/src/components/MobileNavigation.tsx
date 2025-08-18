import { Home, Palette, FileText, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigationItems = [
  { icon: Palette, label: "Kumlamalar", href: "/kumlamalar" },
  { icon: Home, label: "Anasayfa", href: "/" },
  { icon: FileText, label: "Tabelalar", href: "/tabelalar" },
];

const allPages = [
  { label: "Anasayfa", href: "/" },
  { label: "Kumlamalar", href: "/kumlamalar" },
  { label: "Tabelalar", href: "/tabelalar" },
  { label: "Referanslar", href: "/referanslar" },
  { label: "Video Galeri", href: "/video-galeri" },
  { label: "Servis Bedelleri", href: "/servis-bedelleri" },
  { label: "Hesaplama", href: "/hesaplama" },
  { label: "İletişim", href: "/iletisim" },
];

export const MobileNavigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mobile-nav lg:hidden">
      <div className="flex justify-around items-center h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200",
                "min-w-0 flex-1",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200",
                "min-w-0 flex-1",
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs font-medium">Menü</span>
            </button>
          </SheetTrigger>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};