import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timeout referansları için
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  
  // Component unmount'da tüm timeout'ları temizle
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current.clear();
    };
  }, []);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit validasyon
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }

    setIsSubmitting(true);

    try {
      // Burada gerçek bir API endpoint'e gönderilebilir
      // Şimdilik sadece başarılı mesajı gösteriyoruz
      await new Promise(resolve => {
        const timeoutId = setTimeout(() => {
          resolve(undefined);
          timeoutRefs.current.delete(timeoutId);
        }, 1000);
        timeoutRefs.current.add(timeoutId);
      }); // Simüle edilmiş API çağrısı
      
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      
      // Formu temizle
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bize Yazın</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Adınız ve soyadınız"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="0555 123 45 67"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Konu</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Mesajınızın konusu"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mesaj *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              className="min-h-[120px]"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};