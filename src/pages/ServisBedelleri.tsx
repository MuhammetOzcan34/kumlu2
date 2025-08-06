import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeklifFormu } from "@/components/TeklifFormu";

const ServisBedelleri = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";

  const services = [
    {
      category: "Cam Kumlama",
      items: [
        { name: "Basit Kumlama", price: "₺50/m²", description: "Tek renk basit desenler" },
        { name: "Detaylı Kumlama", price: "₺80/m²", description: "Karmaşık desenler ve yazılar" },
        { name: "Renkli Kumlama", price: "₺120/m²", description: "Çok renkli detaylı çalışmalar" }
      ]
    },
    {
      category: "Tabelalar",
      items: [
        { name: "Alüminyum Tabela", price: "₺200/m²", description: "Standart alüminyum tabela" },
        { name: "Kutu Harf", price: "₺300/harf", description: "Işıklı kutu harf uygulaması" },
        { name: "Pleksi Tabela", price: "₺150/m²", description: "Renkli pleksi tabela" }
      ]
    },
    {
      category: "Dijital Baskı",
      items: [
        { name: "Vinil Baskı", price: "₺25/m²", description: "Dış mekan vinil baskı" },
        { name: "Folyo Uygulama", price: "₺35/m²", description: "Cam ve yüzey folyo" },
        { name: "Mesh Baskı", price: "₺15/m²", description: "Çit mesh baskı" }
      ]
    }
  ];

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
            <h1 className="text-3xl font-bold mb-4">Servis ve Montaj Bedelleri</h1>
            <p className="text-muted-foreground mb-4">
              Güncel fiyat listesi ve hizmet bedelleri
            </p>
            <TeklifFormu 
              triggerButtonText="💰 Özel Fiyat Teklifi Al"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            />
          </div>
          
          {/* Price Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.category} className="h-fit">
                <CardHeader>
                  <CardTitle className="text-primary">{service.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.items.map((item, index) => (
                    <div key={index} className="border-b border-border pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <span className="text-primary font-bold">{item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Önemli Notlar</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Fiyatlar KDV dahil olup, 2024 yılı için geçerlidir</li>
              <li>• Montaj bedelleri ayrı olarak hesaplanır</li>
              <li>• Minimum iş tutarı 500₺'dir</li>
              <li>• Özel projeler için detaylı fiyat teklifi verilir</li>
              <li>• Toplu işlerde indirim uygulanır</li>
            </ul>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default ServisBedelleri;