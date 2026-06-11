export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_accepted: boolean
          question_id: string
          updated_at: string
          vote_count: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          question_id: string
          updated_at?: string
          vote_count?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          question_id?: string
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          space: Database["public"]["Enums"]["article_space"]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          space: Database["public"]["Enums"]["article_space"]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          space?: Database["public"]["Enums"]["article_space"]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          created_at: string
          id: string
          source_order_id: string
          status: Database["public"]["Enums"]["commission_status"]
          type: Database["public"]["Enums"]["commission_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source_order_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          type: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source_order_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          type?: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_online: boolean
          is_published: boolean
          location: string | null
          max_attendees: number | null
          slug: string
          start_date: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_online?: boolean
          is_published?: boolean
          location?: string | null
          max_attendees?: number | null
          slug: string
          start_date: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_online?: boolean
          is_published?: boolean
          location?: string | null
          max_attendees?: number | null
          slug?: string
          start_date?: string
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: []
      }
      mlm_nodes: {
        Row: {
          affiliate_code: string
          created_at: string
          id: string
          level: number
          parent_id: string | null
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          created_at?: string
          id?: string
          level?: number
          parent_id?: string | null
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          created_at?: string
          id?: string
          level?: number
          parent_id?: string | null
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlm_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mlm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          commission_amount: number
          created_at: string
          escrow_status: Database["public"]["Enums"]["escrow_status"]
          id: string
          payment_method: string | null
          product_id: string
          quantity: number
          seller_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          commission_amount?: number
          created_at?: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          id?: string
          payment_method?: string | null
          product_id: string
          quantity: number
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          commission_amount?: number
          created_at?: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          id?: string
          payment_method?: string | null
          product_id?: string
          quantity?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_monographs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          scientific_name: string
          therapeutic_indications: string
          updated_at: string
          vernacular_names: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          scientific_name: string
          therapeutic_indications: string
          updated_at?: string
          vernacular_names?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          scientific_name?: string
          therapeutic_indications?: string
          updated_at?: string
          vernacular_names?: Json
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["med_category"]
          commission_rate: number | null
          created_at: string
          description: string
          id: string
          images: string[]
          is_active: boolean
          is_featured: boolean
          price: number
          seller_id: string
          slug: string
          stock: number
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["med_category"]
          commission_rate?: number | null
          created_at?: string
          description: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          price: number
          seller_id: string
          slug: string
          stock?: number
          title: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["med_category"]
          commission_rate?: number | null
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          price?: number
          seller_id?: string
          slug?: string
          stock?: number
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          average_rating: number
          biography: string
          created_at: string
          display_name: string
          id: string
          is_verified: boolean
          location: string
          photos: string[]
          specialty: string[]
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_rating?: number
          biography: string
          created_at?: string
          display_name: string
          id?: string
          is_verified?: boolean
          location: string
          photos?: string[]
          specialty?: string[]
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_rating?: number
          biography?: string
          created_at?: string
          display_name?: string
          id?: string
          is_verified?: boolean
          location?: string
          photos?: string[]
          specialty?: string[]
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliate_code: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
          wallet_balance: number
        }
        Insert: {
          affiliate_code?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
          wallet_balance?: number
        }
        Update: {
          affiliate_code?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          is_closed: boolean
          tags: string[]
          title: string
          updated_at: string
          view_count: number
          vote_count: number
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          id?: string
          is_closed?: boolean
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
          vote_count?: number
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_closed?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
          vote_count?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          target_id: string
          target_type: Database["public"]["Enums"]["review_target"]
        }
        Insert: {
          author_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          target_id: string
          target_type: Database["public"]["Enums"]["review_target"]
        }
        Update: {
          author_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          target_id?: string
          target_type?: Database["public"]["Enums"]["review_target"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "professional" | "researcher" | "moderator" | "admin"
      article_space:
        | "sante_quotidien"
        | "rites_cultures"
        | "recettes_sante"
        | "pharmacopee"
      commission_status: "pending" | "approved" | "paid" | "cancelled"
      commission_type:
        | "direct"
        | "mlm_level1"
        | "mlm_level2"
        | "mlm_level3"
        | "affiliate"
      escrow_status: "held" | "released" | "refunded"
      event_type: "webinar" | "formation" | "salon" | "portes_ouvertes"
      kyc_status: "pending" | "submitted" | "verified" | "rejected"
      med_category:
        | "gyneco_obstetrique"
        | "gastro_intestinal"
        | "maladies_enfance"
        | "etats_febriles_icteres"
        | "affections_cutanees"
        | "systeme_nerveux"
        | "osteo_articulaire"
        | "pulmonaire"
        | "uro_genital"
        | "orl"
        | "ophtalmologique"
        | "bucco_dentaire"
        | "cardio_vasculaire"
        | "stomatologique"
        | "mystique"
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "disputed"
        | "refunded"
        | "cancelled"
      product_type: "physical" | "service" | "digital"
      review_target: "product" | "professional"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "commission"
        | "payment"
        | "refund"
        | "transfer"
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
      app_role: ["user", "professional", "researcher", "moderator", "admin"],
      article_space: [
        "sante_quotidien",
        "rites_cultures",
        "recettes_sante",
        "pharmacopee",
      ],
      commission_status: ["pending", "approved", "paid", "cancelled"],
      commission_type: [
        "direct",
        "mlm_level1",
        "mlm_level2",
        "mlm_level3",
        "affiliate",
      ],
      escrow_status: ["held", "released", "refunded"],
      event_type: ["webinar", "formation", "salon", "portes_ouvertes"],
      kyc_status: ["pending", "submitted", "verified", "rejected"],
      med_category: [
        "gyneco_obstetrique",
        "gastro_intestinal",
        "maladies_enfance",
        "etats_febriles_icteres",
        "affections_cutanees",
        "systeme_nerveux",
        "osteo_articulaire",
        "pulmonaire",
        "uro_genital",
        "orl",
        "ophtalmologique",
        "bucco_dentaire",
        "cardio_vasculaire",
        "stomatologique",
        "mystique",
      ],
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "disputed",
        "refunded",
        "cancelled",
      ],
      product_type: ["physical", "service", "digital"],
      review_target: ["product", "professional"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "commission",
        "payment",
        "refund",
        "transfer",
      ],
    },
  },
} as const
