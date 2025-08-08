import { useState } from "react";
import { 
  Settings, 
  FolderOpen, 
  Image, 
  Tag, 
  Calculator, 
  User, 
  Megaphone,
  LogOut,
  Home,
  Wrench,
  Play,
  Car,
  MessageCircle,
  Palette,
  Instagram,
  Plus,
  Droplets // Watermark ikonu için eklendi
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const adminMenuItems = [
  { 
    title: "Kampanyalar", 
    value: "kampanyalar", 
    icon: Megaphone, 
    description: "Reklam kampanyalarını yönet" 
  },
  { 
    title: "Kategoriler", 
    value: "kategoriler", 
    icon: Tag, 
    description: "Kategori yönetimi" 
  },
  { 
    title: "Fotoğraflar", 
    value: "fotograflar", 
    icon: Image, 
    description: "Galeri yönetimi" 
  },
  { 
    title: "Video Galeri", 
    value: "video-galeri", 
    icon: Play, 
    description: "YouTube videoları" 
  },
  { 
    title: "Ayarlar", 
    value: "ayarlar", 
    icon: Settings, 
    description: "Site ayarları" 
  },
  { 
    title: "Hesaplama", 
    value: "hesaplama", 
    icon: Calculator, 
    description: "Hesaplama ürünleri" 
  },
  { 
    title: "WhatsApp", 
    value: "whatsapp", 
    icon: MessageCircle, 
    description: "WhatsApp ayarları" 
  },
  { 
    title: "Servis Bedelleri", 
    value: "servis-bedelleri", 
    icon: Wrench, 
    description: "Servis ve montaj bedelleri" 
  },
  { 
    title: "Instagram", 
    value: "instagram", 
    icon: Instagram, 
    description: "Instagram ayarları" 
  },
  { 
    title: "Marka Logoları", 
    value: "marka-logolari", 
    icon: Palette, 
    description: "Marka logoları pop-up" 
  },
  { 
    title: "Ek Özellikler", 
    value: "ek-ozellikler", 
    icon: Plus, 
    description: "Hesaplama ek özellikleri" 
  },
  { 
    title: "Watermark", 
    value: "watermark", 
    icon: Droplets, 
    description: "Filigran ayarları" 
  },
  { 
    title: "Profil", 
    value: "profil", 
    icon: User, 
    description: "Profil bilgileri" 
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  userEmail: string;
  displayName?: string;
}

export function AdminSidebar({ activeTab, onTabChange, userEmail, displayName }: AdminSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
      
      navigate("/auth");
            } catch (error: unknown) {
          toast({
            title: "Çıkış hatası",
            description: error instanceof Error ? error.message : "Bilinmeyen hata",
            variant: "destructive",
          });
    }
  };

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* User Info */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Yönetim Paneli</span>
                <span className="text-xs text-muted-foreground truncate">
                  {displayName || userEmail}
                </span>
              </div>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive ? "bg-primary text-primary-foreground" : ""}
                    >
                      <button
                        onClick={() => onTabChange(item.value)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Hızlı İşlemler</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted"
                  >
                    <Home className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">Ana Sayfa</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">Çıkış Yap</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}