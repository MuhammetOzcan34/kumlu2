import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KampanyaFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kampanya?: any;
  kategoriler: any[];
  onSuccess: () => void;
}

export const KampanyaForm = ({ isOpen, onOpenChange, kampanya, kategoriler, onSuccess }: KampanyaFormProps) => {
  const [formData, setFormData] = useState({
    kampanya_adi: kampanya?.kampanya_adi || "",
    platform: kampanya?.platform || "",
    durum: kampanya?.durum || "taslak",
    hedef_kitle: kampanya?.hedef_kitle || "",
    butce_gunluk: kampanya?.butce_gunluk || "",
    butce_toplam: kampanya?.butce_toplam || "",
    baslangic_tarihi: kampanya?.baslangic_tarihi || "",
    bitis_tarihi: kampanya?.bitis_tarihi || "",
    reklam_metni: kampanya?.reklam_metni || "",
    hedef_url: kampanya?.hedef_url || "",
    kategori_id: kampanya?.kategori_id || "",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (kampanya) {
        // Update existing
        const { error } = await supabase
          .from("reklam_kampanyalari")
          .update(formData)
          .eq("id", kampanya.id);

        if (error) throw error;
        toast({ title: "Kampanya güncellendi" });
      } else {
        // Create new
        const { error } = await supabase
          .from("reklam_kampanyalari")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Kampanya oluşturuldu" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {kampanya ? "Kampanya Düzenle" : "Yeni Kampanya"}
          </DialogTitle>
          <DialogDescription>
            Reklam kampanyası bilgilerini girin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kampanya_adi">Kampanya Adı *</Label>
              <Input
                id="kampanya_adi"
                value={formData.kampanya_adi}
                onChange={(e) => setFormData({ ...formData, kampanya_adi: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durum">Durum</Label>
              <Select
                value={formData.durum}
                onValueChange={(value) => setFormData({ ...formData, durum: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori_id}
                onValueChange={(value) => setFormData({ ...formData, kategori_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler?.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id || 'unknown'}>
                      {kategori.ad}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hedef_kitle">Hedef Kitle</Label>
            <Input
              id="hedef_kitle"
              value={formData.hedef_kitle}
              onChange={(e) => setFormData({ ...formData, hedef_kitle: e.target.value })}
              placeholder="Örn: 25-45 yaş, İstanbul"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="butce_toplam">Toplam Bütçe (₺)</Label>
              <Input
                id="butce_toplam"
                type="number"
                step="0.01"
                value={formData.butce_toplam}
                onChange={(e) => setFormData({ ...formData, butce_toplam: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="reklam_metni">Reklam Metni</Label>
            <Textarea
              id="reklam_metni"
              value={formData.reklam_metni}
              onChange={(e) => setFormData({ ...formData, reklam_metni: e.target.value })}
              rows={3}
              placeholder="Reklam metnini buraya yazın..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : (kampanya ? "Güncelle" : "Oluştur")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};