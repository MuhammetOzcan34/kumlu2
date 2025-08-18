import { useState, useEffect } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useSetting } from "@/hooks/useSettings";
import { useHesaplamaUrunleri } from "@/hooks/useHesaplamaUrunleri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TeklifFormu } from "@/components/TeklifFormu";
import { Calculator, AlertCircle, Package, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AlanBilgisi {
  id: string;
  malzeme: string;
  en: string;
  boy: string;
}

interface HesaplamaSonuc {
  malzemeFiyati: number;
  montajFiyati: number;
  servisBedeli: number;
  toplamFiyat: number;
  toplamMetrekare: number;
  alanDetaylari: {
    id: string;
    malzeme: string;
    en: number;
    boy: number;
    metrekare: number;
    birimFiyat: number;
    toplamFiyat: number;
  }[];
}

const Hesaplama = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: urunler, isLoading: urunlerLoading } = useHesaplamaUrunleri();
  
  // Form state'leri
  const [alanlar, setAlanlar] = useState<AlanBilgisi[]>([
    { id: '1', malzeme: '', en: '', boy: '' }
  ]);
  const [montajIsteniyor, setMontajIsteniyor] = useState(false);
  const [sehir, setSehir] = useState("");
  const [ilce, setIlce] = useState("");
  
  // Sonuç state'i
  const [sonuc, setSonuc] = useState<HesaplamaSonuc | null>(null);
  const [showResult, setShowResult] = useState(false);
  


  // İstanbul ilçeleri ve servis bedelleri (Google Sheets'ten)
  const istanbulServisBedelleri = {
    "Adalar": 150,
    "Arnavutköy": 80,
    "Ataşehir": 60,
    "Avcılar": 90,
    "Bağcılar": 70,
    "Bahçelievler": 50,
    "Bakırköy": 40,
    "Başakşehir": 75,
    "Bayrampaşa": 65,
    "Beşiktaş": 30,
    "Beykoz": 100,
    "Beylikdüzü": 85,
    "Beyoğlu": 35,
    "Büyükçekmece": 95,
    "Çatalca": 120,
    "Çekmeköy": 70,
    "Esenler": 75,
    "Esenyurt": 80,
    "Eyüpsultan": 60,
    "Fatih": 25,
    "Gaziosmanpaşa": 70,
    "Güngören": 55,
    "Kadıköy": 45,
    "Kağıthane": 65,
    "Kartal": 75,
    "Küçükçekmece": 70,
    "Maltepe": 80,
    "Pendik": 85,
    "Sancaktepe": 75,
    "Sarıyer": 90,
    "Silivri": 110,
    "Sultanbeyli": 80,
    "Sultangazi": 70,
    "Şile": 130,
    "Şişli": 40,
    "Tuzla": 90,
    "Ümraniye": 65,
    "Üsküdar": 55,
    "Zeytinburnu": 50
  };

  const istanbulIlceleri = Object.keys(istanbulServisBedelleri);

  // Alan ekleme fonksiyonu
  const alanEkle = () => {
    const yeniAlan: AlanBilgisi = {
      id: Date.now().toString(),
      malzeme: '',
      en: '',
      boy: ''
    };
    setAlanlar([...alanlar, yeniAlan]);
  };

  // Alan silme fonksiyonu
  const alanSil = (id: string) => {
    if (alanlar.length > 1) {
      setAlanlar(alanlar.filter(alan => alan.id !== id));
    }
  };

  // Alan güncelleme fonksiyonu
  const alanGuncelle = (id: string, field: keyof AlanBilgisi, value: string | string[]) => {
    setAlanlar(alanlar.map(alan => 
      alan.id === id ? { ...alan, [field]: value } : alan
    ));
  };




  const hesaplaFiyat = () => {
    if (!alanlar.every(alan => alan.malzeme && alan.en && alan.boy)) {
      return;
    }

    let toplamMalzemeFiyati = 0;
    let toplamMontajFiyati = 0;
    let toplamMetrekare = 0;
    const alanDetaylari: {
      id: string;
      malzeme: string;
      metrekare: number;
      malzemeFiyati: number;
      montajFiyati: number;
    }[] = [];



    // Her alan için hesaplama
    alanlar.forEach(alan => {
      const metrekare = (parseFloat(alan.en) * parseFloat(alan.boy)) / 10000; // cm² to m²
      const urun = urunler?.find(u => u.id === alan.malzeme);
      
      if (!urun || !urun.fiyatlar?.length) return;

      // Metrekare aralığına göre fiyat bul
      let fiyat = urun.fiyatlar.find(f => 
        metrekare >= f.metrekare_min && metrekare <= f.metrekare_max
      );

      // Eğer aralık bulunamazsa en yakın aralığı kullan
      if (!fiyat) {
        fiyat = urun.fiyatlar.reduce((prev, curr) => {
          const prevDiff = Math.abs(metrekare - (prev.metrekare_min + prev.metrekare_max) / 2);
          const currDiff = Math.abs(metrekare - (curr.metrekare_min + curr.metrekare_max) / 2);
          return prevDiff < currDiff ? prev : curr;
        });
      }

      if (!fiyat) return;

      const malzemeFiyati = metrekare * fiyat.malzeme_fiyat;
      const montajFiyati = montajIsteniyor ? metrekare * fiyat.montaj_fiyat : 0;



      toplamMalzemeFiyati += malzemeFiyati;
      toplamMontajFiyati += montajFiyati;
      toplamMetrekare += metrekare;

      alanDetaylari.push({
        id: alan.id,
        malzeme: urun.ad,
        metrekare,
        malzemeFiyati,
        montajFiyati
      });
    });

    // Minimum montaj alanı kontrolü (toplam alan için)
    if (montajIsteniyor && toplamMetrekare < 10) {
      const ekMontajFiyati = (10 - toplamMetrekare) * (alanDetaylari[0]?.montajFiyati / alanDetaylari[0]?.metrekare || 0);
      toplamMontajFiyati += ekMontajFiyati;
    }
    
    // Servis bedeli hesaplama
    let servisBedeli = 0;
    if (montajIsteniyor && ilce && istanbulServisBedelleri[ilce as keyof typeof istanbulServisBedelleri]) {
      servisBedeli = istanbulServisBedelleri[ilce as keyof typeof istanbulServisBedelleri];
    }
    
    const toplamFiyat = toplamMalzemeFiyati + toplamMontajFiyati + servisBedeli;

    setSonuc({
      malzemeFiyati: toplamMalzemeFiyati,
      montajFiyati: toplamMontajFiyati,
      servisBedeli,
      toplamFiyat,
      toplamMetrekare,
      alanDetaylari
    });
    setShowResult(true);
  };

  // Şehir değiştiğinde ilçeyi sıfırla
  useEffect(() => {
    if (sehir !== "İstanbul") {
      setIlce("");
    }
  }, [sehir]);

  // Montaj seçimi değiştiğinde şehir kontrolü
  useEffect(() => {
    if (montajIsteniyor) {
      setSehir("İstanbul");
    }
  }, [montajIsteniyor]);

  if (urunlerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Phone Button */}
      <PhoneButton phoneNumber={phoneNumber} />
      
      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="pt-20 lg:pt-8 px-4 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Hesaplama</h1>
            <p className="text-muted-foreground mb-4">
              Proje maliyetinizi kolayca hesaplayın
            </p>
            <TeklifFormu 
              triggerButtonText="📋 Detaylı Teklif Al"
              className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
            />
          </div>
          
          {/* Calculator */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Maliyet Hesaplayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Ölçü Alanı Ekleme Butonu Kaldırıldı - Artık her alan kartının altında */}

                {/* Alan Bilgileri */}
                <div className="space-y-6">
                  {/* Alan Listesi */}
                  {alanlar.map((alan, index) => (
                    <div key={alan.id} className="space-y-4 p-6 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xl font-semibold">
                          Alan Ölçüsü {index + 1}
                        </Label>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => alanSil(alan.id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Malzeme Seçimi */}
                        <div className="space-y-2">
                          <Label>Malzeme Seçiniz</Label>
                          <Select 
                            value={alan.malzeme} 
                            onValueChange={(value) => alanGuncelle(alan.id, 'malzeme', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Malzeme türünü seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {urunler?.map((urun) => (
                                <SelectItem key={urun.id} value={urun.id}>
                                  {urun.ad}
                                </SelectItem>
                              )) || []}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* En/Boy Girişi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>En Giriniz (cm)</Label>
                            <Input
                              type="number"
                              value={alan.en}
                              onChange={(e) => alanGuncelle(alan.id, 'en', e.target.value)}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Boy Giriniz (cm)</Label>
                            <Input
                              type="number"
                              value={alan.boy}
                              onChange={(e) => alanGuncelle(alan.id, 'boy', e.target.value)}
                              placeholder="50"
                            />
                          </div>
                        </div>
                        
                        {/* Metrekare Gösterimi */}
                        {alan.en && alan.boy && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">
                              Alan: {((parseFloat(alan.en) * parseFloat(alan.boy)) / 10000).toFixed(2)} m²
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Daha Fazla Ölçü Alanı Ekle Butonu - Her kartın altında */}
                      <div className="pt-4 border-t border-border/50">
                        <Button
                          onClick={alanEkle}
                          variant="outline"
                          className="w-full text-sm py-3 px-4 border-dashed border-2 hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          Daha Fazla Ölçü Alanı Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Montaj Hizmeti Seçimi */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="text-xl font-semibold text-primary">Montaj Hizmeti Seçimi</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ürününüzü nasıl teslim almak istiyorsunuz?
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sadece Ürün Seçeneği */}
                    <div className="relative">
                      <input
                        type="radio"
                        id="sadece-urun"
                        name="montaj-secimi"
                        checked={!montajIsteniyor}
                        onChange={() => setMontajIsteniyor(false)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="sadece-urun"
                        className={`block p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          !montajIsteniyor
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border hover:border-primary/70 hover:bg-primary/5'
                        }`}
                      >
                        <div className="text-center space-y-3">
                          <div className="text-4xl">📦</div>
                          <div className="font-semibold text-lg flex items-center justify-center gap-2">
                            {!montajIsteniyor && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>}
                            {montajIsteniyor && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                            Sadece Ürün
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ürünü kargo ile alacağım veya mağazadan teslim alacağım
                          </div>
                          <div className="text-xs font-medium text-green-600">
                            ✓ Daha ekonomik
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {/* Montaj + Ürün Seçeneği */}
                    <div className="relative">
                      <input
                        type="radio"
                        id="montaj-dahil"
                        name="montaj-secimi"
                        checked={montajIsteniyor}
                        onChange={() => setMontajIsteniyor(true)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="montaj-dahil"
                        className={`block p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          montajIsteniyor
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border hover:border-primary/70 hover:bg-primary/5'
                        }`}
                      >
                        <div className="text-center space-y-3">
                          <div className="text-4xl">🔧</div>
                          <div className="font-semibold text-lg flex items-center justify-center gap-2">
                            {montajIsteniyor && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>}
                            {!montajIsteniyor && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                            Ürün + Montaj
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Profesyonel ekibimiz adresinize gelip montajını yapsın.
                          </div>
                          <div className="text-xs font-medium text-blue-600">
                            ✓ Sadece İstanbul
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {montajIsteniyor && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sadece İstanbul için uygulama & Montaj hizmeti verilmektedir. 
                        En az 10m² olması gerekli, 10m² küçük toplam için 10 m² montaj uygulama fiyatı hesaplanıp eklenmeli.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {!montajIsteniyor && (
                    <Alert>
                      <Package className="h-4 w-4" />
                      <AlertDescription>
                        Kargo ücreti fiyatlara dahil değildir ve alıcıya aittir. 
                        Ürünleri dilerseniz İstanbul / Ümraniye ilçesinden elden teslim alabilirsiniz.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Şehir Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="sehir">Şehir Seçiniz</Label>
                  <Select value={sehir} onValueChange={setSehir} disabled={montajIsteniyor}>
                    <SelectTrigger id="sehir" name="sehir">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="İstanbul">İstanbul</SelectItem>
                      <SelectItem value="Ankara">Ankara</SelectItem>
                      <SelectItem value="İzmir">İzmir</SelectItem>
                      <SelectItem value="Bursa">Bursa</SelectItem>
                      <SelectItem value="Antalya">Antalya</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* İlçe Seçimi (sadece İstanbul için) */}
                {sehir === "İstanbul" && (
                  <div className="space-y-2">
                    <Label htmlFor="ilce">İlçe Seçiniz</Label>
                    <Select value={ilce} onValueChange={setIlce}>
                      <SelectTrigger id="ilce" name="ilce">
                        <SelectValue placeholder="İlçe seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {istanbulIlceleri.map((ilce) => (
                          <SelectItem key={ilce} value={ilce}>
                            {ilce} - ₺{istanbulServisBedelleri[ilce as keyof typeof istanbulServisBedelleri]} servis bedeli
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  onClick={hesaplaFiyat} 
                  className="w-full"
                >
                  Hesapla
                </Button>
                
                {showResult && sonuc && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Hesaplama Sonucu</p>
                      <p className="text-3xl font-bold text-primary">₺{sonuc.toplamFiyat.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium text-orange-600">KDV Hariç</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Toplam Alan: {sonuc.toplamMetrekare.toFixed(2)} m²
                      </p>
                    </div>

                    {/* Alan Detayları */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Alan Detayları:</h4>
                      {sonuc.alanDetaylari.map((alan, index) => (
                        <div key={alan.id} className="bg-background p-3 rounded border">
                          <p className="font-medium">Alan Ölçüsü {index + 1}: {alan.malzeme}</p>
                          <p className="text-sm text-muted-foreground">
                            {alan.metrekare.toFixed(2)} m² - 
                            Malzeme: ₺{alan.malzemeFiyati.toFixed(2)}
                            {montajIsteniyor && ` - Montaj: ₺${alan.montajFiyati.toFixed(2)}`}
                          </p>

                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-background p-3 rounded">
                        <p className="font-medium">Malzeme Fiyatı</p>
                        <p className="text-primary">₺{sonuc.malzemeFiyati.toFixed(2)}</p>
                      </div>
                      {montajIsteniyor && (
                        <div className="bg-background p-3 rounded">
                          <p className="font-medium">Montaj Fiyatı</p>
                          <p className="text-primary">₺{sonuc.montajFiyati.toFixed(2)}</p>
                        </div>
                      )}
                      {montajIsteniyor && sonuc.servisBedeli > 0 && (
                        <div className="bg-background p-3 rounded">
                          <p className="font-medium">Servis Bedeli</p>
                          <p className="text-primary">₺{sonuc.servisBedeli.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>* Bu fiyat tahmini olup, kesin fiyat için iletişime geçin</p>
                      <p className="font-medium text-orange-600">* Tüm fiyatlar KDV hariçtir</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Hesaplama Hakkında</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Birden fazla alan ekleyebilir ve her alan için farklı malzeme seçebilirsiniz</p>
                <p>• Hesaplama sonuçları tahmini olup, gerçek fiyatlar değişkenlik gösterebilir</p>
                <p>• Montaj hizmeti sadece İstanbul için verilmektedir</p>
                <p>• Minimum montaj alanı 10m² olarak hesaplanır</p>
                <p>• İlçeye göre servis bedeli eklenir</p>
                <p>• Özel tasarım ve karmaşık işler için detaylı fiyat teklifi verilir</p>
                <p className="font-medium text-orange-600">• Tüm fiyatlar KDV hariçtir</p>
                <p>• Kesin fiyat için lütfen bizimle iletişime geçin</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Hesaplama;