import { Home, Palette, FileText, Play, Calculator, Users, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const sidebarItems = [
  { icon: Home, label: "Anasayfa", href: "/" },
  { icon: Palette, label: "Cam Kumlama", href: "/kumlamalar" },
  { icon: FileText, label: "Tabelalar", href: "/tabelalar" },
  { icon: Play, label: "Video Galeri", href: "/video-galeri" },
  { icon: Calculator, label: "Servis Bedelleri", href: "/servis-bedelleri" },
  { icon: Calculator, label: "Hesaplama", href: "/hesaplama" },
  { icon: Users, label: "Referanslar", href: "/referanslar" },
  { icon: Phone, label: "İletişim", href: "/iletisim" },
];

export const DesktopSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex-col z-40">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cam Kumlama Atölyesi
        </h1>
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
      
      {/* Theme Toggle */}
      <div className="mt-auto p-4 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  );
};