import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

interface WhatsAppWidgetProps {
  className?: string;
}

export function WhatsAppWidget({ className }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { data: settings } = useSettings();

  const whatsappNumber = settings?.whatsapp_number || "5555555555";
  
  // Türkiye uyumlu telefon numarası formatı için temizleme ve düzenleme
  const cleanWhatsappNumber = (() => {
    // Boşlukları ve özel karakterleri temizle
    let cleaned = whatsappNumber.replace(/[^0-9]/g, '');
    
    // Eğer numara 90 ile başlıyorsa (ülke kodu varsa) olduğu gibi bırak
    if (cleaned.startsWith('90') && cleaned.length === 12) {
      return cleaned;
    }
    
    // Eğer numara 5 ile başlıyorsa (Türk cep telefonu) başına 90 ekle
    if (cleaned.startsWith('5') && cleaned.length === 10) {
      return '90' + cleaned;
    }
    
    // Eğer numara 0 ile başlıyorsa 0'ı kaldır ve 90 ekle
    if (cleaned.startsWith('05') && cleaned.length === 11) {
      return '90' + cleaned.substring(1);
    }
    
    // Varsayılan olarak 90 ekle
    return '90' + cleaned;
  })();
  const whatsappMessage = settings?.whatsapp_default_message || "Merhaba, bilgi almak istiyorum.";
  const whatsappEnabled = settings?.whatsapp_enabled !== "false";

  // Mobil cihaz kontrolü
  const isMobile = window.innerWidth <= 768;

  // Eğer WhatsApp devre dışı bırakılmışsa widget'ı gösterme
  if (!whatsappEnabled) {
    return null;
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isMobile) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        setPosition(prev => ({
          x: Math.max(0, Math.min(window.innerWidth - 48, prev.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - 48, prev.y + deltaY))
        }));
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && isMobile) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;
        
        setPosition(prev => ({
          x: Math.max(0, Math.min(window.innerWidth - 48, prev.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - 48, prev.y + deltaY))
        }));
        
        setDragStart({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart, isMobile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleSendMessage = () => {
    const fullMessage = `Merhaba, ben ${name}. ${message}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
    setMessage("");
    setName("");
    setPhone("");
  };

  const handleQuickContact = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const widgetStyle = isMobile ? {
    position: "fixed" as const,
    right: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none"
  } : {
    position: "fixed" as const,
    bottom: "20px",
    right: "20px",
    zIndex: 1000
  };

  return (
    <div className={cn("", className)} style={widgetStyle}>
      {/* WhatsApp Button */}
      {!isOpen && (
        <Button
          onClick={isMobile ? () => setIsOpen(true) : handleQuickContact}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={cn(
            "rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
            "bg-green-500 hover:bg-green-600 text-white",
            isMobile ? "w-12 h-12 cursor-grab active:cursor-grabbing" : "w-14 h-14"
          )}
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
          }}
        >
          <MessageCircle className={cn(isMobile ? "w-5 h-5" : "w-6 h-6")} />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "shadow-2xl border-0",
          isMobile ? "w-72" : "w-80"
        )}>
          <CardHeader className="bg-green-500 text-white pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">WhatsApp İletişim</CardTitle>
                  <p className="text-xs opacity-90">Hızlı mesaj gönderin</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Adınız
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınızı girin"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefon (İsteğe bağlı)
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefon numaranız"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium">
                  Mesajınız
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!name.trim() || !message.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Gönder
              </Button>
              <Button
                variant="outline"
                onClick={handleQuickContact}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Hızlı
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              WhatsApp üzerinden anında iletişime geçin
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}