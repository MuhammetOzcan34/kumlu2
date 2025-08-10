import { useEffect, useCallback, useMemo } from 'react';
import { useSetting } from '@/hooks/useSettings';

export const PWAIconManager = () => {
  const companyLogo = useSetting('firma_logo_url');
  const companyName = useSetting('firma_adi');

  // Memoize the full logo URL calculation
  const fullLogoUrl = useMemo(() => {
    if (!companyLogo) return null;
    
    if (companyLogo.startsWith('http')) {
      return companyLogo;
    }
    
    if (companyLogo && !companyLogo.includes('/')) {
      return `https://kepfuptrmccexgyzhcti.supabase.co/storage/v1/object/public/fotograflar/${companyLogo}`;
    }
    
    return companyLogo;
  }, [companyLogo]);

  const updateFavicon = useCallback((logoUrl: string) => {
    try {
      console.log('🔗 PWAIconManager - Favicon URL:', logoUrl);

      // Tüm favicon link'lerini güncelle
      const faviconLinks = document.querySelectorAll('link[rel="icon"]');
      const timestamp = Date.now();
      
      faviconLinks.forEach((link) => {
        const linkElement = link as HTMLLinkElement;
        linkElement.href = `${logoUrl}?v=${timestamp}`;
      });

      // Apple touch icon güncelle
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = `${logoUrl}?v=${timestamp}`;
      }

      // Apple touch startup image güncelle
      const appleTouchStartupImage = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
      if (appleTouchStartupImage) {
        appleTouchStartupImage.href = `${logoUrl}?v=${timestamp}`;
      }
    } catch (error) {
      console.error('PWAIconManager favicon update error:', error);
    }
  }, []);

  const updateManifestName = useCallback((name: string) => {
    try {
      if (name) {
        document.title = name;
        console.log(`✅ App name updated to: ${name}`);
      }
    } catch (error) {
      console.error('PWAIconManager manifest update error:', error);
    }
  }, []);

  // Logo güncelleme effect'i - sadece fullLogoUrl değiştiğinde çalışır
  useEffect(() => {
    if (fullLogoUrl) {
      updateFavicon(fullLogoUrl);
      console.log('✅ PWA favicon updated with company logo');
    }
  }, [fullLogoUrl, updateFavicon]);

  // İsim güncelleme effect'i - sadece companyName değiştiğinde çalışır
  useEffect(() => {
    if (companyName) {
      updateManifestName(companyName);
    }
  }, [companyName, updateManifestName]);

  return null;
};