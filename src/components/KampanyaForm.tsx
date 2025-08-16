import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Kampanya {
  id: string;
  kampanya_adi: string;
  platform: string;
  durum: string;
  kategori_id: string;
  butce_gunluk: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  hedef_url: string;
  reklam_metni: string;
}

interface Kategori {
  id: string;
  ad: string;
}

interface KampanyaFormProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void; // İsteğe bağlı prop eklendi
  onClose?: () => void; // Mevcut onClose prop'u korundu
  kampanya?: Kampanya;
  kategoriler: Kategori[];
  onSuccess: () => void;
}

export function KampanyaForm({ 
  isOpen, 
  onOpenChange, 
  onClose, 
  kampanya, 
  kategoriler, 
  onSuccess 
}: KampanyaFormProps) {
  const [formData, setFormData] = useState({
    kampanya_adi: "",
    platform: "",
    durum: "taslak",
    kategori_id: "",
    butce_gunluk: "",
    baslangic_tarihi: "",
    bitis_tarihi: "",
    reklam_metni: "",
    hedef_url: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (kampanya) {
      setFormData({
        kampanya_adi: kampanya.kampanya_adi || "",
        platform: kampanya.platform || "",
        durum: kampanya.durum || "taslak",
        kategori_id: kampanya.kategori_id || "",
        butce_gunluk: kampanya.butce_gunluk?.toString() || "",
        baslangic_tarihi: kampanya.baslangic_tarihi || "",
        bitis_tarihi: kampanya.bitis_tarihi || "",
        reklam_metni: kampanya.reklam_metni || "",
        hedef_url: kampanya.hedef_url || ""
      });
    } else {
      setFormData({
        kampanya_adi: "",
        platform: "",
        durum: "taslak",
        kategori_id: "",
        butce_gunluk: "",
        baslangic_tarihi: "",
        bitis_tarihi: "",
        reklam_metni: "",
        hedef_url: ""
      });
    }
  }, [kampanya]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        butce_gunluk: formData.butce_gunluk ? parseFloat(formData.butce_gunluk) : null
      };

      if (kampanya) {
        // Güncelleme
        const { error } = await supabase
          .from("reklam_kampanyalari")
          .update(submitData)
          .eq("id", kampanya.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Kampanya başarıyla güncellendi.",
        });
      } else {
        // Yeni ekleme
        const { error } = await supabase
          .from("reklam_kampanyalari")
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Kampanya başarıyla oluşturuldu.",
        });
      }

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // onOpenChange varsa onu kullan, yoksa onClose'u kullan
    if (onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {kampanya ? "Kampanya Düzenle" : "Yeni Kampanya"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kampanya_adi">Kampanya Adı</Label>
              <Input
                id="kampanya_adi"
                value={formData.kampanya_adi}
                onChange={(e) => setFormData({ ...formData, kampanya_adi: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Platform seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durum">Durum</Label>
              <Select
                value={formData.durum}
                onValueChange={(value) => setFormData({ ...formData, durum: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taslak">Taslak</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="duraklatildi">Duraklatıldı</SelectItem>
                  <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kategori_id">Kategori</Label>
              <Select
                value={formData.kategori_id}
                onValueChange={(value) => setFormData({ ...formData, kategori_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id}>
                      {kategori.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="butce_gunluk">Günlük Bütçe (₺)</Label>
              <Input
                id="butce_gunluk"
                type="number"
                step="0.01"
                value={formData.butce_gunluk}
                onChange={(e) => setFormData({ ...formData, butce_gunluk: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baslangic_tarihi">Başlangıç Tarihi</Label>
              <Input
                id="baslangic_tarihi"
                type="date"
                value={formData.baslangic_tarihi}
                onChange={(e) => setFormData({ ...formData, baslangic_tarihi: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bitis_tarihi">Bitiş Tarihi</Label>
              <Input
                id="bitis_tarihi"
                type="date"
                value={formData.bitis_tarihi}
                onChange={(e) => setFormData({ ...formData, bitis_tarihi: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hedef_url">Hedef URL</Label>
              <Input
                id="hedef_url"
                type="url"
                value={formData.hedef_url}
                onChange={(e) => setFormData({ ...formData, hedef_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reklam_metni">Reklam Metni</Label>
            <Textarea
              id="reklam_metni"
              value={formData.reklam_metni}
              onChange={(e) => setFormData({ ...formData, reklam_metni: e.target.value })}
              rows={4}
              placeholder="Reklam metnini buraya yazın..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : kampanya ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}