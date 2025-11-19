export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          name: string;
          description: string;
          url: string;
          status: number;
          reminder_interval: number;
          created_at: string;
          last_reminded_at: string | null;
          updated_at: string;
          user_id: string | null;
          color: string | null;
          is_pinned: boolean;
          pinned_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          url?: string;
          status?: number;
          reminder_interval?: number;
          created_at?: string;
          last_reminded_at?: string | null;
          updated_at?: string;
          user_id?: string | null;
          color?: string | null;
          is_pinned?: boolean;
          pinned_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          url?: string;
          status?: number;
          reminder_interval?: number;
          created_at?: string;
          last_reminded_at?: string | null;
          updated_at?: string;
          user_id?: string | null;
          color?: string | null;
          is_pinned?: boolean;
          pinned_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
