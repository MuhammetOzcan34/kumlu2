import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ReferenceLogos } from "@/components/ReferenceLogos";
import { useSetting } from "@/hooks/useSettings";

const Referanslar = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";

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
          {/* Reference Company Logos */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Referans Firmalarımız</h1>
            <p className="text-muted-foreground">
              Birlikte çalıştığımız değerli firmalar
            </p>
          </div>
          <ReferenceLogos />
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Referanslar;