// Generado vía Supabase MCP `generate_typescript_types` el 2026-04-25.
// Para regenerar: corre `mcp__supabase__generate_typescript_types` o
// `supabase gen types typescript --project-id cypjagawpmoukvawqpwt > lib/types/database.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      campaign_contacts: {
        Row: {
          campaign_id: string;
          created_at: string;
          department: string | null;
          error_message: string | null;
          full_name: string;
          has_opt_in: boolean;
          id: string;
          import_status: string;
          municipality: string | null;
          participant_id: string | null;
          region: string | null;
          whatsapp: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          department?: string | null;
          error_message?: string | null;
          full_name: string;
          has_opt_in?: boolean;
          id?: string;
          import_status?: string;
          municipality?: string | null;
          participant_id?: string | null;
          region?: string | null;
          whatsapp: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          department?: string | null;
          error_message?: string | null;
          full_name?: string;
          has_opt_in?: boolean;
          id?: string;
          import_status?: string;
          municipality?: string | null;
          participant_id?: string | null;
          region?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          channel: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string;
          status: string;
        };
        Insert: {
          channel?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
      candidate_proposals: {
        Row: {
          candidate_id: string;
          created_at: string;
          id: string;
          proposal: string;
          source_name: string | null;
          source_url: string | null;
          topic: string;
        };
        Insert: {
          candidate_id: string;
          created_at?: string;
          id?: string;
          proposal: string;
          source_name?: string | null;
          source_url?: string | null;
          topic: string;
        };
        Update: {
          candidate_id?: string;
          created_at?: string;
          id?: string;
          proposal?: string;
          source_name?: string | null;
          source_url?: string | null;
          topic?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          active: boolean;
          bio: string | null;
          color: string | null;
          created_at: string;
          display_order: number;
          id: string;
          name: string;
          party: string | null;
          photo_url: string | null;
        };
        Insert: {
          active?: boolean;
          bio?: string | null;
          color?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          name: string;
          party?: string | null;
          photo_url?: string | null;
        };
        Update: {
          active?: boolean;
          bio?: string | null;
          color?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          name?: string;
          party?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      data_deletion_requests: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          participant_id: string | null;
          request_type: string;
          resolved_at: string | null;
          status: string;
          whatsapp: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          participant_id?: string | null;
          request_type?: string;
          resolved_at?: string | null;
          status?: string;
          whatsapp: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          participant_id?: string | null;
          request_type?: string;
          resolved_at?: string | null;
          status?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      external_poll_results: {
        Row: {
          candidate_name: string;
          display_order: number;
          id: string;
          percentage: number;
          poll_id: string;
        };
        Insert: {
          candidate_name: string;
          display_order?: number;
          id?: string;
          percentage: number;
          poll_id: string;
        };
        Update: {
          candidate_name?: string;
          display_order?: number;
          id?: string;
          percentage?: number;
          poll_id?: string;
        };
        Relationships: [];
      };
      external_polls: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          notes: string | null;
          pollster: string;
          publication_date: string;
          source_url: string;
          technical_sheet: string | null;
          title: string;
          visible: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          notes?: string | null;
          pollster: string;
          publication_date: string;
          source_url: string;
          technical_sheet?: string | null;
          title: string;
          visible?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          notes?: string | null;
          pollster?: string;
          publication_date?: string;
          source_url?: string;
          technical_sheet?: string | null;
          title?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
      message_logs: {
        Row: {
          campaign_id: string;
          created_at: string;
          delivered_at: string | null;
          error_message: string | null;
          id: string;
          participant_id: string | null;
          provider_message_id: string | null;
          read_at: string | null;
          sent_at: string | null;
          status: string;
          template_id: string | null;
          whatsapp: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string;
          delivered_at?: string | null;
          error_message?: string | null;
          id?: string;
          participant_id?: string | null;
          provider_message_id?: string | null;
          read_at?: string | null;
          sent_at?: string | null;
          status?: string;
          template_id?: string | null;
          whatsapp: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string;
          delivered_at?: string | null;
          error_message?: string | null;
          id?: string;
          participant_id?: string | null;
          provider_message_id?: string | null;
          read_at?: string | null;
          sent_at?: string | null;
          status?: string;
          template_id?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      message_templates: {
        Row: {
          body: string;
          campaign_id: string;
          created_at: string;
          id: string;
          name: string;
          status: string;
        };
        Insert: {
          body: string;
          campaign_id: string;
          created_at?: string;
          id?: string;
          name: string;
          status?: string;
        };
        Update: {
          body?: string;
          campaign_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          status?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          age_range: string | null;
          campaign_id: string | null;
          consent_personal_data: boolean;
          consent_sensitive_political_data: boolean;
          consent_whatsapp: boolean;
          created_at: string;
          department: string;
          full_name: string;
          gender: string | null;
          id: string;
          ip_hash: string | null;
          municipality: string;
          occupation: string | null;
          privacy_version: string;
          referral_code: string;
          referred_by: string | null;
          region: string;
          source: string | null;
          status: string;
          updated_at: string;
          user_agent: string | null;
          whatsapp: string;
        };
        Insert: {
          age_range?: string | null;
          campaign_id?: string | null;
          consent_personal_data?: boolean;
          consent_sensitive_political_data?: boolean;
          consent_whatsapp?: boolean;
          created_at?: string;
          department: string;
          full_name: string;
          gender?: string | null;
          id?: string;
          ip_hash?: string | null;
          municipality: string;
          occupation?: string | null;
          privacy_version?: string;
          referral_code: string;
          referred_by?: string | null;
          region: string;
          source?: string | null;
          status?: string;
          updated_at?: string;
          user_agent?: string | null;
          whatsapp: string;
        };
        Update: {
          age_range?: string | null;
          campaign_id?: string | null;
          consent_personal_data?: boolean;
          consent_sensitive_political_data?: boolean;
          consent_whatsapp?: boolean;
          created_at?: string;
          department?: string;
          full_name?: string;
          gender?: string | null;
          id?: string;
          ip_hash?: string | null;
          municipality?: string;
          occupation?: string | null;
          privacy_version?: string;
          referral_code?: string;
          referred_by?: string | null;
          region?: string;
          source?: string | null;
          status?: string;
          updated_at?: string;
          user_agent?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      privacy_policy_versions: {
        Row: {
          content_md: string;
          id: string;
          is_current: boolean;
          published_at: string;
          version: string;
        };
        Insert: {
          content_md: string;
          id?: string;
          is_current?: boolean;
          published_at?: string;
          version: string;
        };
        Update: {
          content_md?: string;
          id?: string;
          is_current?: boolean;
          published_at?: string;
          version?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["admin_role"];
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["admin_role"];
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["admin_role"];
        };
        Relationships: [];
      };
      referral_events: {
        Row: {
          campaign_id: string | null;
          child_participant_id: string;
          created_at: string;
          id: string;
          parent_participant_id: string;
        };
        Insert: {
          campaign_id?: string | null;
          child_participant_id: string;
          created_at?: string;
          id?: string;
          parent_participant_id: string;
        };
        Update: {
          campaign_id?: string | null;
          child_participant_id?: string;
          created_at?: string;
          id?: string;
          parent_participant_id?: string;
        };
        Relationships: [];
      };
      share_events: {
        Row: {
          campaign_id: string | null;
          channel: string;
          created_at: string;
          id: string;
          participant_id: string;
          referral_code: string;
        };
        Insert: {
          campaign_id?: string | null;
          channel?: string;
          created_at?: string;
          id?: string;
          participant_id: string;
          referral_code: string;
        };
        Update: {
          campaign_id?: string | null;
          channel?: string;
          created_at?: string;
          id?: string;
          participant_id?: string;
          referral_code?: string;
        };
        Relationships: [];
      };
      survey_answers: {
        Row: {
          answer_text: string | null;
          created_at: string;
          id: string;
          option_id: string | null;
          question_id: string;
          response_id: string;
        };
        Insert: {
          answer_text?: string | null;
          created_at?: string;
          id?: string;
          option_id?: string | null;
          question_id: string;
          response_id: string;
        };
        Update: {
          answer_text?: string | null;
          created_at?: string;
          id?: string;
          option_id?: string | null;
          question_id?: string;
          response_id?: string;
        };
        Relationships: [];
      };
      survey_options: {
        Row: {
          active: boolean;
          candidate_id: string | null;
          display_order: number;
          id: string;
          option_text: string;
          option_value: string;
          question_id: string;
        };
        Insert: {
          active?: boolean;
          candidate_id?: string | null;
          display_order?: number;
          id?: string;
          option_text: string;
          option_value: string;
          question_id: string;
        };
        Update: {
          active?: boolean;
          candidate_id?: string | null;
          display_order?: number;
          id?: string;
          option_text?: string;
          option_value?: string;
          question_id?: string;
        };
        Relationships: [];
      };
      survey_questions: {
        Row: {
          active: boolean;
          created_at: string;
          display_order: number;
          id: string;
          is_sensitive: boolean;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          required: boolean;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_sensitive?: boolean;
          question_text: string;
          question_type?: Database["public"]["Enums"]["question_type"];
          required?: boolean;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_sensitive?: boolean;
          question_text?: string;
          question_type?: Database["public"]["Enums"]["question_type"];
          required?: boolean;
        };
        Relationships: [];
      };
      survey_responses: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          id: string;
          participant_id: string;
          profile_summary: Json | null;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          participant_id: string;
          profile_summary?: Json | null;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          participant_id?: string;
          profile_summary?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      v_participation_by_day: {
        Row: {
          day: string | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_participation_by_region: {
        Row: {
          region: string | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_participation_by_department: {
        Row: {
          department: string | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_public_results: {
        Row: {
          candidate_id: string | null;
          option_id: string | null;
          option_text: string | null;
          question_id: string | null;
          question_text: string | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_public_results_by_department: {
        Row: {
          department: string | null;
          option_id: string | null;
          question_id: string | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_public_summary: {
        Row: {
          total_departments: number | null;
          total_municipalities: number | null;
          total_participants: number | null;
          total_responses_completed: number | null;
          total_responses_partial: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_admin_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["admin_role"];
      };
      rpc_register_share: {
        Args: {
          p_channel: string;
          p_participant_id: string;
          p_referral_code: string;
        };
        Returns: string;
      };
      rpc_request_deletion: {
        Args: { p_notes?: string; p_request_type?: string; p_whatsapp: string };
        Returns: string;
      };
    };
    Enums: {
      admin_role: "super_admin" | "campaign_manager" | "analyst" | "viewer";
      question_type: "single_choice" | "multiple_choice" | "text" | "scale";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;
