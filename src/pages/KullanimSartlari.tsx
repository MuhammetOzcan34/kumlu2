import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoDisplay } from "@/components/LogoDisplay";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export default function KullanimSartlari() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile view */}
      <div className="lg:hidden">
        <HamburgerMenu />
        
        <div className="p-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım Şartları</CardTitle>
                <CardDescription>
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold text-lg mb-3">1. Genel Hükümler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu kullanım şartları, Kumlu Folyo web sitesini kullanırken geçerli olan kuralları 
                    belirler. Sitemizi kullanarak bu şartları kabul etmiş sayılırsınız.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">2. Hizmet Kapsamı</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Kumlu folyo ürünleri ve hizmetleri hakkında bilgi sunma</p>
                    <p>• Online teklif ve hesaplama araçları</p>
                    <p>• İletişim formu aracılığıyla müşteri hizmetleri</p>
                    <p>• Instagram paylaşımlarını gösterme</p>
                    <p>• Ürün galerisi ve referanslar</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">3. Kullanıcı Sorumlulukları</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Sitede verilen bilgilerin doğruluğunu kontrol etmek</p>
                    <p>• Yasalara uygun kullanım yapmak</p>
                    <p>• Başkalarının haklarına saygı göstermek</p>
                    <p>• Güvenlik önlemlerini almak</p>
                    <p>• Telif haklarına uymak</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">4. Fikri Mülkiyet Hakları</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sitedeki tüm içerik, tasarım, logo, marka ve yazılım Kumlu Folyo'nun 
                    fikri mülkiyeti altındadır. Bu içeriklerin izinsiz kullanımı yasaktır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">5. Sorumluluk Sınırları</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kumlu Folyo, sitedeki bilgilerin doğruluğu konusunda azami özen göstermekle 
                    birlikte, bu bilgilerin kullanımından doğabilecek zararlardan sorumlu değildir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">6. Instagram Entegrasyonu</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Instagram paylaşımları Instagram Basic Display API aracılığıyla gösterilir</p>
                    <p>• Paylaşımlar Instagram'ın kullanım şartlarına tabidir</p>
                    <p>• Instagram verilerinin kullanımı Instagram'ın gizlilik politikasına uygun olmalıdır</p>
                    <p>• Kullanıcılar Instagram hesaplarını bağlarken gerekli izinleri vermelidir</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">7. Hizmet Kesintileri</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Teknik bakım, güncelleme veya diğer nedenlerle hizmet kesintileri yaşanabilir. 
                    Bu durumlar önceden haber verilmeden gerçekleşebilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">8. Değişiklikler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu kullanım şartları zaman zaman güncellenebilir. Önemli değişiklikler 
                    olduğunda kullanıcılar bilgilendirilecektir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">9. Uyuşmazlık Çözümü</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu şartlardan doğan uyuşmazlıklar Türkiye Cumhuriyeti mahkemelerinde 
                    çözülecektir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">10. İletişim</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kullanım şartlarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p>E-posta: info@kumlufolyo.com</p>
                    <p>Telefon: +90 XXX XXX XX XX</p>
                    <p>Adres: [Şirket Adresi]</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <MobileNavigation />
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
              <LogoDisplay />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Kullanım Şartları</CardTitle>
                <CardDescription className="text-lg">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 text-base">
                <div>
                  <h3 className="font-semibold text-xl mb-4">1. Genel Hükümler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu kullanım şartları, Kumlu Folyo web sitesini kullanırken geçerli olan kuralları 
                    belirler. Sitemizi kullanarak bu şartları kabul etmiş sayılırsınız.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">2. Hizmet Kapsamı</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• Kumlu folyo ürünleri ve hizmetleri hakkında bilgi sunma</p>
                    <p>• Online teklif ve hesaplama araçları</p>
                    <p>• İletişim formu aracılığıyla müşteri hizmetleri</p>
                    <p>• Instagram paylaşımlarını gösterme</p>
                    <p>• Ürün galerisi ve referanslar</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">3. Kullanıcı Sorumlulukları</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• Sitede verilen bilgilerin doğruluğunu kontrol etmek</p>
                    <p>• Yasalara uygun kullanım yapmak</p>
                    <p>• Başkalarının haklarına saygı göstermek</p>
                    <p>• Güvenlik önlemlerini almak</p>
                    <p>• Telif haklarına uymak</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">4. Fikri Mülkiyet Hakları</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sitedeki tüm içerik, tasarım, logo, marka ve yazılım Kumlu Folyo'nun 
                    fikri mülkiyeti altındadır. Bu içeriklerin izinsiz kullanımı yasaktır.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">5. Sorumluluk Sınırları</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kumlu Folyo, sitedeki bilgilerin doğruluğu konusunda azami özen göstermekle 
                    birlikte, bu bilgilerin kullanımından doğabilecek zararlardan sorumlu değildir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">6. Instagram Entegrasyonu</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• Instagram paylaşımları Instagram Basic Display API aracılığıyla gösterilir</p>
                    <p>• Paylaşımlar Instagram'ın kullanım şartlarına tabidir</p>
                    <p>• Instagram verilerinin kullanımı Instagram'ın gizlilik politikasına uygun olmalıdır</p>
                    <p>• Kullanıcılar Instagram hesaplarını bağlarken gerekli izinleri vermelidir</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">7. Hizmet Kesintileri</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Teknik bakım, güncelleme veya diğer nedenlerle hizmet kesintileri yaşanabilir. 
                    Bu durumlar önceden haber verilmeden gerçekleşebilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">8. Değişiklikler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu kullanım şartları zaman zaman güncellenebilir. Önemli değişiklikler 
                    olduğunda kullanıcılar bilgilendirilecektir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">9. Uyuşmazlık Çözümü</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu şartlardan doğan uyuşmazlıklar Türkiye Cumhuriyeti mahkemelerinde 
                    çözülecektir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">10. İletişim</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kullanım şartlarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="mt-4 space-y-2 text-muted-foreground">
                    <p>E-posta: info@kumlufolyo.com</p>
                    <p>Telefon: +90 XXX XXX XX XX</p>
                    <p>Adres: [Şirket Adresi]</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 