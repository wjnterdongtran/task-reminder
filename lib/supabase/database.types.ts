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
        };
        Relationships: [];
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
