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
    PostgrestVersion: "14.1"
  }
  "opensurveillancedb-alphav1": {
    Tables: {
      color: {
        Row: {
          code: string
          hex_code: string | null
          name: string
          swatch_icon: string | null
        }
        Insert: {
          code: string
          hex_code?: string | null
          name: string
          swatch_icon?: string | null
        }
        Update: {
          code?: string
          hex_code?: string | null
          name?: string
          swatch_icon?: string | null
        }
        Relationships: []
      }
      device_color_option: {
        Row: {
          color_id: string
          model_id: string
        }
        Insert: {
          color_id: string
          model_id: string
        }
        Update: {
          color_id?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_color_option_color_id_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "color"
            referencedColumns: null
          },
          {
            foreignKeyName: "device_color_option_model_id_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "device_model"
            referencedColumns: null
          },
        ]
      }
      device_location: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      device_manufacturer: {
        Row: {
          alternate_names: string[] | null
          icons: string[]
          id: string
          name: string
        }
        Insert: {
          alternate_names?: string[] | null
          icons?: string[]
          id?: string
          name: string
        }
        Update: {
          alternate_names?: string[] | null
          icons?: string[]
          id?: string
          name?: string
        }
        Relationships: []
      }
      device_model: {
        Row: {
          datasheet_url: string | null
          example_images: string[]
          id: string
          manufacturer: string | null
          name: string
          product_url: string | null
          shape_profile: string | null
        }
        Insert: {
          datasheet_url?: string | null
          example_images?: string[]
          id?: string
          manufacturer?: string | null
          name: string
          product_url?: string | null
          shape_profile?: string | null
        }
        Update: {
          datasheet_url?: string | null
          example_images?: string[]
          id?: string
          manufacturer?: string | null
          name?: string
          product_url?: string | null
          shape_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_model_manufacturer_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "device_manufacturer"
            referencedColumns: null
          },
          {
            foreignKeyName: "device_model_shape_profile_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "device_shape_profile"
            referencedColumns: null
          },
        ]
      }
      device_possible_location: {
        Row: {
          location_code: string
          model_id: string
        }
        Insert: {
          location_code: string
          model_id: string
        }
        Update: {
          location_code?: string
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_possible_location_location_code_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "device_location"
            referencedColumns: null
          },
          {
            foreignKeyName: "device_possible_location_model_id_fkey"
            columns: null
            isOneToOne: false
            referencedRelation: "device_model"
            referencedColumns: null
          },
        ]
      }
      device_shape_profile: {
        Row: {
          icon: string | null
          id: string
          short_name: string
        }
        Insert: {
          icon?: string | null
          id?: string
          short_name: string
        }
        Update: {
          icon?: string | null
          id?: string
          short_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  "opensurveillancedb-alphav1": {
    Enums: {},
  },
} as const
