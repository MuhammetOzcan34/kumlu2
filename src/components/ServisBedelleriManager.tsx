import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useServisBedelleri, 
  useCreateServisBedeli, 
  useUpdateServisBedeli, 
  useDeleteServisBedeli,
  ServisBedeli 
} from "@/hooks/useServisBedelleri";

export const ServisBedelleriManager = () => {
  const { data: servisBedelleri, isLoading } = useServisBedelleri();
  const createMutation = useCreateServisBedeli();
  const updateMutation = useUpdateServisBedeli();
  const deleteMutation = useDeleteServisBedeli();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServisBedeli, setEditingServisBedeli] = useState<ServisBedeli | null>(null);
  const [formData, setFormData] = useState({
    kategori: "Tüm Kategoriler", // Varsayılan olarak "Tüm Kategoriler" seçili
    hizmet_adi: "",
    birim: "m²",
    birim_fiyat: 0,
    aciklama: "",
    sira_no: 0,
    aktif: true
  });

  const resetForm = () => {
      setFormData({
      kategori: "Tüm Kategoriler", // Varsayılan olarak "Tüm Kategoriler" seçili
      hizmet_adi: "",
      birim: "m²",
        birim_fiyat: 0,
      aciklama: "",
        sira_no: 0,
        aktif: true
      });
    setEditingServisBedeli(null);
  };

  const handleOpenDialog = (servisBedeli?: ServisBedeli) => {
    if (servisBedeli) {
      setEditingServisBedeli(servisBedeli);
    setFormData({
        kategori: servisBedeli.kategori,
        hizmet_adi: servisBedeli.hizmet_adi,
        birim: servisBedeli.birim,
        birim_fiyat: servisBedeli.birim_fiyat,
        aciklama: servisBedeli.aciklama || "",
        sira_no: servisBedeli.sira_no,
        aktif: servisBedeli.aktif
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
      if (editingServisBedeli) {
        await updateMutation.mutateAsync({
          id: editingServisBedeli.id,
          ...formData
        });
        toast({
          title: "Başarılı",
          description: "Servis bedeli güncellendi"
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Başarılı",
          description: "Yeni servis bedeli eklendi"
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
        description: "Servis bedeli silindi"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Servis bedeli silinemedi",
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
        <h3 className="text-lg font-semibold">Servis Bedelleri</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Servis Bedeli
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
              <DialogTitle>
                {editingServisBedeli ? "Servis Bedeli Düzenle" : "Yeni Servis Bedeli Ekle"}
              </DialogTitle>
                <DialogDescription>
                Hesaplama sayfasında kullanılacak servis bedeli bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori Seçimi</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  {[
                    "Tüm Kategoriler",
                    "Kumlama",
                    "Tabela", 
                    "Araç Giydirme",
                    "Dijital Baskı",
                    "Montaj"
                  ].map((kategori) => (
                    <div key={kategori} className="flex items-center space-x-2">
                      <Checkbox
                        id={`kategori-${kategori}`}
                        checked={formData.kategori.includes(kategori)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // "Tüm Kategoriler" seçilirse diğerlerini temizle
                            if (kategori === "Tüm Kategoriler") {
                              setFormData({ ...formData, kategori: "Tüm Kategoriler" });
                            } else {
                              // Diğer kategoriler seçilirse "Tüm Kategoriler"ı kaldır
                              const currentKategoriler = formData.kategori === "Tüm Kategoriler" 
                                ? "" 
                                : formData.kategori;
                              const newKategoriler = currentKategoriler 
                                ? `${currentKategoriler}, ${kategori}` 
                                : kategori;
                              setFormData({ ...formData, kategori: newKategoriler });
                            }
                          } else {
                            // Kategori kaldırılırsa
                            const kategoriler = formData.kategori.split(", ").filter(k => k !== kategori);
                            setFormData({ ...formData, kategori: kategoriler.length > 0 ? kategoriler.join(", ") : "Tüm Kategoriler" });
                          }
                        }}
                      />
                      <Label htmlFor={`kategori-${kategori}`} className="text-sm">{kategori}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="hizmet_adi">Hizmet Adı</Label>
                  <Input
                    id="hizmet_adi"
                    value={formData.hizmet_adi}
                  onChange={(e) => setFormData({ ...formData, hizmet_adi: e.target.value })}
                  required
                  />
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birim">Birim</Label>
                  <Select value={formData.birim} onValueChange={(value) => setFormData({ ...formData, birim: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="m²">m²</SelectItem>
                      <SelectItem value="adet">adet</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
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
                </div>
              
              <div className="space-y-2">
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Textarea
                    id="aciklama"
                    value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingServisBedeli ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
            </DialogContent>
          </Dialog>
        </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Hizmet Adı</TableHead>
            <TableHead>Birim Fiyat</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead>Sıra</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servisBedelleri?.map((servisBedeli) => (
            <TableRow key={servisBedeli.id}>
              <TableCell>{servisBedeli.kategori}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{servisBedeli.hizmet_adi}</div>
                  {servisBedeli.aciklama && (
                    <div className="text-sm text-muted-foreground">{servisBedeli.aciklama}</div>
                        )}
                      </div>
              </TableCell>
              <TableCell>₺{servisBedeli.birim_fiyat}</TableCell>
              <TableCell>{servisBedeli.birim}</TableCell>
              <TableCell>{servisBedeli.sira_no}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  servisBedeli.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {servisBedeli.aktif ? 'Aktif' : 'Pasif'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                    onClick={() => handleOpenDialog(servisBedeli)}
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
                          Bu servis bedelini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(servisBedeli.id)}>
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

      {!servisBedelleri?.length && (
        <div className="text-center py-8 text-muted-foreground">
          Henüz servis bedeli eklenmemiş. İlk servis bedelini eklemek için yukarıdaki butonu kullanın.
        </div>
      )}
            </div>
  );
};