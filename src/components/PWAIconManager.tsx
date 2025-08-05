import { useEffect } from 'react';
import { useSetting } from '@/hooks/useSettings';

export const PWAIconManager = () => {
  const companyLogo = useSetting('firma_logo_url');
  const companyName = useSetting('firma_adi');

  useEffect(() => {
    if (companyLogo) {
      updateFavicon(companyLogo);
      updateManifestName(companyName);
      console.log('✅ PWA favicon updated with company logo');
    }
  }, [companyLogo, companyName]);

  const updateFavicon = (logoUrl: string) => {
    // Logo URL'sini oluştur
    const getFullLogoUrl = (logoPath: string) => {
      if (logoPath.startsWith('http')) {
        return logoPath;
      }
      // Eğer sadece dosya adı ise, tam URL oluştur
      if (logoPath && !logoPath.includes('/')) {
        return `https://aqewamsbifugrevmoiqj.supabase.co/storage/v1/object/public/fotograflar/${logoPath}`;
      }
      return logoPath;
    };

    const fullLogoUrl = getFullLogoUrl(logoUrl);
    console.log('🔗 PWAIconManager - Favicon URL:', fullLogoUrl);

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = fullLogoUrl;
    }

    // Update apple touch icon
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleTouchIcon) {
      appleTouchIcon.href = fullLogoUrl;
    }
  };

  const updateManifestName = (companyName: string) => {
    if (companyName) {
      // Update page title
      document.title = companyName;
      
      // Update manifest name if possible
      const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifest) {
        // Note: Full manifest update would require server-side generation
        console.log(`Updated app name to: ${companyName}`);
      }
    }
  };

  return null; // This component doesn't render anything
}; 