import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleMap } from "@/components/GoogleMap";
import { ContactForm } from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Iletisim = () => {
  const firmaAdres = useSetting("firma_adres") || "";
  const firmaTelefon = useSetting("firma_telefon") || "";
  const firmaEmail = useSetting("firma_email") || "";
  const firmaCalismaSaatleri = useSetting("firma_calisma_saatleri") || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Phone Button - Sadece telefon numarası varsa göster */}
      {firmaTelefon && <PhoneButton phoneNumber={firmaTelefon} />}
      
      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="pt-20 lg:pt-8 px-4 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">İletişim</h1>
            <p className="text-muted-foreground">
              Bizimle iletişime geçin, size yardımcı olalım
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <ContactForm />
            
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {firmaAdres && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Adres</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {firmaAdres}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {firmaTelefon && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Telefon</h4>
                        <p className="text-sm text-muted-foreground">
                          {firmaTelefon}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {firmaEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">E-posta</h4>
                        <p className="text-sm text-muted-foreground">
                          {firmaEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {firmaCalismaSaatleri && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Çalışma Saatleri</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {firmaCalismaSaatleri}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Google Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Konum</CardTitle>
                </CardHeader>
                <CardContent>
                  <GoogleMap />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Iletisim;