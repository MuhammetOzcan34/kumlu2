import { useState, useEffect } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useSetting } from "@/hooks/useSettings";
import { useHesaplamaUrunleri } from "@/hooks/useHesaplamaUrunleri";
import { useServisBedelleri } from "@/hooks/useServisBedelleri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TeklifFormu } from "@/components/TeklifFormu";
import { Calculator, AlertCircle, MapPin, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HesaplamaSonuc {
  malzemeFiyati: number;
  montajFiyati: number;
  servisBedeli: number;
  toplamFiyat: number;
  metrekare: number;
}

const Hesaplama = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: urunler, isLoading: urunlerLoading } = useHesaplamaUrunleri();
  const { data: servisBedelleri, isLoading: servisLoading } = useServisBedelleri();
  
  // Form state'leri
  const [selectedUrun, setSelectedUrun] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [ekOzellikler, setEkOzellikler] = useState<string[]>([]);
  const [montajIsteniyor, setMontajIsteniyor] = useState(false);
  const [sehir, setSehir] = useState("");
  const [ilce, setIlce] = useState("");
  
  // Sonuç state'i
  const [sonuc, setSonuc] = useState<HesaplamaSonuc | null>(null);
  const [showResult, setShowResult] = useState(false);

  // İstanbul ilçeleri
  const istanbulIlceleri = [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", 
    "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", 
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", 
    "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", 
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", 
    "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", 
    "Üsküdar", "Zeytinburnu"
  ];

  const hesaplaFiyat = () => {
    if (!selectedUrun || !width || !height) return;

    const metrekare = (parseFloat(width) * parseFloat(height)) / 10000; // cm² to m²
    const urun = urunler?.find(u => u.id === selectedUrun);
    
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

    // Minimum montaj alanı kontrolü
    const montajMetrekare = montajIsteniyor ? Math.max(metrekare, 10) : 0;
    
    const malzemeFiyati = metrekare * fiyat.malzeme_fiyat;
    const montajFiyati = montajIsteniyor ? montajMetrekare * fiyat.montaj_fiyat : 0;
    
    // Servis bedeli hesaplama
    let servisBedeli = 0;
    if (montajIsteniyor && ilce) {
      const servisBedeliData = servisBedelleri?.find(sb => 
        sb.hizmet_adi.toLowerCase().includes(ilce.toLowerCase())
      );
      if (servisBedeliData) {
        servisBedeli = servisBedeliData.birim_fiyat;
      }
    }
    
    const toplamFiyat = malzemeFiyati + montajFiyati + servisBedeli;

    setSonuc({
      malzemeFiyati,
      montajFiyati,
      servisBedeli,
      toplamFiyat,
      metrekare
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

  if (urunlerLoading || servisLoading) {
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
              <CardContent className="space-y-6">
                {/* 1. Malzeme Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="malzeme">1. Malzeme Seçiniz</Label>
                  <Select value={selectedUrun} onValueChange={setSelectedUrun}>
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
                
                {/* 2. En/Boy Girişi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">2. En Giriniz (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Boy Giriniz (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </div>
                
                {/* 3. Ek Özellik Seçimi */}
                <div className="space-y-2">
                  <Label>3. Ek Özellik Seçiniz</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["UV Korumalı", "Yansıtıcı", "Özel Kesim", "Hızlı Teslimat"].map((ozellik) => (
                      <div key={ozellik} className="flex items-center space-x-2">
                        <Checkbox
                          id={ozellik}
                          checked={ekOzellikler.includes(ozellik)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEkOzellikler([...ekOzellikler, ozellik]);
                            } else {
                              setEkOzellikler(ekOzellikler.filter(o => o !== ozellik));
                            }
                          }}
                        />
                        <Label htmlFor={ozellik} className="text-sm">{ozellik}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 4. Uygulama & Montaj */}
                <div className="space-y-2">
                  <Label>4. Uygulama & Montaj</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="montaj"
                      checked={montajIsteniyor}
                      onCheckedChange={(checked) => setMontajIsteniyor(checked as boolean)}
                    />
                    <Label htmlFor="montaj">İstiyorum</Label>
                  </div>
                  
                  {montajIsteniyor && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sadece İstanbul için uygulama & Montaj hizmeti verilmektedir.
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
                
                {/* 5. Şehir Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="sehir">5. Şehir Seçiniz</Label>
                  <Select value={sehir} onValueChange={setSehir} disabled={montajIsteniyor}>
                    <SelectTrigger>
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
                
                {/* 6. İlçe Seçimi (sadece İstanbul için) */}
                {sehir === "İstanbul" && (
                  <div className="space-y-2">
                    <Label htmlFor="ilce">6. İlçe Seçiniz</Label>
                    <Select value={ilce} onValueChange={setIlce}>
                      <SelectTrigger>
                        <SelectValue placeholder="İlçe seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {istanbulIlceleri.map((ilce) => (
                          <SelectItem key={ilce} value={ilce}>
                            {ilce}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  onClick={hesaplaFiyat} 
                  className="w-full"
                  disabled={!selectedUrun || !width || !height}
                >
                  Hesapla
                </Button>
                
                {showResult && sonuc && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Hesaplama Sonucu</p>
                      <p className="text-3xl font-bold text-primary">₺{sonuc.toplamFiyat.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Toplam Alan: {sonuc.metrekare.toFixed(2)} m²
                      </p>
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
                    
                    <div className="text-xs text-muted-foreground text-center">
                      * Bu fiyat tahmini olup, kesin fiyat için iletişime geçin
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
                <p>• Hesaplama sonuçları tahmini olup, gerçek fiyatlar değişkenlik gösterebilir</p>
                <p>• Montaj hizmeti sadece İstanbul için verilmektedir</p>
                <p>• Minimum montaj alanı 10m² olarak hesaplanır</p>
                <p>• İlçeye göre servis bedeli eklenir</p>
                <p>• Özel tasarım ve karmaşık işler için detaylı fiyat teklifi verilir</p>
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