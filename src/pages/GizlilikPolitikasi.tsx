import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoDisplay } from "@/components/LogoDisplay";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";

export default function GizlilikPolitikasi() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile view */}
      <div className="lg:hidden">
        <HamburgerMenu />
        
        <div className="p-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Gizlilik Politikası</CardTitle>
                <CardDescription>
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold text-lg mb-3">1. Giriş</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kumlu Folyo olarak, kişisel verilerinizin güvenliği bizim için çok önemlidir. 
                    Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde hangi bilgileri topladığımızı, 
                    bu bilgileri nasıl kullandığımızı ve koruduğumuzu açıklar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">2. Topladığımız Bilgiler</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>İletişim Bilgileri:</strong> İletişim formu aracılığıyla gönderdiğiniz ad, e-posta, telefon numarası</p>
                    <p>• <strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, işletim sistemi, sayfa ziyaret süreleri</p>
                    <p>• <strong>Instagram Verileri:</strong> Instagram Basic Display API aracılığıyla paylaştığınız Instagram paylaşımları</p>
                    <p>• <strong>Çerezler:</strong> Sitenin işlevselliğini artırmak için kullanılan çerezler</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">3. Bilgilerin Kullanımı</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Hizmetlerimizi sunmak ve iyileştirmek</p>
                    <p>• Müşteri desteği sağlamak</p>
                    <p>• Yasal yükümlülükleri yerine getirmek</p>
                    <p>• Güvenliği sağlamak</p>
                    <p>• Instagram paylaşımlarınızı web sitemizde göstermek</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">4. Bilgi Paylaşımı</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kişisel verilerinizi üçüncü taraflarla paylaşmayız, ancak yasal zorunluluklar 
                    veya hizmet sağlayıcılarımızla sınırlı paylaşım yapabiliriz. Instagram verileri 
                    sadece Instagram Basic Display API aracılığıyla alınır ve sadece web sitemizde gösterilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">5. Veri Güvenliği</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz. 
                    SSL şifreleme, güvenli sunucular ve düzenli güvenlik güncellemeleri kullanıyoruz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">6. Çerezler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. 
                    Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">7. Haklarınız</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Kişisel verilerinize erişim hakkı</p>
                    <p>• Verilerinizin düzeltilmesi hakkı</p>
                    <p>• Verilerinizin silinmesi hakkı</p>
                    <p>• İşlemeye itiraz etme hakkı</p>
                    <p>• Veri taşınabilirliği hakkı</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">8. İletişim</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p>E-posta: info@kumlufolyo.com</p>
                    <p>Telefon: +90 XXX XXX XX XX</p>
                    <p>Adres: [Şirket Adresi]</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">9. Değişiklikler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu gizlilik politikasını zaman zaman güncelleyebiliriz. 
                    Önemli değişiklikler olduğunda sizi bilgilendireceğiz.
                  </p>
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
                <CardTitle className="text-3xl">Gizlilik Politikası</CardTitle>
                <CardDescription className="text-lg">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 text-base">
                <div>
                  <h3 className="font-semibold text-xl mb-4">1. Giriş</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kumlu Folyo olarak, kişisel verilerinizin güvenliği bizim için çok önemlidir. 
                    Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde hangi bilgileri topladığımızı, 
                    bu bilgileri nasıl kullandığımızı ve koruduğumuzu açıklar.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">2. Topladığımız Bilgiler</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• <strong>İletişim Bilgileri:</strong> İletişim formu aracılığıyla gönderdiğiniz ad, e-posta, telefon numarası</p>
                    <p>• <strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, işletim sistemi, sayfa ziyaret süreleri</p>
                    <p>• <strong>Instagram Verileri:</strong> Instagram Basic Display API aracılığıyla paylaştığınız Instagram paylaşımları</p>
                    <p>• <strong>Çerezler:</strong> Sitenin işlevselliğini artırmak için kullanılan çerezler</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">3. Bilgilerin Kullanımı</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• Hizmetlerimizi sunmak ve iyileştirmek</p>
                    <p>• Müşteri desteği sağlamak</p>
                    <p>• Yasal yükümlülükleri yerine getirmek</p>
                    <p>• Güvenliği sağlamak</p>
                    <p>• Instagram paylaşımlarınızı web sitemizde göstermek</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">4. Bilgi Paylaşımı</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Kişisel verilerinizi üçüncü taraflarla paylaşmayız, ancak yasal zorunluluklar 
                    veya hizmet sağlayıcılarımızla sınırlı paylaşım yapabiliriz. Instagram verileri 
                    sadece Instagram Basic Display API aracılığıyla alınır ve sadece web sitemizde gösterilir.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">5. Veri Güvenliği</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz. 
                    SSL şifreleme, güvenli sunucular ve düzenli güvenlik güncellemeleri kullanıyoruz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">6. Çerezler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Web sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. 
                    Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">7. Haklarınız</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>• Kişisel verilerinize erişim hakkı</p>
                    <p>• Verilerinizin düzeltilmesi hakkı</p>
                    <p>• Verilerinizin silinmesi hakkı</p>
                    <p>• İşlemeye itiraz etme hakkı</p>
                    <p>• Veri taşınabilirliği hakkı</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">8. İletişim</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="mt-4 space-y-2 text-muted-foreground">
                    <p>E-posta: info@kumlufolyo.com</p>
                    <p>Telefon: +90 XXX XXX XX XX</p>
                    <p>Adres: [Şirket Adresi]</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-4">9. Değişiklikler</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bu gizlilik politikasını zaman zaman güncelleyebiliriz. 
                    Önemli değişiklikler olduğunda sizi bilgilendireceğiz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 