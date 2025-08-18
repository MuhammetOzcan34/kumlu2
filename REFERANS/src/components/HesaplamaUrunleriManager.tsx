import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useHesaplamaUrunleri, useCreateHesaplamaUrunu, useUpdateHesaplamaUrunu, useDeleteHesaplamaUrunu, HesaplamaUrunu } from "@/hooks/useHesaplamaUrunleri";

export const HesaplamaUrunleriManager = () => {
  const { data: urunler, isLoading } = useHesaplamaUrunleri();
  const createMutation = useCreateHesaplamaUrunu();
  const updateMutation = useUpdateHesaplamaUrunu();
  const deleteMutation = useDeleteHesaplamaUrunu();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUrun, setEditingUrun] = useState<HesaplamaUrunu | null>(null);
  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    birim_fiyat: 0,
    birim: "m²",
    kategori: "",
    sira_no: 0,
    aktif: true
  });

  const resetForm = () => {
    setFormData({
      ad: "",
      aciklama: "",
      birim_fiyat: 0,
      birim: "m²",
      kategori: "",
      sira_no: 0,
      aktif: true
    });
    setEditingUrun(null);
  };

  const handleOpenDialog = (urun?: HesaplamaUrunu) => {
    if (urun) {
      setEditingUrun(urun);
      setFormData({
        ad: urun.ad,
        aciklama: urun.aciklama || "",
        birim_fiyat: urun.birim_fiyat,
        birim: urun.birim,
        kategori: urun.kategori || "",
        sira_no: urun.sira_no,
        aktif: urun.aktif
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUrun) {
        await updateMutation.mutateAsync({
          id: editingUrun.id,
          ...formData
        });
        toast({
          title: "Başarılı",
          description: "Ürün güncellendi"
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Başarılı",
          description: "Yeni ürün eklendi"
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Başarılı",
        description: "Ürün silindi"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürün silinemedi",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hesaplama Ürünleri</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUrun ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </DialogTitle>
              <DialogDescription>
                Hesaplama sayfasında kullanılacak ürün bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ad">Ürün Adı</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aciklama">Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birim_fiyat">Birim Fiyat</Label>
                  <Input
                    id="birim_fiyat"
                    type="number"
                    value={formData.birim_fiyat}
                    onChange={(e) => setFormData({ ...formData, birim_fiyat: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birim">Birim</Label>
                  <Select value={formData.birim} onValueChange={(value) => setFormData({ ...formData, birim: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m²">m²</SelectItem>
                      <SelectItem value="adet">adet</SelectItem>
                      <SelectItem value="cm²">cm²</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Input
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sira_no">Sıra No</Label>
                  <Input
                    id="sira_no"
                    type="number"
                    value={formData.sira_no}
                    onChange={(e) => setFormData({ ...formData, sira_no: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingUrun ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Birim Fiyat</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead>Sıra</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urunler?.map((urun) => (
            <TableRow key={urun.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{urun.ad}</div>
                  {urun.aciklama && (
                    <div className="text-sm text-muted-foreground">{urun.aciklama}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{urun.kategori || "-"}</TableCell>
              <TableCell>₺{urun.birim_fiyat}</TableCell>
              <TableCell>{urun.birim}</TableCell>
              <TableCell>{urun.sira_no}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(urun)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(urun.id)}>
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!urunler?.length && (
        <div className="text-center py-8 text-muted-foreground">
          Henüz ürün eklenmemiş. İlk ürünü eklemek için yukarıdaki butonu kullanın.
        </div>
      )}
    </div>
  );
};