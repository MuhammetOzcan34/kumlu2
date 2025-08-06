import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TeklifFormuProps {
  triggerButtonText?: string;
  triggerButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  asServiceCard?: boolean;
  serviceIcon?: any;
  serviceGradient?: string;
}

export const TeklifFormu = ({ 
  triggerButtonText = "Teklif Al", 
  triggerButtonVariant = "default",
  className = "",
  asServiceCard = false,
  serviceIcon: ServiceIcon,
  serviceGradient = ""
}: TeklifFormuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ad: "",
    telefon: "",
    email: "",
    konu: "",
    mesaj: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ad || !formData.telefon || !formData.mesaj) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Burada form verilerini backend'e gönderme işlemi yapılacak
      // Şimdilik sadece console'a yazdırıyoruz
      console.log("Form Verileri:", formData);
      console.log("Seçilen Dosyalar:", selectedFiles);

      toast({
        title: "Başarılı!",
        description: "Teklif talebiniz gönderildi. En kısa sürede size dönüş yapacağız.",
      });

      // Formu sıfırla
      setFormData({
        ad: "",
        telefon: "",
        email: "",
        konu: "",
        mesaj: ""
      });
      setSelectedFiles([]);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {asServiceCard ? (
          <Card className="glass-card h-full hover-scale cursor-pointer transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center space-y-2">
              <div className={`p-2 rounded-full ${serviceGradient}`}>
                {ServiceIcon && <ServiceIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold line-clamp-2">
                  {triggerButtonText}
                </h3>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            variant={triggerButtonVariant} 
            className={className}
          >
            {triggerButtonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiyat Teklifi Talebi</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad">
              Ad Soyad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ad"
              name="ad"
              value={formData.ad}
              onChange={handleInputChange}
              placeholder="Adınız ve soyadınız"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefon">
              Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              value={formData.telefon}
              onChange={handleInputChange}
              placeholder="0555 123 45 67"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ornek@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="konu">Konu</Label>
            <Input
              id="konu"
              name="konu"
              value={formData.konu}
              onChange={handleInputChange}
              placeholder="Teklif konusu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mesaj">
              Mesaj <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="mesaj"
              name="mesaj"
              value={formData.mesaj}
              onChange={handleInputChange}
              placeholder="Detaylı bilgi ve isteklerinizi yazın..."
              rows={4}
              required
            />
          </div>

          {/* Dosya Yükleme Bölümü */}
          <div className="space-y-2">
            <Label>Dosya Ekle</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileSelector}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Dosya Seç
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCamera}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Fotoğraf Çek
              </Button>
            </div>
            
            {/* Gizli input'lar */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Seçilen Dosyalar */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Seçilen Dosyalar</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate flex-1 mr-2">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              "Gönderiliyor..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Teklif Talebini Gönder
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};