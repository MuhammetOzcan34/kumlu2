import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";

export const ElfsightInstagramFeed = () => {
  const [settings, setSettings] = useState({
    instagram_enabled: false,
    instagram_widget_type: 'elfsight' as 'elfsight' | 'api',
    elfsight_widget_id: '',
    elfsight_widget_code: ''
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Ayarları localStorage'dan yükle
    const loadSettings = () => {
      setSettings({
        instagram_enabled: localStorage.getItem("instagram_enabled") === "true",
        instagram_widget_type: (localStorage.getItem("instagram_widget_type") as 'elfsight' | 'api') || 'elfsight',
        elfsight_widget_id: localStorage.getItem("elfsight_widget_id") || "",
        elfsight_widget_code: localStorage.getItem("elfsight_widget_code") || ""
      });
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Elfsight script'ini yükle
    if (settings.instagram_enabled && 
        settings.instagram_widget_type === 'elfsight' && 
        settings.elfsight_widget_id && 
        !scriptLoaded) {
      
      // Mevcut script'i kontrol et
      const existingScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://elfsightcdn.com/platform.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => console.error('Elfsight script yüklenemedi');
        document.head.appendChild(script);
      } else {
        setScriptLoaded(true);
      }
    }
  }, [settings, scriptLoaded]);

  // Instagram aktif değilse veya Elfsight widget seçili değilse gösterme
  if (!settings.instagram_enabled || 
      settings.instagram_widget_type !== 'elfsight' || 
      !settings.elfsight_widget_id) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Instagram className="h-6 w-6 text-pink-500" />
          Instagram
        </h2>
        <p className="text-muted-foreground mb-4">
          Son paylaşımlarımız
        </p>
      </div>
      
      {/* Elfsight Widget */}
      <div className="w-full">
        <div 
          className={`elfsight-app-${settings.elfsight_widget_id}`}
          data-elfsight-app-lazy
        ></div>
      </div>
    </div>
  );
};