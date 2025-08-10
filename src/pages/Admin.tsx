import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Settings,
  Users,
  Image,
  Video,
  FileText,
  BarChart3,
  Shield, // Watermark yerine Shield ikonu kullanıyoruz
  Eye,
  EyeOff,
  Save,
  X,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Arayüz tanımları - ID'leri string olarak güncellendi
interface Kategori {
  id: string; // number'dan string'e değiştirildi
  ad: string;
  slug: string;
  aciklama?: string;
  tip: 'kumlama' | 'tabela' | 'arac-giydirme';
  aktif: boolean;
  sira_no?: number;
  created_at: string;
  updated_at: string;
}

interface Fotograf {
  id: string; // number'dan string'e değiştirildi
  baslik?: string;
  aciklama?: string;
  dosya_yolu: string;
  thumbnail_yolu?: string;
  kategori_id?: string;
  kategori_adi?: string;
  aktif: boolean;
  sira_no?: number;
  boyut?: number;
  mime_type?: string;
  gorsel_tipi?: string;
  kullanim_alani?: string[];
  logo_eklendi?: boolean;
  watermark_applied?: boolean;
  created_at: string;
  updated_at: string;
  kategori?: Kategori;
}

interface Video {
  id: string;
  baslik: string;
  aciklama?: string;
  youtube_url: string;
  youtube_id?: string;
  thumbnail_url?: string;
  kategori?: string;
  aktif: boolean;
  sira_no?: number;
  created_at: string;
  updated_at: string;
}

interface Ayar {
  id: string;
  anahtar: string;
  deger?: string;
  aciklama?: string;
  created_at: string;
  updated_at: string;
}

interface Kampanya {
  id: string;
  kampanya_adi: string;
  platform: string;
  durum: string;
  reklam_metni?: string;
  hedef_url?: string;
  hedef_kitle?: string;
  butce_toplam?: number;
  butce_gunluk?: number;
  baslangic_tarihi?: string;
  bitis_tarihi?: string;
  kategori_id?: string;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

// UserProfile arayüzünden email alanı kaldırıldı
interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // State tanımları
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [fotograflar, setFotograflar] = useState<Fotograf[]>([]);
  const [videolar, setVideolar] = useState<Video[]>([]);
  const [ayarlar, setAyarlar] = useState<Ayar[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  
  // Form state'leri
  const [selectedTab, setSelectedTab] = useState('kategoriler');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Kullanıcı kimlik doğrulama ve yetkilendirme kontrolü
  const checkUserAndLoadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Oturum kontrolü
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Oturum hatası:', sessionError);
        navigate('/auth');
        return;
      }
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Kullanıcı profilini çek
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profil çekme hatası:', profileError);
        navigate('/');
        return;
      }
      
      // Profil yoksa oluştur
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: session.user.id,
            display_name: session.user.email?.split('@')[0] || 'Kullanıcı',
            role: 'user'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Profil oluşturma hatası:', createError);
          navigate('/');
          return;
        }
        
        setUserProfile(newProfile);
        
        // Yeni kullanıcı admin değil, ana sayfaya yönlendir
        navigate('/');
        return;
      }
      
      setUserProfile(profile);
      
      // Admin kontrolü
      if (profile.role !== 'admin') {
        navigate('/');
        return;
      }
      
      setIsAuthorized(true);
      
      // Verileri yükle
      await Promise.all([
        fetchKategoriler(),
        fetchFotograflar(),
        fetchVideolar(),
        fetchAyarlar(),
        fetchKampanyalar()
      ]);
      
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verileri çekme fonksiyonları
  const fetchKategoriler = async () => {
    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .select('*')
        .order('sira_no', { ascending: true });
      
      if (error) throw error;
      setKategoriler(data || []);
    } catch (error) {
      console.error('Kategoriler çekme hatası:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    }
  };
  
  const fetchFotograflar = async () => {
    try {
      const { data, error } = await supabase
        .from('fotograflar')
        .select(`
          *,
          kategori:kategoriler(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFotograflar(data || []);
    } catch (error) {
      console.error('Fotoğraflar çekme hatası:', error);
      toast.error('Fotoğraflar yüklenirken hata oluştu');
    }
  };
  
  const fetchVideolar = async () => {
    try {
      const { data, error } = await supabase
        .from('video_galeri') // 'videolar' yerine 'video_galeri' kullanıldı
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideolar(data || []);
    } catch (error) {
      console.error('Videolar çekme hatası:', error);
      toast.error('Videolar yüklenirken hata oluştu');
    }
  };
  
  const fetchAyarlar = async () => {
    try {
      const { data, error } = await supabase
        .from('ayarlar')
        .select('*')
        .order('anahtar', { ascending: true });
      
      if (error) throw error;
      setAyarlar(data || []);
    } catch (error) {
      console.error('Ayarlar çekme hatası:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    }
  };
  
  const fetchKampanyalar = async () => {
    try {
      const { data, error } = await supabase
        .from('reklam_kampanyalari')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setKampanyalar(data || []);
    } catch (error) {
      console.error('Kampanyalar çekme hatası:', error);
      toast.error('Kampanyalar yüklenirken hata oluştu');
    }
  };
  
  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };
  
  // Component mount edildiğinde çalışacak
  useEffect(() => {
    checkUserAndLoadProfile();
  }, []);
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  // Yetki kontrolü
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Yönetici Paneli
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, {userProfile?.display_name || 'Admin'}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="kategoriler" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Kategoriler
            </TabsTrigger>
            <TabsTrigger value="fotograflar" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Fotoğraflar
            </TabsTrigger>
            <TabsTrigger value="videolar" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videolar
            </TabsTrigger>
            <TabsTrigger value="ayarlar" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </TabsTrigger>
            <TabsTrigger value="kampanyalar" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Kampanyalar
            </TabsTrigger>
          </TabsList>
          
          {/* Kategoriler Tab */}
          <TabsContent value="kategoriler" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Kategoriler</CardTitle>
                    <CardDescription>
                      Hizmet kategorilerini yönetin
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Kategori
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Kategoriler tablosu burada olacak */}
                <div className="text-center py-8 text-gray-500">
                  Kategori yönetimi yakında eklenecek...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Diğer tab içerikleri benzer şekilde eklenecek */}
          <TabsContent value="fotograflar">
            <Card>
              <CardHeader>
                <CardTitle>Fotoğraf Galerisi</CardTitle>
                <CardDescription>Fotoğrafları yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Fotoğraf yönetimi yakında eklenecek...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videolar">
            <Card>
              <CardHeader>
                <CardTitle>Video Galerisi</CardTitle>
                <CardDescription>Videoları yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Video yönetimi yakında eklenecek...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ayarlar">
            <Card>
              <CardHeader>
                <CardTitle>Site Ayarları</CardTitle>
                <CardDescription>Genel ayarları yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Ayarlar yönetimi yakında eklenecek...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="kampanyalar">
            <Card>
              <CardHeader>
                <CardTitle>Reklam Kampanyaları</CardTitle>
                <CardDescription>Kampanyaları yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Kampanya yönetimi yakında eklenecek...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;