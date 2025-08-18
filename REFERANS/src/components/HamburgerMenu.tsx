import { useState } from "react";
import { Menu, X, Home, Palette, FileText, Play, Calculator, Users, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  { icon: Home, label: "Anasayfa", href: "/" },
  { icon: Palette, label: "Cam Kumlama", href: "/kumlamalar" },
  { icon: FileText, label: "Tabelalar", href: "/tabelalar" },
  { icon: Play, label: "Video Galeri", href: "/video-galeri" },
  { icon: Calculator, label: "Servis ve Montaj Bedelleri", href: "/servis-bedelleri" },
  { icon: Calculator, label: "Hesaplama", href: "/hesaplama" },
  { icon: Users, label: "Referanslar", href: "/referanslar" },
  { icon: Phone, label: "İletişim", href: "/iletisim" },
];

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

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
                    <h2 className="text-lg font-semibold">Menü</h2>
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
                  <div className="p-4 border-t border-border">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-lg font-semibold text-primary">Kumlu Web</h1>
          </div>
        </div>
      </div>
    </>
  );
};