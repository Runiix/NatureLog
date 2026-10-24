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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      animallistitems: {
        Row: {
          animal_id: number | null
          created_at: string
          id: number
          list_id: string | null
          user_id: string
        }
        Insert: {
          animal_id?: number | null
          created_at?: string
          id?: number
          list_id?: string | null
          user_id: string
        }
        Update: {
          animal_id?: number | null
          created_at?: string
          id?: number
          list_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animallistitems_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animallistitems_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "user_spotted_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animallistitems_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "animallists"
            referencedColumns: ["id"]
          },
        ]
      }
      animallists: {
        Row: {
          created_at: string
          description: string | null
          has_location: boolean
          id: string
          is_public: boolean
          lat: number | null
          lng: number | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          has_location?: boolean
          id?: string
          is_public?: boolean
          lat?: number | null
          lng?: number | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          has_location?: boolean
          id?: string
          is_public?: boolean
          lat?: number | null
          lng?: number | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      animals: {
        Row: {
          category: string | null
          colors: string | null
          common_name: string
          created_at: string | null
          description: string | null
          endangerment_order: number | null
          endangerment_status: string | null
          habitat: string | null
          id: number
          image_credit_link: string | null
          image_credit_text: string | null
          image_license_link: string | null
          image_license_text: string | null
          image_link: string | null
          lexicon_link: string | null
          population_estimate: string | null
          presence_time: string | null
          scientific_name: string
          sexual_dimorphism: string | null
          similar_animals: string[] | null
          size_from: number | null
          size_to: number | null
          taxonomic_order: string | null
          very_rare: boolean
        }
        Insert: {
          category?: string | null
          colors?: string | null
          common_name: string
          created_at?: string | null
          description?: string | null
          endangerment_order?: number | null
          endangerment_status?: string | null
          habitat?: string | null
          id?: number
          image_credit_link?: string | null
          image_credit_text?: string | null
          image_license_link?: string | null
          image_license_text?: string | null
          image_link?: string | null
          lexicon_link?: string | null
          population_estimate?: string | null
          presence_time?: string | null
          scientific_name: string
          sexual_dimorphism?: string | null
          similar_animals?: string[] | null
          size_from?: number | null
          size_to?: number | null
          taxonomic_order?: string | null
          very_rare?: boolean
        }
        Update: {
          category?: string | null
          colors?: string | null
          common_name?: string
          created_at?: string | null
          description?: string | null
          endangerment_order?: number | null
          endangerment_status?: string | null
          habitat?: string | null
          id?: number
          image_credit_link?: string | null
          image_credit_text?: string | null
          image_license_link?: string | null
          image_license_text?: string | null
          image_link?: string | null
          lexicon_link?: string | null
          population_estimate?: string | null
          presence_time?: string | null
          scientific_name?: string
          sexual_dimorphism?: string | null
          similar_animals?: string[] | null
          size_from?: number | null
          size_to?: number | null
          taxonomic_order?: string | null
          very_rare?: boolean
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          license_accepted_at: string
          main_path: string | null
          seed: number | null
          status: string
          thumb_path: string | null
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          license_accepted_at: string
          main_path?: string | null
          seed?: number | null
          status?: string
          thumb_path?: string | null
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          license_accepted_at?: string
          main_path?: string | null
          seed?: number | null
          status?: string
          thumb_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_entry_likes: {
        Row: {
          created_at: string
          entry_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entry_likes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_matchups: {
        Row: {
          contest_id: string
          ends_at: string
          entry_a: string | null
          entry_b: string | null
          id: string
          round: number
          slot: number
          starts_at: string
          winner: string | null
        }
        Insert: {
          contest_id: string
          ends_at: string
          entry_a?: string | null
          entry_b?: string | null
          id?: string
          round: number
          slot: number
          starts_at: string
          winner?: string | null
        }
        Update: {
          contest_id?: string
          ends_at?: string
          entry_a?: string | null
          entry_b?: string | null
          id?: string
          round?: number
          slot?: number
          starts_at?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_matchups_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_matchups_entry_a_fkey"
            columns: ["entry_a"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_matchups_entry_b_fkey"
            columns: ["entry_b"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_matchups_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_votes: {
        Row: {
          created_at: string
          entry_id: string
          matchup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          matchup_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          matchup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_votes_matchup_id_fkey"
            columns: ["matchup_id"]
            isOneToOne: false
            referencedRelation: "contest_matchups"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          animal_id: number
          bracket_size: number | null
          created_at: string
          id: string
          previous_image: Json | null
          published_paths: string[]
          scheduled_by: string | null
          status: string
          vetoed_at: string | null
          week_start: string
          winner_entry_id: string | null
        }
        Insert: {
          animal_id: number
          bracket_size?: number | null
          created_at?: string
          id?: string
          previous_image?: Json | null
          published_paths?: string[]
          scheduled_by?: string | null
          status?: string
          vetoed_at?: string | null
          week_start: string
          winner_entry_id?: string | null
        }
        Update: {
          animal_id?: number
          bracket_size?: number | null
          created_at?: string
          id?: string
          previous_image?: Json | null
          published_paths?: string[]
          scheduled_by?: string | null
          status?: string
          vetoed_at?: string | null
          week_start?: string
          winner_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "user_spotted_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contests_winner_entry_id_fkey"
            columns: ["winner_entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: []
      }
      image_moderation: {
        Row: {
          created_at: string
          decided_by: string
          flagged_categories: string[]
          id: string
          kind: string
          live_paths: string[]
          payload: Json
          queue_paths: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          scores: Json | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_by: string
          flagged_categories?: string[]
          id?: string
          kind: string
          live_paths?: string[]
          payload?: Json
          queue_paths?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_by?: string
          flagged_categories?: string[]
          id?: string
          kind?: string
          live_paths?: string[]
          payload?: Json
          queue_paths?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      lastimages: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      lexicon_submissions: {
        Row: {
          animal_id: number | null
          created_at: string
          data: Json
          flagged_categories: string[]
          id: string
          kind: string
          previous: Json | null
          queue_paths: string[]
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scores: Json | null
          status: string
          user_id: string
        }
        Insert: {
          animal_id?: number | null
          created_at?: string
          data?: Json
          flagged_categories?: string[]
          id?: string
          kind: string
          previous?: Json | null
          queue_paths?: string[]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json | null
          status?: string
          user_id?: string
        }
        Update: {
          animal_id?: number | null
          created_at?: string
          data?: Json
          flagged_categories?: string[]
          id?: string
          kind?: string
          previous?: Json | null
          queue_paths?: string[]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lexicon_submissions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lexicon_submissions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "user_spotted_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      listupvotes: {
        Row: {
          created_at: string | null
          id: string
          list_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          list_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          list_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listupvotes_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "animallists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          favorite_animal: string | null
          hide_invertebrates: boolean
          id: number
          insta_link: string | null
          is_public: boolean
          profile_picture: boolean | null
          region: string | null
          spotted_count: number | null
          spotted_invertebrate_count: number
          team_link: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          favorite_animal?: string | null
          hide_invertebrates?: boolean
          id?: number
          insta_link?: string | null
          is_public?: boolean
          profile_picture?: boolean | null
          region?: string | null
          spotted_count?: number | null
          spotted_invertebrate_count?: number
          team_link?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          favorite_animal?: string | null
          hide_invertebrates?: boolean
          id?: number
          insta_link?: string | null
          is_public?: boolean
          profile_picture?: boolean | null
          region?: string | null
          spotted_count?: number | null
          spotted_invertebrate_count?: number
          team_link?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: number
          image_link: string | null
          report_text: string | null
          reporter_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_link?: string | null
          report_text?: string | null
          reporter_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          image_link?: string | null
          report_text?: string | null
          reporter_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      species_sets: {
        Row: {
          created_at: string
          list_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          list_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          list_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "species_sets_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: true
            referencedRelation: "animallists"
            referencedColumns: ["id"]
          },
        ]
      }
      spotted: {
        Row: {
          animal_id: number | null
          first_spotted_at: string | null
          id: number
          image: boolean | null
          image_updated_at: string | null
          user_id: string | null
        }
        Insert: {
          animal_id?: number | null
          first_spotted_at?: string | null
          id?: number
          image?: boolean | null
          image_updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          animal_id?: number | null
          first_spotted_at?: string | null
          id?: number
          image?: boolean | null
          image_updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spotted_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spotted_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "user_spotted_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          display_name: string
          id: string
          joyndate: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          joyndate?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          joyndate?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_spotted_animals: {
        Row: {
          category: string | null
          common_name: string | null
          first_spotted_at: string | null
          id: number | null
          image: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      users_with_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string | null
          is_public: boolean | null
          joyndate: string | null
          profile_id: number | null
          spotted_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      contest_can_vote: {
        Args: { p_entry_id: string; p_matchup_id: string }
        Returns: boolean
      }
      contest_candidates: {
        Args: { p_limit?: number; p_week_start: string }
        Returns: {
          animal_id: number
          photos: number
        }[]
      }
      contest_vote_counts: {
        Args: { p_contest_id: string }
        Returns: {
          entry_id: string
          matchup_id: string
          votes: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      lexicon_pending_count: { Args: never; Returns: number }
      refresh_spotted_counts: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
