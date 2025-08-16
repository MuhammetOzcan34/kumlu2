export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ayarlar: {
        Row: {
          aciklama: string | null
          anahtar: string
          created_at: string
          deger: string | null
          id: string
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          anahtar: string
          created_at?: string
          deger?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          anahtar?: string
          created_at?: string
          deger?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      // fotograflar tablosu Row tipinde watermark_applied eklenmeli:
      fotograflar: {
        Row: {
          aciklama: string | null
          aktif: boolean | null
          baslik: string | null
          boyut: number | null
          created_at: string
          dosya_yolu: string
          gorsel_tipi: string | null
          id: string
          kategori_adi: string | null
          kategori_id: string | null
          kullanim_alani: string[] | null
          logo_eklendi: boolean | null
          mime_type: string | null
          sira_no: number | null
          thumbnail_yolu: string | null
          updated_at: string
          watermark_applied: boolean | null  // Bu satır eklenmeli
        }
        Insert: {
          aciklama?: string | null
          aktif?: boolean | null
          baslik?: string | null
          boyut?: number | null
          created_at?: string
          dosya_yolu: string
          gorsel_tipi?: string | null
          id?: string
          kategori_adi?: string | null
          kategori_id?: string | null
          kullanim_alani?: string[] | null
          logo_eklendi?: boolean | null
          mime_type?: string | null
          sira_no?: number | null
          thumbnail_yolu?: string | null
          updated_at?: string
          watermark_applied?: boolean | null  // Bu satır eklenmeli
        }
        Update: {
          aciklama?: string | null
          aktif?: boolean | null
          baslik?: string | null
          boyut?: number | null
          created_at?: string
          dosya_yolu?: string
          gorsel_tipi?: string | null
          id?: string
          kategori_adi?: string | null
          kategori_id?: string | null
          kullanim_alani?: string[] | null
          logo_eklendi?: boolean | null
          mime_type?: string | null
          sira_no?: number | null
          thumbnail_yolu?: string | null
          updated_at?: string
          watermark_applied?: boolean | null  // Bu satır eklenmeli
        }
        Relationships: [
          {
            foreignKeyName: "fotograflar_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategoriler"
            referencedColumns: ["id"]
          },
        ]
      }
      hesaplama_urunleri: {
        Row: {
          aciklama: string | null
          ad: string
          aktif: boolean | null
          birim: string
          birim_fiyat: number
          created_at: string
          id: string
          kategori: string | null
          sira_no: number | null
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          ad: string
          aktif?: boolean | null
          birim?: string
          birim_fiyat?: number
          created_at?: string
          id?: string
          kategori?: string | null
          sira_no?: number | null
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          ad?: string
          aktif?: boolean | null
          birim?: string
          birim_fiyat?: number
          created_at?: string
          id?: string
          kategori?: string | null
          sira_no?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      kategoriler: {
        Row: {
          aciklama: string | null
          ad: string
          aktif: boolean | null
          created_at: string
          id: string
          sira_no: number | null
          slug: string
          tip: Database["public"]["Enums"]["kategori_tipi"]
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          ad: string
          aktif?: boolean | null
          created_at?: string
          id?: string
          sira_no?: number | null
          slug: string
          tip: Database["public"]["Enums"]["kategori_tipi"]
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          ad?: string
          aktif?: boolean | null
          created_at?: string
          id?: string
          sira_no?: number | null
          slug?: string
          tip?: Database["public"]["Enums"]["kategori_tipi"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reklam_kampanyalari: {
        Row: {
          aktif: boolean | null
          baslangic_tarihi: string | null
          bitis_tarihi: string | null
          butce_gunluk: number | null
          butce_toplam: number | null
          created_at: string
          durum: string
          hedef_kitle: string | null
          hedef_url: string | null
          id: string
          kampanya_adi: string
          kategori_id: string | null
          platform: string
          reklam_metni: string | null
          updated_at: string
        }
        Insert: {
          aktif?: boolean | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          butce_gunluk?: number | null
          butce_toplam?: number | null
          created_at?: string
          durum?: string
          hedef_kitle?: string | null
          hedef_url?: string | null
          id?: string
          kampanya_adi: string
          kategori_id?: string | null
          platform: string
          reklam_metni?: string | null
          updated_at?: string
        }
        Update: {
          aktif?: boolean | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          butce_gunluk?: number | null
          butce_toplam?: number | null
          created_at?: string
          durum?: string
          hedef_kitle?: string | null
          hedef_url?: string | null
          id?: string
          kampanya_adi?: string
          kategori_id?: string | null
          platform?: string
          reklam_metni?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reklam_kampanyalari_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategoriler"
            referencedColumns: ["id"]
          },
        ]
      }
      sayfa_icerikleri: {
        Row: {
          aktif: boolean | null
          alan_adi: string
          created_at: string
          icerik: string | null
          icerik_tipi: string | null
          id: string
          sayfa_adi: string
          sira_no: number | null
          updated_at: string
        }
        Insert: {
          aktif?: boolean | null
          alan_adi: string
          created_at?: string
          icerik?: string | null
          icerik_tipi?: string | null
          id?: string
          sayfa_adi: string
          sira_no?: number | null
          updated_at?: string
        }
        Update: {
          aktif?: boolean | null
          alan_adi?: string
          created_at?: string
          icerik?: string | null
          icerik_tipi?: string | null
          id?: string
          sayfa_adi?: string
          sira_no?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      servis_bedelleri: {
        Row: {
          aciklama: string | null
          aktif: boolean | null
          birim: string
          birim_fiyat: number
          created_at: string
          hizmet_adi: string
          id: string
          kategori: string
          sira_no: number | null
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          aktif?: boolean | null
          birim?: string
          birim_fiyat?: number
          created_at?: string
          hizmet_adi: string
          id?: string
          kategori: string
          sira_no?: number | null
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          aktif?: boolean | null
          birim?: string
          birim_fiyat?: number
          created_at?: string
          hizmet_adi?: string
          id?: string
          kategori?: string
          sira_no?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      video_galeri: {
        Row: {
          aciklama: string | null
          aktif: boolean | null
          baslik: string
          created_at: string
          id: string
          kategori: string | null
          sira_no: number | null
          thumbnail_url: string | null
          updated_at: string
          youtube_id: string | null
          youtube_url: string
        }
        Insert: {
          aciklama?: string | null
          aktif?: boolean | null
          baslik: string
          created_at?: string
          id?: string
          kategori?: string | null
          sira_no?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          youtube_id?: string | null
          youtube_url: string
        }
        Update: {
          aciklama?: string | null
          aktif?: boolean | null
          baslik?: string
          created_at?: string
          id?: string
          kategori?: string | null
          sira_no?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          youtube_id?: string | null
          youtube_url?: string
        }
        Relationships: []
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extract_youtube_id: {
        Args: { youtube_url: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      kategori_tip: "kumlama" | "tabela" | "arac-giydirme"
      kategori_tipi: "kumlama" | "tabela" | "arac-giydirme"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      kategori_tip: ["kumlama", "tabela", "arac-giydirme"],
      kategori_tipi: ["kumlama", "tabela", "arac-giydirme"],
    },
  },
} as const
