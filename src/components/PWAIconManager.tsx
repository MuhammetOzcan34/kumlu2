import { useEffect, useCallback } from 'react';
import { useSetting } from '@/hooks/useSettings';

export const PWAIconManager = () => {
  const companyLogo = useSetting('firma_logo_url');
  const companyName = useSetting('firma_adi');

  const updateFavicon = useCallback((logoUrl: string) => {
    // Logo URL'sini oluştur
    const getFullLogoUrl = (logoPath: string) => {
      if (logoPath.startsWith('http')) {
        return logoPath;
      }
      // Eğer sadece dosya adı ise, tam URL oluştur
      if (logoPath && !logoPath.includes('/')) {
        return `https://kepfuptrmccexgyzhcti.supabase.co/storage/v1/object/public/fotograflar/${logoPath}`;
      }
      return logoPath;
    };

    const fullLogoUrl = getFullLogoUrl(logoUrl);
    console.log('🔗 PWAIconManager - Favicon URL:', fullLogoUrl);

    // Tüm favicon link'lerini güncelle
    const faviconLinks = document.querySelectorAll('link[rel="icon"]');
    faviconLinks.forEach((link) => {
      const linkElement = link as HTMLLinkElement;
      // Cache'i temizlemek için timestamp ekle
      linkElement.href = `${fullLogoUrl}?v=${Date.now()}`;
    });

    // Update apple touch icon
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleTouchIcon) {
      appleTouchIcon.href = `${fullLogoUrl}?v=${Date.now()}`;
    }

    // Apple touch startup image güncelle
    const appleTouchStartupImage = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
    if (appleTouchStartupImage) {
      appleTouchStartupImage.href = `${fullLogoUrl}?v=${Date.now()}`;
    }

    // Browser cache'i temizlemek için force reload
    setTimeout(() => {
      const links = document.querySelectorAll('link[rel="icon"]');
      links.forEach((link) => {
        const linkElement = link as HTMLLinkElement;
        const originalHref = linkElement.href;
        linkElement.href = '';
        setTimeout(() => {
          linkElement.href = originalHref;
        }, 100);
      });
    }, 500);
  }, []);

  const updateManifestName = useCallback((companyName: string) => {
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
  }, []);

  useEffect(() => {
    if (companyLogo) {
      updateFavicon(companyLogo);
      console.log('✅ PWA favicon updated with company logo');
    }
  }, [companyLogo, updateFavicon]);

  useEffect(() => {
    if (companyName) {
      updateManifestName(companyName);
    }
  }, [companyName, updateManifestName]);

  return null; // This component doesn't render anything
};