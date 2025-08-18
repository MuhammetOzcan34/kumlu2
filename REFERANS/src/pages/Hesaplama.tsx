import { useState } from "react";
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
import { Calculator } from "lucide-react";

const Hesaplama = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: urunler, isLoading } = useHesaplamaUrunleri();
  const [serviceType, setServiceType] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [result, setResult] = useState(0);

  const calculatePrice = () => {
    const selectedService = urunler?.find(u => u.id === serviceType);
    if (!selectedService || !width || !height) return;

    const area = (parseFloat(width) * parseFloat(height)) / 10000; // cm² to m²
    const totalPrice = area * selectedService.birim_fiyat * parseInt(quantity);
    setResult(totalPrice);
  };

  if (isLoading) {
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
            <p className="text-muted-foreground">
              Proje maliyetinizi kolayca hesaplayın
            </p>
          </div>
          
          {/* Calculator */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Maliyet Hesaplayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Hizmet Türü</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hizmet türünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {urunler?.map((urun) => (
                        <SelectItem key={urun.id} value={urun.id}>
                          {urun.ad} - ₺{urun.birim_fiyat}/{urun.birim}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Genişlik (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Yükseklik (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Adet</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
                
                <Button 
                  onClick={calculatePrice} 
                  className="w-full"
                  disabled={!serviceType || !width || !height}
                >
                  Hesapla
                </Button>
                
                {result > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Tahmini Maliyet</p>
                    <p className="text-2xl font-bold text-primary">₺{result.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Bu fiyat tahmini olup, kesin fiyat için iletişime geçin
                    </p>
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
                <p>• Montaj bedelleri ayrı olarak hesaplanır</p>
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