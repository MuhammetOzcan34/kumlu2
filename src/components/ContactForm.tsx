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
          <div className="space-y-2">
            <Label htmlFor="contact-name">Ad Soyad *</Label>
            <Input
              id="contact-name"
              name="contact_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Adınız ve soyadınız"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Telefon *</Label>
            <Input
              id="contact-phone"
              name="contact_phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0555 123 45 67"
              autoComplete="tel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">E-posta</Label>
            <Input
              id="contact-email"
              name="contact_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ornek@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">Konu *</Label>
            <Input
              id="contact-subject"
              name="contact_subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Mesaj konusu"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Mesaj *</Label>
            <Textarea
              id="contact-message"
              name="contact_message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Mesajınızı buraya yazın..."
              rows={4}
              autoComplete="off"
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