// Placeholder görsel URL'leri
export const PLACEHOLDER_IMAGES = {
  // Genel placeholder'lar
  default: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20placeholder%20image%20with%20gray%20background%20and%20image%20icon&image_size=landscape_4_3',
  
  // Kategori bazlı placeholder'lar
  kumlamalar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sandblasting%20work%20on%20metal%20surface%20industrial%20process%20modern%20clean%20style&image_size=landscape_4_3',
  
  tabelalar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20signage%20and%20billboard%20design%20professional%20advertising%20display&image_size=landscape_4_3',
  
  'arac-giydirme': 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=vehicle%20wrapping%20car%20branding%20colorful%20vinyl%20graphics%20professional%20automotive%20design&image_size=landscape_4_3',
  
  video: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=video%20thumbnail%20play%20button%20modern%20media%20player%20interface%20dark%20background&image_size=landscape_16_9',
  
  // Kullanım alanı bazlı placeholder'lar
  'ana-sayfa-slider': 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hero%20banner%20professional%20industrial%20workspace%20clean%20design&image_size=landscape_16_9',
  
  galeri: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=photo%20gallery%20grid%20layout%20modern%20minimalist%20design%20placeholder&image_size=square',
  
  referanslar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=successful%20business%20project%20showcase%20professional%20work%20portfolio&image_size=landscape_4_3',
  
  hakkimizda: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20team%20workspace%20modern%20office%20about%20us%20company%20culture&image_size=landscape_4_3',
  
  iletisim: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=contact%20us%20communication%20modern%20office%20building%20professional%20business&image_size=landscape_4_3',
  
  blog: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=blog%20article%20news%20content%20modern%20digital%20media%20design&image_size=landscape_4_3'
};

/**
 * Kategori veya kullanım alanına göre uygun placeholder URL'ini döndürür
 */
export const getPlaceholderImage = (category?: string, usageArea?: string): string => {
  // Önce kullanım alanına göre kontrol et
  if (usageArea && PLACEHOLDER_IMAGES[usageArea as keyof typeof PLACEHOLDER_IMAGES]) {
    return PLACEHOLDER_IMAGES[usageArea as keyof typeof PLACEHOLDER_IMAGES];
  }
  
  // Sonra kategoriye göre kontrol et
  if (category && PLACEHOLDER_IMAGES[category as keyof typeof PLACEHOLDER_IMAGES]) {
    return PLACEHOLDER_IMAGES[category as keyof typeof PLACEHOLDER_IMAGES];
  }
  
  // Varsayılan placeholder döndür
  return PLACEHOLDER_IMAGES.default;
};

/**
 * Resim yükleme hatası durumunda placeholder gösterir
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) => {
  const img = event.currentTarget;
  if (img.src !== (fallbackUrl || PLACEHOLDER_IMAGES.default)) {
    img.src = fallbackUrl || PLACEHOLDER_IMAGES.default;
  }
};