// Supabase Database Types
// Reflects the schema from supabase/migrations/001_initial_schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: string
          subscription_tier: string
          invite_code_used: string | null
          api_keys: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role?: string
          subscription_tier?: string
          invite_code_used?: string | null
          api_keys?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: string
          subscription_tier?: string
          invite_code_used?: string | null
          api_keys?: Json
          updated_at?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          id: string
          code: string
          created_by: string | null
          used_by: string | null
          max_uses: number
          current_uses: number
          expires_at: string | null
          is_active: boolean
          grants_tier: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          created_by?: string | null
          used_by?: string | null
          max_uses?: number
          current_uses?: number
          expires_at?: string | null
          is_active?: boolean
          grants_tier?: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          created_by?: string | null
          used_by?: string | null
          max_uses?: number
          current_uses?: number
          expires_at?: string | null
          is_active?: boolean
          grants_tier?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          config: Json
          is_active: boolean
          trading_mode: 'none' | 'paper' | 'live'
          activated_at: string | null
          last_execution_at: string | null
          execution_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          config: Json
          is_active?: boolean
          trading_mode?: 'none' | 'paper' | 'live'
          activated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          config?: Json
          is_active?: boolean
          trading_mode?: 'none' | 'paper' | 'live'
          activated_at?: string | null
          last_execution_at?: string | null
          execution_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          id: string
          user_id: string
          strategy_id: string
          strategy_config: Json
          start_date: string
          end_date: string
          initial_capital: number
          final_capital: number
          metrics: Json
          trades: Json
          equity_curve: Json
          signal_attribution: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strategy_id: string
          strategy_config: Json
          start_date: string
          end_date: string
          initial_capital: number
          final_capital: number
          metrics: Json
          trades: Json
          equity_curve: Json
          signal_attribution?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          metrics?: Json
          signal_attribution?: Json | null
        }
        Relationships: []
      }
      historical_data_cache: {
        Row: {
          id: string
          symbol: string
          timeframe: string
          date: string
          open: number
          high: number
          low: number
          close: number
          volume: number
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          timeframe?: string
          date: string
          open: number
          high: number
          low: number
          close: number
          volume: number
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          timeframe?: string
          date?: string
          open?: number
          high?: number
          low?: number
          close?: number
          volume?: number
        }
        Relationships: []
      }
      cache_metadata: {
        Row: {
          id: string
          symbol: string
          timeframe: string
          cached_from: string
          cached_to: string
          row_count: number
          last_fetched_at: string
        }
        Insert: {
          id?: string
          symbol: string
          timeframe?: string
          cached_from: string
          cached_to: string
          row_count?: number
          last_fetched_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          timeframe?: string
          cached_from?: string
          cached_to?: string
          row_count?: number
          last_fetched_at?: string
        }
        Relationships: []
      }
      fundamental_data_cache: {
        Row: {
          id: string
          symbol: string
          data_type: string
          period: string | null
          report_date: string | null
          data: Json
          fetched_at: string
        }
        Insert: {
          id?: string
          symbol: string
          data_type: string
          period?: string | null
          report_date?: string | null
          data: Json
          fetched_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          data_type?: string
          period?: string | null
          report_date?: string | null
          data?: Json
          fetched_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          messages: Json
          context: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          messages?: Json
          context?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          messages?: Json
          context?: Json
          updated_at?: string
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
      user_role: 'owner' | 'admin' | 'user'
      subscription_tier: 'free' | 'basic' | 'pro' | 'premium'
      trading_mode: 'none' | 'paper' | 'live'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
