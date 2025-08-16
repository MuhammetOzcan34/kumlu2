import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Plus, Edit3, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

interface Video {
  id: string;
  baslik: string;
  aciklama?: string;
  youtube_url: string;
  youtube_id?: string;
  thumbnail_url?: string;
  kategori?: string;
  sira_no: number;
  aktif: boolean;
  created_at: string;
}

const VideoGaleriManager: React.FC = () => {
  const [videolar, setVideolar] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    youtube_url: '',
    kategori: '',
    sira_no: 0,
    aktif: true
  });

  const kategoriler = useMemo(() => [
    'Cam Kumlama',
    'Araç Giydirme',
    'Tabela Üretimi',
    'Dijital Baskı',
    'Tanıtım',
    'Referanslar',
    'Diğer'
  ], []);

  useEffect(() => {
    loadVideolar();
  }, []);

  const loadVideolar = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('video_galeri')
        .select('*')
        .order('sira_no', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideolar(data || []);
    } catch (error) {
      console.error('Videolar yüklenirken hata:', error);
      toast.error('Videolar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  const validateYouTubeUrl = useCallback((url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.baslik || !formData.youtube_url) {
        toast.error('Başlık ve YouTube URL zorunludur');
        return;
      }

      if (!validateYouTubeUrl(formData.youtube_url)) {
        toast.error('Geçerli bir YouTube URL girin');
        return;
      }

      const { error } = await supabase
        .from('video_galeri')
        .insert([formData]);

      if (error) throw error;

      toast.success('Video eklendi');
      setIsAddDialogOpen(false);
      setFormData({
        baslik: '',
        aciklama: '',
        youtube_url: '',
        kategori: '',
        sira_no: 0,
        aktif: true
      });
      loadVideolar();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      toast.error('Video eklenemedi');
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      baslik: video.baslik,
      aciklama: video.aciklama || '',
      youtube_url: video.youtube_url,
      kategori: video.kategori || '',
      sira_no: video.sira_no,
      aktif: video.aktif
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVideo) return;

    try {
      if (!validateYouTubeUrl(formData.youtube_url)) {
        toast.error('Geçerli bir YouTube URL girin');
        return;
      }

      const { error } = await supabase
        .from('video_galeri')
        .update(formData)
        .eq('id', editingVideo.id);

      if (error) throw error;

      toast.success('Video güncellendi');
      setIsEditDialogOpen(false);
      setEditingVideo(null);
      loadVideolar();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Video güncellenemedi');
    }
  };

  const handleDelete = async (video: Video) => {
    try {
      const { error } = await supabase
        .from('video_galeri')
        .delete()
        .eq('id', video.id);

      if (error) throw error;

      toast.success('Video silindi');
      loadVideolar();
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Video silinemedi');
    }
  };

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return '';
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Video Galeri Yönetimi
        </CardTitle>
        <CardDescription>
          YouTube videolarını ekleyin ve yönetin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            Toplam {videolar.length} video
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Video Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Video Ekle</DialogTitle>
                <DialogDescription>
                  YouTube'dan yeni bir video ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baslik">Başlık</Label>
                  <Input
                    id="baslik"
                    value={formData.baslik}
                    onChange={(e) => setFormData(prev => ({ ...prev, baslik: e.target.value }))}
                    placeholder="Video başlığını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    YouTube video linkini yapıştırın. Desteklenen formatlar: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
                  </div>
                </div>
                <div>
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Textarea
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                    placeholder="Video açıklaması (isteğe bağlı)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Input
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                    placeholder="Video kategorisi (isteğe bağlı)"
                    list="kategoriler"
                  />
                  <datalist id="kategoriler">
                    {kategoriler.map((kategori) => (
                      <option key={kategori} value={kategori} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="sira_no">Sıra No</Label>
                  <Input
                    id="sira_no"
                    type="number"
                    value={formData.sira_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, sira_no: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aktif"
                    checked={formData.aktif}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aktif: checked }))}
                  />
                  <Label htmlFor="aktif">Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSubmit}>
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videolar.map((video) => (
            <div key={video.id} className="border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.baslik}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {video.aktif ? (
                    <Badge variant="default" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Pasif
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(video.youtube_url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <h4 className="font-medium text-sm line-clamp-2">
                  {video.baslik}
                </h4>
                
                {video.aciklama && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.aciklama}
                  </p>
                )}
                
                {video.kategori && (
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {video.kategori}
                    </Badge>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Sıra: {video.sira_no} • {new Date(video.created_at).toLocaleDateString('tr-TR')}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Videoyu Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu videoyu kalıcı olarak silmek istediğinizden emin misiniz? 
                          Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(video)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videolar.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Henüz video eklenmemiş
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Video Düzenle</DialogTitle>
              <DialogDescription>
                Video bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-baslik">Başlık</Label>
                <Input
                  id="edit-baslik"
                  value={formData.baslik}
                  onChange={(e) => setFormData(prev => ({ ...prev, baslik: e.target.value }))}
                  placeholder="Video başlığını girin"
                />
              </div>
              <div>
                <Label htmlFor="edit-youtube_url">YouTube URL</Label>
                <Input
                  id="edit-youtube_url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                />
              </div>
              <div>
                <Label htmlFor="edit-aciklama">Açıklama</Label>
                <Textarea
                  id="edit-aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                  placeholder="Video açıklaması (isteğe bağlı)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-kategori">Kategori</Label>
                <Input
                  id="edit-kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                  placeholder="Video kategorisi (isteğe bağlı)"
                  list="edit-kategoriler"
                />
                <datalist id="edit-kategoriler">
                  {kategoriler.map((kategori) => (
                    <option key={kategori} value={kategori} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="edit-sira_no">Sıra No</Label>
                <Input
                  id="edit-sira_no"
                  type="number"
                  value={formData.sira_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, sira_no: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-aktif"
                  checked={formData.aktif}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aktif: checked }))}
                />
                <Label htmlFor="edit-aktif">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleUpdate}>
                Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// React.memo ile bileşeni optimize et
const MemoizedVideoGaleriManager = React.memo(VideoGaleriManager);
MemoizedVideoGaleriManager.displayName = 'VideoGaleriManager';

export default MemoizedVideoGaleriManager;