import { useState } from "react";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useHesaplamaUrunleri, 
  useCreateHesaplamaUrunu, 
  useUpdateHesaplamaUrunu, 
  useDeleteHesaplamaUrunu,
  useCreateHesaplamaFiyat,
  useUpdateHesaplamaFiyat,
  useDeleteHesaplamaFiyat,
  HesaplamaUrunu, 
  HesaplamaFiyat 
} from "@/hooks/useHesaplamaUrunleri";

export const HesaplamaUrunleriManager = () => {
  const { data: urunler, isLoading } = useHesaplamaUrunleri();
  const createMutation = useCreateHesaplamaUrunu();
  const updateMutation = useUpdateHesaplamaUrunu();
  const deleteMutation = useDeleteHesaplamaUrunu();
  const createFiyatMutation = useCreateHesaplamaFiyat();
  const updateFiyatMutation = useUpdateHesaplamaFiyat();
  const deleteFiyatMutation = useDeleteHesaplamaFiyat();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFiyatDialogOpen, setIsFiyatDialogOpen] = useState(false);
  const [editingUrun, setEditingUrun] = useState<HesaplamaUrunu | null>(null);
  const [editingFiyat, setEditingFiyat] = useState<HesaplamaFiyat | null>(null);
  const [selectedUrunId, setSelectedUrunId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    kategori: "",
    sira_no: 0,
    aktif: true
  });

  const [fiyatFormData, setFiyatFormData] = useState({
    urun_id: "",
    metrekare_min: 0,
    metrekare_max: 0,
    malzeme_fiyat: 0,
    montaj_fiyat: 0
  });

  const resetForm = () => {
    setFormData({
      ad: "",
      aciklama: "",
      kategori: "",
      sira_no: 0,
      aktif: true
    });
    setEditingUrun(null);
  };

  const resetFiyatForm = () => {
    setFiyatFormData({
      urun_id: "",
      metrekare_min: 0,
      metrekare_max: 0,
      malzeme_fiyat: 0,
      montaj_fiyat: 0
    });
    setEditingFiyat(null);
  };

  const handleOpenDialog = (urun?: HesaplamaUrunu) => {
    if (urun) {
      setEditingUrun(urun);
      setFormData({
        ad: urun.ad,
        aciklama: urun.aciklama || "",
        kategori: urun.kategori,
        sira_no: urun.sira_no,
        aktif: urun.aktif
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleOpenFiyatDialog = (fiyat?: HesaplamaFiyat, urunId?: string) => {
    if (fiyat) {
      setEditingFiyat(fiyat);
      setFiyatFormData({
        urun_id: fiyat.urun_id,
        metrekare_min: fiyat.metrekare_min,
        metrekare_max: fiyat.metrekare_max,
        malzeme_fiyat: fiyat.malzeme_fiyat,
        montaj_fiyat: fiyat.montaj_fiyat
      });
    } else {
      resetFiyatForm();
      setFiyatFormData(prev => ({ ...prev, urun_id: urunId || "" }));
    }
    setIsFiyatDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleCloseFiyatDialog = () => {
    setIsFiyatDialogOpen(false);
    resetFiyatForm();
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

  const handleFiyatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFiyat) {
        await updateFiyatMutation.mutateAsync({
          id: editingFiyat.id,
          ...fiyatFormData
        });
        toast({
          title: "Başarılı",
          description: "Fiyat güncellendi"
        });
      } else {
        await createFiyatMutation.mutateAsync(fiyatFormData);
        toast({
          title: "Başarılı",
          description: "Yeni fiyat eklendi"
        });
      }
      handleCloseFiyatDialog();
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

  const handleDeleteFiyat = async (id: string) => {
    try {
      await deleteFiyatMutation.mutateAsync(id);
      toast({
        title: "Başarılı",
        description: "Fiyat silindi"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Fiyat silinemedi",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="urunler" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="urunler">Ürünler</TabsTrigger>
          <TabsTrigger value="fiyatlar">Fiyat Yönetimi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="urunler" className="space-y-4">
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
                    Hesaplama sayfasında kullanılacak malzeme türünü girin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                    <Label htmlFor="urun-ad">Malzeme Adı</Label>
                <Input
                  id="urun-ad"
                  name="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  placeholder="Malzeme adını girin"
                  autoComplete="off"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urun-aciklama">Açıklama</Label>
                <Textarea
                  id="urun-aciklama"
                  name="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="Malzeme açıklaması"
                  autoComplete="off"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urun-kategori">Kategori</Label>
                  <Input
                    id="urun-kategori"
                    name="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    placeholder="Kategori adı"
                    autoComplete="off"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urun-sira-no">Sıra No</Label>
                  <Input
                    id="urun-sira-no"
                    name="sira_no"
                    type="number"
                    value={formData.sira_no}
                    onChange={(e) => setFormData({ ...formData, sira_no: Number(e.target.value) })}
                    min="0"
                    placeholder="Sıra numarası"
                    autoComplete="off"
                    required
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
                <TableHead>Malzeme Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
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
                  <TableCell>{urun.kategori}</TableCell>
              <TableCell>{urun.sira_no}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      urun.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {urun.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                  </TableCell>
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
        </TabsContent>

        <TabsContent value="fiyatlar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fiyat Yönetimi</h3>
            <div className="flex gap-2">
              <Select value={selectedUrunId} onValueChange={setSelectedUrunId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Malzeme seçin" />
                </SelectTrigger>
                <SelectContent>
                  {urunler?.map((urun) => (
                    <SelectItem key={urun.id} value={urun.id}>
                      {urun.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isFiyatDialogOpen} onOpenChange={setIsFiyatDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => handleOpenFiyatDialog(undefined, selectedUrunId)}
                    disabled={!selectedUrunId}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Yeni Fiyat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFiyat ? "Fiyat Düzenle" : "Yeni Fiyat Ekle"}
                    </DialogTitle>
                    <DialogDescription>
                      Metrekare aralığına göre malzeme ve montaj fiyatlarını belirleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFiyatSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fiyat-metrekare-min">Min m²</Label>
                        <Input
                          id="fiyat-metrekare-min"
                          name="metrekare_min"
                          type="number"
                          value={fiyatFormData.metrekare_min}
                          onChange={(e) => setFiyatFormData({ ...fiyatFormData, metrekare_min: Number(e.target.value) })}
                          min="0"
                          step="0.1"
                          placeholder="Minimum m²"
                          autoComplete="off"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fiyat-metrekare-max">Max m²</Label>
                        <Input
                          id="fiyat-metrekare-max"
                          name="metrekare_max"
                          type="number"
                          value={fiyatFormData.metrekare_max}
                          onChange={(e) => setFiyatFormData({ ...fiyatFormData, metrekare_max: Number(e.target.value) })}
                          min="0"
                          step="0.1"
                          placeholder="Maksimum m²"
                          autoComplete="off"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fiyat-malzeme">Malzeme Fiyatı (₺/m²)</Label>
                        <Input
                          id="fiyat-malzeme"
                          name="malzeme_fiyat"
                          type="number"
                          value={fiyatFormData.malzeme_fiyat}
                          onChange={(e) => setFiyatFormData({ ...fiyatFormData, malzeme_fiyat: Number(e.target.value) })}
                          min="0"
                          step="0.01"
                          placeholder="Malzeme fiyatı"
                          autoComplete="off"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fiyat-montaj">Montaj Fiyatı (₺/m²)</Label>
                        <Input
                          id="fiyat-montaj"
                          name="montaj_fiyat"
                          type="number"
                          value={fiyatFormData.montaj_fiyat}
                          onChange={(e) => setFiyatFormData({ ...fiyatFormData, montaj_fiyat: Number(e.target.value) })}
                          min="0"
                          step="0.01"
                          placeholder="Montaj fiyatı"
                          autoComplete="off"
                          required
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseFiyatDialog}>
                        İptal
                      </Button>
                      <Button type="submit" disabled={createFiyatMutation.isPending || updateFiyatMutation.isPending}>
                        {editingFiyat ? "Güncelle" : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {selectedUrunId && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metrekare Aralığı</TableHead>
                  <TableHead>Malzeme Fiyatı</TableHead>
                  <TableHead>Montaj Fiyatı</TableHead>
                  <TableHead>Toplam Fiyat</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urunler?.find(u => u.id === selectedUrunId)?.fiyatlar?.map((fiyat) => (
                  <TableRow key={fiyat.id}>
                    <TableCell>
                      {fiyat.metrekare_min} - {fiyat.metrekare_max} m²
                    </TableCell>
                    <TableCell>₺{fiyat.malzeme_fiyat}</TableCell>
                    <TableCell>₺{fiyat.montaj_fiyat}</TableCell>
                    <TableCell>₺{fiyat.malzeme_fiyat + fiyat.montaj_fiyat}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenFiyatDialog(fiyat)}
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
                                Bu fiyatı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFiyat(fiyat.id)}>
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
          )}

          {!selectedUrunId && (
            <div className="text-center py-8 text-muted-foreground">
              Fiyat yönetimi için önce bir malzeme seçin.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};